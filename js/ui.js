'use strict';
(function (g) {
  var K = g.KLO, D = g.document;
  var T = K.T, esc = K.esc, rich = K.rich;

  function $(id) { return D.getElementById(id); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- State ---------- */
  var lang = (function () {
    try { var l = g.localStorage.getItem('klo.lang'); if (l === 'en' || l === 'ja') return l; } catch (e) { /* ignore */ }
    return /^ja/i.test(g.navigator.language || '') ? 'ja' : 'en';
  }());

  var screen = 'title';
  var prevScreen = 'title';
  var game = null;
  var log = [];
  var view = { type: 'none' };
  var queue = [];
  var expr = 'neutral';
  var kiroPresent = true;
  var kiroClass = '';
  var awayNote = false;
  var scene = null;
  var mockOn = false;
  var titleTimer = 0;      // the stamp's sound and shake; cancelled when the intro is cut short
  var titleFresh = true;   // the title intro plays on load and when coming back from a result, never on a language switch
  var resultFresh = false;   // true only for the first render after the ending, so a language switch never replays the reveal
  var endId = null;
  var savedOk = false;
  var fxExtra = null;
  var timers = [];
  var bgKey = '';
  var shownLines = 0;
  var kiroKey = '';
  var credit = { shown: null, target: null, raf: 0 };   // what the HUD currently displays / is heading to
  var dropLayer = null;   // layer whose tombstone should fall in on the next render only
  var TOMB_LAYERS = ['affectionUI', 'bgTheme', 'itemSlot', 'dateModule'];

  function tr(o) { return o[lang]; }
  function ui(key) { return K.UI[key][lang]; }

  function later(fn, ms) {
    var id = setTimeout(function () { fn(); }, ms);
    timers.push(id);
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; cancelTyping(); }

  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast.id);
    toast.id = setTimeout(function () { el.hidden = true; }, 2600);
  }

  /* ---------- Screens ---------- */
  function show(name) {
    if (name === 'album') prevScreen = screen === 'album' ? prevScreen : screen;
    screen = name;
    ['title', 'game', 'result', 'album'].forEach(function (s) { $('screen-' + s).hidden = s !== name; });
    $('app').setAttribute('data-screen', name);
    renderAll();
  }

  /* ---------- Rendering ---------- */
  function renderTop() {
    $('brand').textContent = ui('pageTitle');
    $('btn-album').textContent = '📖 ' + ui('album');
    $('btn-sound').textContent = K.audio.isEnabled() ? ui('soundOn') : ui('soundOff');
    $('btn-sound').setAttribute('aria-pressed', String(K.audio.isEnabled()));
    $('lang-en').classList.toggle('on', lang === 'en');
    $('lang-ja').classList.toggle('on', lang === 'ja');
    D.documentElement.lang = lang;
    D.title = ui('pageTitle');
  }

  // Little code screen next to Kiro. Shared by the title and the A / B "she keeps working" staging.
  function workPanelHtml() {
    var bars = '';
    for (var wi = 0; wi < 14; wi++) bars += '<i></i>';
    return '<div class="work-panel"><div class="work-code">' + bars + bars + '</div></div>';
  }

  function renderTitle() {
    $('t-title').textContent = ui('title');
    $('t-sub').textContent = ui('subtitle');
    $('t-tag').textContent = ui('tagline');
    $('btn-start').textContent = ui('start');
    // On the title she is already at work, eyes on the screen, next to an affection gauge that stays at 0.
    $('t-sprite').innerHTML = '<svg viewBox="200 0 240 400" aria-hidden="true">' + K.kiroSvg({}, { x: 320, y: 18, scale: 0.93, uid: 'tt', expr: 'work' }) + '</svg>' +
      workPanelHtml() +
      '<div class="title-gauge"><span class="aff-label">💗 ' + esc(ui('affection')) + ': 0 / 100</span><div class="bar bar-heart"><div class="bar-fill" style="width:0"></div></div></div>';
    var fresh = titleFresh && !reduceMotion;
    titleFresh = false;
    var card = D.querySelector('.title-card');
    card.classList.toggle('fresh', fresh);
    clearTimeout(titleTimer);   // a re-render (e.g. a language switch) ends the intro, so its sound and shake must not fire late
    if (fresh) {
      // The status stamp lands at ~1.3s.
      titleTimer = setTimeout(function () {
        if (screen !== 'title') return;
        sfx('thunk');
        var m = D.querySelector('main'); m.classList.add('thud');
        later(function () { m.classList.remove('thud'); }, 360);
      }, 1300);
    }
  }

  // Tombstone icon for the HUD / slots. `drop` plays the fall-and-dust animation once.
  function tombHtml(w, h, drop) {
    return '<span class="tomb-wrap">' + K.tombSvg(w, h, drop ? 'tomb-drop' : '') +
      (drop ? '<i class="dust" style="--dx:-14px"></i><i class="dust" style="--dx:0px"></i><i class="dust" style="--dx:14px"></i>' : '') + '</span>';
  }

  function paintCredits(v) {
    var c = $('hud-credits');
    c.textContent = ui('credits') + ': ' + K.formatCredits(v);
    c.classList.toggle('low', v <= 50);
  }

  // Big spends (Request Changes, the Day 10 order) count down on screen. The value never goes below the real balance.
  function syncCredits(target) {
    var c = $('hud-credits');
    if (target === credit.target && credit.raf) return;                      // already heading there
    if (target === credit.target) { if (credit.shown === target) paintCredits(target); else paintCredits(credit.shown); return; }
    cancelAnimationFrame(credit.raf); credit.raf = 0;
    var from = credit.shown;
    credit.target = target;
    if (from == null || reduceMotion || from - target < 1) { credit.shown = target; paintCredits(target); return; }
    var t0 = performance.now(), dur = 900;
    c.classList.remove('drain'); void c.offsetWidth; c.classList.add('drain');
    (function frame(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      credit.shown = k >= 1 ? target : Math.max(target, from - (from - target) * e);
      paintCredits(credit.shown);
      if (k < 1) credit.raf = requestAnimationFrame(frame);
      else { credit.raf = 0; c.classList.remove('drain'); }
    }(t0));
  }

  function renderHud() {
    var s = game.state, L = s.layers;
    $('hud-day').textContent = ui('day') + ' ' + pad2(s.day) + ' / 10';
    syncCredits(s.credits);
    var a = $('hud-affection');
    if (L.affectionUI === 'merge') {
      a.innerHTML = '<span class="aff-deleted">' + tombHtml(26, 29, dropLayer === 'affectionUI') + '<span>' + esc(ui('affection') + ': ' + ui('deleted')) + '</span></span>';
    } else if (L.affectionUI === 'rc') {
      a.innerHTML = '<span class="aff-label">⚙ ' + esc(ui('specCompletion')) + ': 100%</span><div class="bar bar-gold"><div class="bar-fill"></div></div>';
    } else {
      a.innerHTML = '<span class="aff-label">💗 ' + esc(ui('affection')) + ': ' + s.actualAffection + ' / 100</span><div class="bar bar-heart"><div class="bar-fill" style="width:' + s.actualAffection + '%"></div></div>';
    }
  }

  function renderSlots() {
    var L = game.state.layers, h;
    if (L.itemSlot === 'merge') h = tombHtml(40, 45, dropLayer === 'itemSlot') + '<span>' + esc(ui('itemDeleted')) + '</span>';
    else if (L.itemSlot === 'rc') h = K.cauldronSvg() + '<span>' + esc(ui('brewing')) + '</span>';
    else h = K.giftSvg() + '<span>' + esc(ui('giftSlot')) + '</span>';
    $('slot-item').innerHTML = h;

    var d = $('slot-date');
    d.classList.toggle('col', L.dateModule === 'rc');
    if (L.dateModule === 'merge') d.innerHTML = tombHtml(40, 45, dropLayer === 'dateModule') + '<span>' + esc(ui('dateDeleted')) + '</span>';
    else if (L.dateModule === 'rc') d.innerHTML = '<span class="slot-title">📜 ' + esc(ui('dateEars')) + '</span><div class="date-ears">' + esc(game.state.earsText) + '</div>';
    else d.innerHTML = '<button type="button" class="date-btn" id="btn-date">⚠️ ' + esc(ui('dateBtn')) + '</button>';
  }

  function renderInspector() {
    var s = game.state, h = '<span class="slot-title">' + esc(ui('layers')) + '</span>';
    K.LAYER_IDS.forEach(function (id, i) {
      var st = s.layers[id], pr = K.PRS[i];
      h += '<div class="row' + (s.day === i + 1 ? ' cur' : '') + '" title="' + esc(tr(pr.effect[st])) + '"><span class="nm">' + id + '</span><span class="st">' + K.LAYER_ICONS[id][st] + ' ' + st + '</span></div>';
    });
    $('inspector').innerHTML = h;
  }

  function setKiroClass(c) {
    kiroClass = c;
    var el = $('stage-kiro');
    el.className = 'stage-layer';
    void el.offsetWidth;   // force a reflow so the same animation can play again on a later day
    el.className = 'stage-layer ' + c;
  }

  function renderStage() {
    var L = game.state.layers;
    var key = L.bgTheme + '|' + scene;
    if (key !== bgKey) {
      bgKey = key;
      $('stage-bg').innerHTML = K.stageSvg(K.bgInner(L.bgTheme, 'st', scene, dropLayer === 'bgTheme'));
    }
    var kk = [kiroPresent, expr, L.costumeBody, L.costumeHead].join('|');
    if (kk !== kiroKey) {
      kiroKey = kk;
      $('stage-kiro').innerHTML = kiroPresent ? K.stageSvg(K.kiroSvg(L, { expr: expr, uid: 'st' })) : '';
    }
    var fx = '';
    if (!kiroPresent && awayNote) fx += '<div class="kiro-away">' + esc(ui('kiroAway')) + '</div>';
    if (expr === 'work' && kiroPresent) fx += workPanelHtml();
    if (mockOn) fx += '<div class="mock-bar" aria-label="mock"><span class="tag">' + esc(ui('mock')) + '</span><span class="aff-label">💗 ' + esc(ui('affection')) + ': 100 / 100</span><div class="bar bar-heart"><div class="bar-fill" style="width:100%"></div></div></div>';
    if (fxExtra === 'testlog') {
      var tl = K.ENDS[1].testLog;
      // The last line is the punchline ("Participants: 0 ..."), so it is emphasised.
      fx += '<div class="test-log">' + tl.map(function (l, i) {
        return i === tl.length - 1 ? '<span class="gag">' + esc(tr(l)) + '</span>' : esc(tr(l));
      }).join('<br>') + '</div>';
    } else if (fxExtra === 'code3') {
      fx += '<div class="code-log">$ build --target=final | 0 errors, 0 humans</div>';
    } else if (fxExtra === 'code4') {
      fx += '<div class="code-log">$ touch requirements.md</div>';
    }
    $('stage-fx').innerHTML = fx;
    // Ending scenes with a text overlay take over the stage (the wide layout hides the corner panels).
    var col = $('stage').parentNode;
    col.classList.toggle('ending', !!fxExtra);
    col.classList.toggle('ending-testlog', fxExtra === 'testlog');
  }

  function lineHtml(l, i) {
    var cls = i >= shownLines ? ' new' : '';
    if (l.who === 'head') return '<div class="line head' + cls + '">' + ui('day') + ' ' + pad2(l.day) + ' / 10 — ' + esc(tr(l.title)) + '</div>';
    if (l.who === 'narr') return '<div data-i="' + i + '" class="line narr' + cls + '"><span class="txt">' + rich(tr(l.t)) + '</span></div>';
    if (l.who === 'sys') return '<div class="line sys' + cls + '">' + esc(tr(l.t)) + '</div>';
    var name = l.who === 'kiro' ? 'Kiro' : ui('you');
    var usage = l.usage ? '<span class="usage">' + esc(ui('used')) + ': ' + K.formatCredits(l.usage.used) + ' | ' + esc(ui('elapsed')) + ': ' + l.usage.elapsed + 's</span>' : '';
    return '<div data-i="' + i + '" class="line ' + l.who + (l.joy ? ' joy' : '') + cls + '"><span class="who">' + esc(name) + '</span><span class="txt">' + rich(tr(l.t)) + '</span>' + usage + '</div>';
  }

  /* ---------- Typewriter ---------- */
  // Only lines appended since the last render are typed. Any other re-render (language switch, etc.) shows text at once.
  var tw = { active: false, timer: null, items: [], i: 0, pos: 0, waiters: [] };
  var reduceMotion = !!(g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function textNodes(root) {
    var out = [], w = D.createTreeWalker(root, 4), n;
    while ((n = w.nextNode())) out.push(n);
    return out;
  }

  function cancelTyping() {
    if (tw.timer) clearTimeout(tw.timer);
    tw.timer = null; tw.active = false; tw.items = []; tw.waiters = [];
  }

  // Show everything that is still hidden and release anything waiting for the typing to end.
  function finishTyping() {
    if (!tw.active) return;
    if (tw.timer) clearTimeout(tw.timer);
    tw.timer = null;
    tw.items.slice(tw.i).forEach(function (it) {
      if (!it.started) { it.started = true; lineFx(it.idx); }
      it.nodes.forEach(function (n, k) { n.nodeValue = it.full[k]; });
      reveal(it);
    });
    tw.active = false; tw.items = [];
    var w = tw.waiters; tw.waiters = [];
    w.forEach(function (fn) { fn(); });
  }

  function whenTyped(fn) { if (tw.active) tw.waiters.push(fn); else fn(); }

  function reveal(it) {
    var u = it.line.querySelector('.usage');
    if (u) u.style.visibility = '';
  }

  function lineFx(idx) {
    var l = log[idx];
    if (!l) return;
    if (l.mock) {   // END 2: the fake 100 / 100 bar pops in with a fanfare
      mockOn = true;
      sfx('jingle');
      renderStage();
    }
    if (l.endScene || l.endFx) {   // END 1 / 3 / 4: scene change and overlay log
      if (l.endScene) scene = l.endScene;
      if (l.endFx) fxExtra = l.endFx;
      renderStage();
    }
    if (l.cue) sfx(l.cue);
    if (l.stopBgm) K.audio.stopBgm();
    if (!l.reacts) return;
    expr = l.joy ? 'joy' : 'work';
    sfx(l.joy ? 'sparkle' : 'click');
    if (l.joy && endId === 4) sfx('jingle');
    if (l.joy) { setKiroClass('kiro-joy'); burst(); }
    renderStage();
  }

  var PAUSE = { '。': 170, '！': 150, '？': 150, '…': 150, '、': 80, '.': 150, '!': 150, '?': 150, ',': 80 };

  function startTyping(lines) {
    cancelTyping();
    var items = [];
    lines.forEach(function (line) {
      var txt = line.querySelector('.txt');
      if (!txt) return;
      var nodes = textNodes(txt), full = nodes.map(function (n) { return n.nodeValue; });
      var total = full.join('').length;
      if (!total) return;
      nodes.forEach(function (n) { n.nodeValue = ''; });
      var u = line.querySelector('.usage');
      if (u) u.style.visibility = 'hidden';
      items.push({ line: line, nodes: nodes, full: full, joined: full.join(''), total: total, idx: Number(line.getAttribute('data-i')), started: false, fast: /\bjoy\b/.test(line.className) });
    });
    if (!items.length) return;
    tw.active = true; tw.items = items; tw.i = 0; tw.pos = 0;
    var log = $('log');
    (function step() {
      var it = tw.items[tw.i];
      if (!it) { finishTyping(); return; }
      // type one character across the line's text nodes
      tw.pos += 1;
      if (!it.started) { it.started = true; lineFx(it.idx); }
      var left = tw.pos, ch = it.joined.charAt(tw.pos - 1);
      it.nodes.forEach(function (n, k) {
        n.nodeValue = it.full[k].slice(0, Math.max(0, left));
        left -= it.full[k].length;
      });
      log.scrollTop = log.scrollHeight;
      var base = Math.max(8, Math.min(lang === 'ja' ? 42 : 22, 2400 / it.total)) * (it.fast ? 0.55 : 1);
      var d = base + (PAUSE[ch] || 0);
      if (tw.pos >= it.total) { reveal(it); tw.i += 1; tw.pos = 0; d = 260; }
      tw.timer = setTimeout(step, d);
    }());
  }

  function renderLog() {
    var el = $('log');
    finishTyping();
    var firstNew = shownLines;
    el.innerHTML = log.map(lineHtml).join('');
    shownLines = log.length;
    el.scrollTop = el.scrollHeight;
    var lines = el.children, fresh = [];
    for (var i = firstNew; i < lines.length; i++) {
      if (/\b(kiro|player|narr)\b/.test(lines[i].className)) fresh.push(lines[i]);
    }
    if (reduceMotion) { fresh.forEach(function (ln) { lineFx(Number(ln.getAttribute('data-i'))); }); return; }
    startTyping(fresh);
  }

  function kbd(label) {
    return game.state.layers.playerInput === 'rc' ? '<kbd>' + esc(label) + '</kbd>' : '';
  }

  function renderActions() {
    var el = $('actions'), h = '', s = game.state, fast = s.layers.playerInput === 'rc';
    switch (view.type) {
      case 'choices':
        ['A', 'B', 'C'].forEach(function (c, i) {
          var ch = K.DAYS[s.day - 1].choices[c];
          h += '<button type="button" class="opt" data-act="choice" data-c="' + c + '"><span><span class="key">' + c + '</span>' + esc(tr(ch.player)) + kbd(String(i + 1)) + '</span><span class="est">' + esc(ui('estTalk')) + '</span></button>';
        });
        break;
      case 'next':
        h += '<button type="button" class="primary" data-act="next">' + esc(ui('next')) + (fast ? '<kbd>Enter</kbd>' : '') + '</button>';
        break;
      case 'pr':
        h += renderPr(view.pr, fast);
        break;
      case 'ears':
        h += '<div class="ears-box"><strong>' + esc(ui('earsTitle')) + '</strong><p class="hint">' + esc(ui('earsHelp')) + '</p>' +
          '<textarea id="ears-input" rows="3" spellcheck="false" aria-label="' + esc(ui('earsTitle')) + '">' + esc(view.text || '') + '</textarea>' +
          '<div class="ears-actions"><button type="button" class="secondary" data-act="ears-tpl">' + esc(ui('earsTemplate')) + '</button>' +
          '<button type="button" class="primary" data-act="ears-go"' + (game.canOrder() ? '' : ' disabled') + '>' + esc(ui('earsSubmit')) + ' — ' + esc(ui('estRc')) + '</button>' +
          '<button type="button" class="secondary" data-act="ears-back">' + esc(ui('earsCancel')) + '</button></div></div>';
        break;
      case 'final':
        K.FINAL_CHOICES.forEach(function (fc) {
          var locked = fc.requires && !game.dateAvailable();
          h += '<button type="button" class="opt" data-act="final" data-n="' + fc.n + '"' + (locked ? ' disabled' : '') + '><span><span class="key">' + fc.n + '</span>' + esc(tr(fc.text)) + kbd(String(fc.n)) +
            (locked ? '<span class="note">' + esc(ui('dateLocked')) + '</span>' : '') + '</span><span class="est">' + esc(tr(fc.cost)) + '</span></button>';
        });
        break;
      default:
        break;
    }
    if (fast && (view.type === 'choices' || view.type === 'pr' || view.type === 'final' || view.type === 'next')) h += '<div class="hint">⚡ ' + esc(ui('fastUi')) + '</div>';
    el.innerHTML = h;
    var ta = $('ears-input');
    if (ta && view.focus) { ta.focus(); view.focus = false; }
  }

  function renderPr(pr, fast) {
    var s = game.state, order = ['merge', 'close', 'rc'];
    var keys = { merge: 'M', close: 'C', rc: 'R' };
    var cost = { merge: ui('free'), close: ui('free'), rc: ui('estRc') };
    var name = { merge: ui('merge'), close: ui('close'), rc: ui('rc') };
    var h = '<div class="pr-card"><span class="pr-badge' + (view.auto ? ' auto' : '') + '">' + (view.auto ? esc(ui('prAuto')) + ' · ' : '') + 'PR #' + pr.id + ' · ' + pr.layer + '</span>' +
      '<h3>' + esc(tr(pr.title)) + '</h3><p class="reason">' + esc(tr(pr.reason)) + '</p><div class="pr-opts">';
    order.forEach(function (o, i) {
      var st = o === 'close' ? 'initial' : o;
      var dis = o === 'rc' && !game.canOrder();
      h += '<button type="button" class="opt" data-act="pr" data-o="' + o + '"' + (dis ? ' disabled' : '') + '><span><span class="key">' + esc(name[o]) + '</span>' + (fast ? kbd(keys[o] + ' / ' + (i + 1)) : '') +
        '<span class="note">' + K.LAYER_ICONS[pr.layer][st] + ' ' + esc(tr(pr.effect[st])) + '</span></span><span class="est">' + esc(cost[o]) + '</span></button>';
    });
    return h + '</div></div>';
  }

  function applyFrame() {
    $('dialog').className = 'dialog frame-' + game.state.layers.windowFrame;
  }

  function renderGame() {
    renderHud(); renderSlots(); renderInspector(); renderStage(); renderLog(); renderActions(); applyFrame();
    dropLayer = null;
  }

  /* ---------- Staging for the gags ---------- */
  var SPARK_POS = [[34, 24], [62, 20], [28, 42], [70, 38], [46, 14], [56, 30], [22, 30], [76, 26], [40, 36], [66, 48]];
  function burst() {
    var h = '';
    $('stage-glow').innerHTML = '<div class="joy-glow"></div>';   // behind Kiro, so it never washes her out
    SPARK_POS.forEach(function (p, i) {
      h += '<span class="spark" style="left:' + p[0] + '%;top:' + p[1] + '%;--t:' + (i * 0.09).toFixed(2) + 's;--sz:' + (14 + (i % 3) * 6) + 'px">✦</span>';
    });
    $('stage-burst').innerHTML = h;
    later(function () { $('stage-burst').innerHTML = ''; $('stage-glow').innerHTML = ''; }, 2800);
  }

  // The tombstone lands ~0.42s after the PR is merged: sound and a small screen shake on impact.
  function thud() {
    later(function () {
      sfx('thunk');
      var m = D.querySelector('main');
      m.classList.add('thud');
      later(function () { m.classList.remove('thud'); }, 360);
    }, 420);
  }

  function renderResult() {
    var s = game.state, E = K.ENDS[endId];
    var anim = resultFresh && !reduceMotion; resultFresh = false;
    var nm = E.name + (lang === 'ja' ? '（' + E.nameJa + '）' : '');
    var rows = [
      ['aff', ui('rAffection'), String(s.actualAffection)],
      ['', ui('rRomance'), '0%'],
      ['', ui('rTest'), '100%'],
      ['', ui('rQuality'), 'A+'],
      ['', ui('rProgress'), '100%']
    ];
    var h = '<div class="end-tag">' + esc(ui('endLabel')) + ' ' + endId + '</div><h2>' + esc(nm) + '</h2>';
    h += '<div class="result-preview">' + K.miniStage(s.layers, 'rs') + '</div>';
    if (endId === 5) h += '<div class="saved">🕯 ' + esc(ui('lastSeen')) + '</div>';
    h += '<h3>' + esc(ui('reportTitle')) + '</h3><table class="report"><tbody>';
    rows.forEach(function (r, i) {
      var stamp = endId === 2 && r[0] === 'aff';
      h += '<tr class="' + r[0] + (anim ? ' rv' : '') + (anim && stamp ? ' stamp' : '') + '" style="--d:' + (0.35 + i * 0.5).toFixed(2) + 's"><th scope="row">' + esc(r[1]) + '</th><td>' +
        (stamp ? '<span class="stampv' + (anim ? ' play' : '') + '">' + esc(r[2]) + '</span>' : esc(r[2])) + '</td></tr>';
    });
    h += '</tbody></table><div class="kiro-comment' + (anim ? ' rv-last' : '') + '">Kiro: ' + esc(tr(K.REPORT_COMMENT)) + '</div>';
    if (savedOk) h += '<p class="saved">✔ ' + esc(ui('saved')) + '</p>';
    h += '<div class="result-actions"><button type="button" class="primary" data-act="again">' + esc(ui('playAgain')) + '</button>' +
      '<button type="button" class="secondary" data-act="open-album">' + esc(ui('album')) + '</button>' +
      '<button type="button" class="secondary" data-act="to-title">' + esc(ui('toTitle')) + '</button></div>';
    $('result').innerHTML = h;
    if (anim && endId === 2) {
      // The affection row stamps down at ~0.77s. Heavy thud and a small shake on impact.
      later(function () {
        if (screen !== 'result') return;
        sfx('thunk');
        var m = D.querySelector('main'); m.classList.add('thud');
        later(function () { m.classList.remove('thud'); }, 360);
      }, 770);
    }
  }

  function renderAlbum() {
    var list = K.History.load();
    var h = '<div class="album-head"><h2>📖 ' + esc(ui('album')) + '</h2><div><button type="button" class="secondary" data-act="album-back">' + esc(ui('back')) + '</button> ' +
      '<button type="button" class="secondary" data-act="album-clear"' + (list.length ? '' : ' disabled') + '>' + esc(ui('albumClear')) + '</button></div></div>';
    if (!list.length) h += '<p>' + esc(ui('albumEmpty')) + '</p>';
    else {
      h += '<div class="album-grid">';
      list.forEach(function (r, i) {
        var E = K.ENDS[r.endId] || { name: '?', nameJa: '?' };
        var when = '';
        try { when = new Date(r.at).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US'); } catch (e) { when = ''; }
        h += '<div class="card' + (r.vanished ? ' vanished' : '') + '">' + K.miniStage(r.layers, 'al' + i, { expr: r.endId === 4 ? 'joy' : 'neutral' }) +
          '<div class="meta"><b>END ' + r.endId + ': ' + esc(E.name) + '</b>' + (lang === 'ja' ? esc(E.nameJa) + '<br>' : '') +
          esc(when) + '<br>' + esc(ui('day')) + ' ' + pad2(r.day) + ' · ' + esc(ui('credLeft')) + ': ' + K.formatCredits(r.credits) +
          (r.vanished ? '<br><span class="ghost">🕯 ' + esc(ui('lastSeen')) + '</span>' : '') + '</div></div>';
      });
      h += '</div>';
    }
    $('album').innerHTML = h;
  }

  function renderAll() {
    renderTop();
    if (screen === 'title') renderTitle();
    else if (screen === 'game' && game) renderGame();
    else if (screen === 'result' && game) renderResult();
    else if (screen === 'album') renderAlbum();
  }

  /* ---------- Flow ---------- */
  function sfx(n) { K.audio.sfx(n); }

  function startGame() {
    clearTimers();
    K.audio.unlock();
    K.audio.setMode('initial');
    game = K.createGame();
    log = []; queue = []; expr = 'neutral'; kiroPresent = true; awayNote = false; scene = null; mockOn = false;
    endId = null; savedOk = false; fxExtra = null; bgKey = ''; shownLines = 0; kiroKey = ''; dropLayer = null;
    cancelAnimationFrame(credit.raf); credit.raf = 0; credit.shown = null; credit.target = null; resultFresh = false;
    $('stage-burst').innerHTML = ''; $('stage-glow').innerHTML = '';
    setKiroClass('');
    show('game');
    goDay();
  }

  function goDay() {
    var d = K.DAYS[game.state.day - 1];
    if (!kiroPresent) { kiroPresent = true; awayNote = false; setKiroClass('kiro-in'); }
    else if (kiroClass === 'kiro-out') setKiroClass('');   // fast input: the exit animation never got to finish
    expr = 'neutral';
    log.push({ who: 'head', day: d.n, title: d.title });
    log.push({ who: 'narr', t: d.intro });
    view = { type: d.n === 10 ? 'final' : 'choices' };
    renderGame();
  }

  function choose(c) {
    var s = game.state, ch = K.DAYS[s.day - 1].choices[c];
    log.push({ who: 'player', t: ch.player });
    var r = game.talk();
    var lastK = -1;
    ch.reply.forEach(function (l, i) { if (l.who === 'kiro') lastK = i; });
    queue = ch.reply.map(function (l, i) {
      var o = {};
      for (var k in l) o[k] = l[k];
      if (c === 'C' && l.who === 'kiro') o.joy = true;
      if (i === lastK) o.usage = r;
      return o;
    });
    sfx('click');
    showQueue();
  }

  function showQueue() {
    var after = null;
    var l = queue.shift();
    log.push(l);
    // A / B: she keeps working with her eyes on the screen. C: the only time she lights up.
    // The reaction fires when her line starts to appear, not while the player's line is still typing.
    if (l.who === 'kiro') l.reacts = true;
    if (l.leave) {
      setKiroClass('kiro-out');
      var leaveDay = game.state.day;
      // Ignore the timer if the player already moved past this day (fast input) and Kiro has returned.
      later(function () {
        if (game.state.day !== leaveDay) return;
        kiroPresent = false; awayNote = true; setKiroClass(''); renderStage();
      }, 850);
    }
    if (queue.length) {
      view = { type: 'next', onNext: showQueue };
    } else if (game.isExhausted()) {
      view = { type: 'none' };
      after = function () { later(function () { triggerEnd(5); }, 1400); };
    } else {
      view = { type: 'next', onNext: function () { expr = 'neutral'; startPr(); } };
    }
    renderGame();
    if (after) whenTyped(after);   // registered after renderGame, which is what starts the typing
  }

  function startPr() {
    var s = game.state, pr = K.PRS[s.day - 1];
    log.push({ who: 'sys', t: T('🔔 PR #' + pr.id + ' opened: ' + pr.title.en, '🔔 PR #' + pr.id + ' が作成されました: ' + pr.title.ja) });
    view = { type: 'pr', pr: pr, auto: s.day === 8 };
    sfx('notify');
    renderGame();
  }

  var OPT_NAME = { merge: 'Merge', close: 'Close', rc: 'Request Changes' };

  function choosePr(o) {
    var s = game.state;
    if (s.day === 7 && o === 'rc') {
      view = { type: 'ears', text: view.text || '', focus: true };
      renderActions();
      return;
    }
    resolvePr(o, '');
  }

  function resolvePr(o, ears) {
    var s = game.state, pr = K.PRS[s.day - 1];
    var res = game.resolvePR(o, ears);
    if (res.error) {
      log.push({ who: 'kiro', t: K.EARS_ERRORS[res.error] });
      view = { type: 'ears', text: ears, focus: true };
      sfx('buzz');
      renderGame();
      return;
    }
    log.push({ who: 'sys', t: T(ui_en('chose') + ': ' + OPT_NAME[o], ui_ja('chose') + ': ' + OPT_NAME[o]) });
    log.push({ who: 'kiro', t: pr.confirm[o], usage: o === 'rc' ? res : null });
    expr = 'neutral';
    if (o === 'merge' && TOMB_LAYERS.indexOf(pr.layer) >= 0) { dropLayer = pr.layer; thud(); }
    else sfx(o === 'merge' ? 'thunk' : o === 'rc' ? 'magic' : 'click');
    if (pr.layer === 'bgmMode') K.audio.setMode(s.layers.bgmMode);
    var after = null;
    if (res.endId === 3) {
      view = { type: 'none' };
      after = function () { later(function () { triggerEnd(3); }, 1600); };
    } else if (game.isExhausted()) {
      view = { type: 'none' };
      after = function () { later(function () { triggerEnd(5); }, 1400); };
    } else {
      view = { type: 'next', onNext: function () { game.advanceDay(); goDay(); } };
    }
    renderGame();
    if (after) whenTyped(after);
  }
  function ui_en(k) { return K.UI[k].en; }
  function ui_ja(k) { return K.UI[k].ja; }

  function finalChoose(n) {
    var fc = K.FINAL_CHOICES[n - 1];
    if (fc.requires && !game.dateAvailable()) return;
    log.push({ who: 'player', t: fc.text });
    var res = game.finalChoice(n);
    triggerEnd(res.endId, res);
  }

  function triggerEnd(id, res) {
    var s = game.state;
    if (s.ended !== id) game.exhaust();
    endId = id;
    // Record before anything can disappear (END 5: Kiro vanishes after this).
    savedOk = K.History.add(game.snapshot({ id: 'r' + Date.now() + '-' + Math.floor(Math.random() * 1e6), at: Date.now(), endId: id, vanished: id === 5 }));

    var E = K.ENDS[id];
    scene = null;     // END 1 / 3: the scene, overlay and sound come with the line that triggers them (see lineFx)
    mockOn = false;   // END 2: the mock bar appears when Kiro's line starts (see lineFx)
    fxExtra = null;
    expr = 'neutral'; // END 4: she lights up when her own line starts (see lineFx)
    if (!kiroPresent && id !== 5) { kiroPresent = true; awayNote = false; }
    E.lines.forEach(function (l) {
      var o = {};
      for (var k in l) o[k] = l[k];
      if (id === 2 && l.who === 'kiro') { o.mock = true; if (res) o.usage = res; }
      if (id === 1 && l.who === 'kiro') { o.endScene = 'park'; o.endFx = 'testlog'; o.cue = 'jingle'; }
      if (id === 3) { o.endScene = 'tombs'; o.endFx = 'code3'; o.cue = 'thunk'; o.stopBgm = true; }
      if (id === 4 && l.who === 'kiro') { o.reacts = true; o.endFx = 'code4'; }   // l.joy is already set in the data
      log.push(o);
    });
    view = { type: 'none' };
    if (id === 5) K.audio.stopBgm();   // END 5 has no player line in front of it
    renderGame();

    var toResult = function () { view = { type: 'next', onNext: function () { resultFresh = true; show('result'); } }; renderActions(); };
    whenTyped(function () {
      if (id === 5) {
        later(function () {
          sfx('vanish');
          setKiroClass('kiro-vanish');
          later(function () { kiroPresent = false; awayNote = false; setKiroClass(''); renderStage(); toResult(); }, 100);
        }, 1200);
      } else {
        later(toResult, 600);
      }
    });
  }

  /* ---------- Events ---------- */
  D.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act], #btn-date') : null;
    if (!b) return;
    if (b.id === 'btn-date') { toast(ui('dateWarn')); sfx('buzz'); return; }
    var act = b.getAttribute('data-act');
    switch (act) {
      case 'choice': if (view.type === 'choices') choose(b.getAttribute('data-c')); break;
      case 'next': if (view.type === 'next') { if (tw.active) { finishTyping(); break; } sfx('click'); view.onNext(); } break;
      case 'pr': if (view.type === 'pr') choosePr(b.getAttribute('data-o')); break;
      case 'final': if (view.type === 'final') finalChoose(Number(b.getAttribute('data-n'))); break;
      case 'ears-tpl': $('ears-input').value = tr(K.EARS_TEMPLATE); view.text = tr(K.EARS_TEMPLATE); break;
      case 'ears-go': if (view.type === 'ears') resolvePr('rc', $('ears-input').value); break;
      case 'ears-back': view = { type: 'pr', pr: K.PRS[game.state.day - 1], auto: game.state.day === 8 }; renderActions(); break;
      case 'again': startGame(); break;
      case 'to-title': clearTimers(); titleFresh = true; show('title'); break;
      case 'open-album': show('album'); break;
      case 'album-back': show(prevScreen === 'album' ? 'title' : prevScreen); break;
      case 'album-clear':
        if (g.confirm(ui('albumClearConfirm'))) { K.History.clear(); renderAlbum(); }
        break;
      default: break;
    }
  });

  $('log').addEventListener('click', finishTyping);

  D.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'ears-input') view.text = e.target.value;
  });

  $('btn-start').addEventListener('click', startGame);
  $('btn-album').addEventListener('click', function () { K.audio.unlock(); show('album'); });
  $('btn-sound').addEventListener('click', function () {
    K.audio.setEnabled(!K.audio.isEnabled());
    renderTop();
  });
  function setLang(l) {
    // An untouched template follows the language switch; user-edited text is kept.
    if (view.type === 'ears' && view.text === K.EARS_TEMPLATE[lang]) view.text = K.EARS_TEMPLATE[l];
    lang = l;
    try { g.localStorage.setItem('klo.lang', l); } catch (e) { /* ignore */ }
    renderAll();
  }
  $('lang-en').addEventListener('click', function () { setLang('en'); });
  $('lang-ja').addEventListener('click', function () { setLang('ja'); });

  // Fast order UI (playerInput = rc).
  D.addEventListener('keydown', function (e) {
    if (screen !== 'game' || !game || game.state.layers.playerInput !== 'rc') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName;
    if (t === 'TEXTAREA' || t === 'INPUT') return;
    var k = String(e.key).toLowerCase(), hit = false;
    if (view.type === 'choices') {
      var m = { a: 'A', b: 'B', c: 'C', '1': 'A', '2': 'B', '3': 'C' }[k];
      if (m) { hit = true; choose(m); }
    } else if (view.type === 'final') {
      var n = { '1': 1, '2': 2, '3': 3 }[k];
      if (n && !(K.FINAL_CHOICES[n - 1].requires && !game.dateAvailable())) { hit = true; finalChoose(n); }
    } else if (view.type === 'pr') {
      var o = { m: 'merge', c: 'close', r: 'rc', '1': 'merge', '2': 'close', '3': 'rc' }[k];
      if (o && !(o === 'rc' && !game.canOrder())) { hit = true; choosePr(o); }
    } else if (view.type === 'next') {
      if (k === 'enter' || k === 'n') { hit = true; if (tw.active) finishTyping(); else { sfx('click'); view.onNext(); } }
    }
    if (hit) { e.preventDefault(); if (D.activeElement && D.activeElement.blur) D.activeElement.blur(); }
  });

  // Test hook for manual debugging in the browser console.
  K.debug = { state: function () { return game && game.state; } };

  show('title');
}(window));
