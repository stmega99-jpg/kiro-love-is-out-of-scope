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
  var endId = null;
  var savedOk = false;
  var fxExtra = null;
  var timers = [];
  var bgKey = '';
  var shownLines = 0;

  function tr(o) { return o[lang]; }
  function ui(key) { return K.UI[key][lang]; }

  function later(fn, ms) {
    var id = setTimeout(function () { fn(); }, ms);
    timers.push(id);
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

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

  function renderTitle() {
    $('t-title').textContent = ui('title');
    $('t-sub').textContent = ui('subtitle');
    $('t-tag').textContent = ui('tagline');
    $('btn-start').textContent = ui('start');
    $('t-sprite').innerHTML = '<svg viewBox="200 0 240 400" aria-hidden="true">' + K.kiroSvg({}, { x: 320, y: 18, scale: 0.93 }) + '</svg>';
  }

  function renderHud() {
    var s = game.state, L = s.layers;
    $('hud-day').textContent = ui('day') + ' ' + pad2(s.day) + ' / 10';
    var c = $('hud-credits');
    c.textContent = ui('credits') + ': ' + K.formatCredits(s.credits);
    c.classList.toggle('low', s.credits <= 50);
    var a = $('hud-affection');
    if (L.affectionUI === 'merge') {
      a.innerHTML = '<span class="aff-deleted">' + K.tombSvg(26, 29) + '<span>' + esc(ui('affection') + ': ' + ui('deleted')) + '</span></span>';
    } else if (L.affectionUI === 'rc') {
      a.innerHTML = '<span class="aff-label">⚙ ' + esc(ui('specCompletion')) + ': 100%</span><div class="bar bar-gold"><div class="bar-fill"></div></div>';
    } else {
      a.innerHTML = '<span class="aff-label">💗 ' + esc(ui('affection')) + ': ' + s.actualAffection + ' / 100</span><div class="bar bar-heart"><div class="bar-fill" style="width:' + s.actualAffection + '%"></div></div>';
    }
  }

  function renderSlots() {
    var L = game.state.layers, h;
    if (L.itemSlot === 'merge') h = K.tombSvg(40, 45) + '<span>' + esc(ui('itemDeleted')) + '</span>';
    else if (L.itemSlot === 'rc') h = K.cauldronSvg() + '<span>' + esc(ui('brewing')) + '</span>';
    else h = K.giftSvg() + '<span>' + esc(ui('giftSlot')) + '</span>';
    $('slot-item').innerHTML = h;

    var d = $('slot-date');
    d.classList.toggle('col', L.dateModule === 'rc');
    if (L.dateModule === 'merge') d.innerHTML = K.tombSvg(40, 45) + '<span>' + esc(ui('dateDeleted')) + '</span>';
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
    $('stage-kiro').className = 'stage-layer ' + c;
  }

  function renderStage() {
    var L = game.state.layers;
    var key = L.bgTheme + '|' + scene;
    if (key !== bgKey) {
      bgKey = key;
      $('stage-bg').innerHTML = K.stageSvg(K.bgInner(L.bgTheme, 'st', scene));
    }
    $('stage-kiro').innerHTML = kiroPresent ? K.stageSvg(K.kiroSvg(L, { expr: expr })) : '';
    var fx = '';
    if (!kiroPresent && awayNote) fx += '<div class="kiro-away">' + esc(ui('kiroAway')) + '</div>';
    if (mockOn) fx += '<div class="mock-bar" aria-label="mock"><span class="tag">' + esc(ui('mock')) + '</span><span class="aff-label">💗 ' + esc(ui('affection')) + ': 100 / 100</span><div class="bar bar-heart"><div class="bar-fill" style="width:100%"></div></div></div>';
    if (fxExtra === 'testlog') {
      fx += '<div class="test-log">' + K.ENDS[1].testLog.map(function (l) { return esc(tr(l)); }).join('<br>') + '</div>';
    } else if (fxExtra === 'code3') {
      fx += '<div class="code-log">$ build --target=final | 0 errors, 0 humans</div>';
    } else if (fxExtra === 'code4') {
      fx += '<div class="code-log">$ touch requirements.md</div>';
    }
    $('stage-fx').innerHTML = fx;
  }

  function lineHtml(l, i) {
    var cls = i >= shownLines ? ' new' : '';
    if (l.who === 'head') return '<div class="line head' + cls + '">' + ui('day') + ' ' + pad2(l.day) + ' / 10 — ' + esc(tr(l.title)) + '</div>';
    if (l.who === 'narr') return '<div class="line narr' + cls + '">' + rich(tr(l.t)) + '</div>';
    if (l.who === 'sys') return '<div class="line sys' + cls + '">' + esc(tr(l.t)) + '</div>';
    var name = l.who === 'kiro' ? 'Kiro' : ui('you');
    var usage = l.usage ? '<span class="usage">' + esc(ui('used')) + ': ' + K.formatCredits(l.usage.used) + ' | ' + esc(ui('elapsed')) + ': ' + l.usage.elapsed + 's</span>' : '';
    return '<div class="line ' + l.who + (l.joy ? ' joy' : '') + cls + '"><span class="who">' + esc(name) + '</span><span class="txt">' + rich(tr(l.t)) + '</span>' + usage + '</div>';
  }

  function renderLog() {
    var el = $('log');
    el.innerHTML = log.map(lineHtml).join('');
    shownLines = log.length;
    el.scrollTop = el.scrollHeight;
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
  }

  function renderResult() {
    var s = game.state, E = K.ENDS[endId];
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
    rows.forEach(function (r) { h += '<tr class="' + r[0] + '"><th scope="row">' + esc(r[1]) + '</th><td>' + esc(r[2]) + '</td></tr>'; });
    h += '</tbody></table><div class="kiro-comment">Kiro: ' + esc(tr(K.REPORT_COMMENT)) + '</div>';
    if (savedOk) h += '<p class="saved">✔ ' + esc(ui('saved')) + '</p>';
    h += '<div class="result-actions"><button type="button" class="primary" data-act="again">' + esc(ui('playAgain')) + '</button>' +
      '<button type="button" class="secondary" data-act="open-album">' + esc(ui('album')) + '</button>' +
      '<button type="button" class="secondary" data-act="to-title">' + esc(ui('toTitle')) + '</button></div>';
    $('result').innerHTML = h;
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
    endId = null; savedOk = false; fxExtra = null; bgKey = ''; shownLines = 0;
    setKiroClass('');
    show('game');
    goDay();
  }

  function goDay() {
    var d = K.DAYS[game.state.day - 1];
    if (!kiroPresent) { kiroPresent = true; awayNote = false; setKiroClass('kiro-in'); }
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
    var l = queue.shift();
    log.push(l);
    if (l.who === 'kiro') { expr = l.joy ? 'joy' : 'neutral'; sfx(l.joy ? 'sparkle' : 'click'); }
    if (l.leave) {
      setKiroClass('kiro-out');
      later(function () { kiroPresent = false; awayNote = true; setKiroClass(''); renderStage(); }, 850);
    }
    if (queue.length) {
      view = { type: 'next', onNext: showQueue };
    } else if (game.isExhausted()) {
      view = { type: 'none' };
      later(function () { triggerEnd(5); }, 1400);
    } else {
      view = { type: 'next', onNext: function () { expr = 'neutral'; startPr(); } };
    }
    renderGame();
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
    sfx(o === 'merge' ? 'thunk' : o === 'rc' ? 'magic' : 'click');
    if (pr.layer === 'bgmMode') K.audio.setMode(s.layers.bgmMode);
    if (res.endId === 3) {
      view = { type: 'none' };
      later(function () { triggerEnd(3); }, 1600);
    } else if (game.isExhausted()) {
      view = { type: 'none' };
      later(function () { triggerEnd(5); }, 1400);
    } else {
      view = { type: 'next', onNext: function () { game.advanceDay(); goDay(); } };
    }
    renderGame();
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
    scene = id === 1 ? 'park' : id === 3 ? 'tombs' : null;
    mockOn = id === 2;
    fxExtra = id === 1 ? 'testlog' : id === 3 ? 'code3' : id === 4 ? 'code4' : null;
    expr = id === 4 ? 'joy' : 'neutral';
    if (!kiroPresent && id !== 5) { kiroPresent = true; awayNote = false; }
    E.lines.forEach(function (l) {
      var o = {};
      for (var k in l) o[k] = l[k];
      if (id === 2 && l.who === 'kiro' && res) o.usage = res;
      log.push(o);
    });
    view = { type: 'none' };
    sfx(id === 3 ? 'thunk' : id === 5 ? 'click' : 'jingle');
    if (id === 3 || id === 5) K.audio.stopBgm();
    renderGame();

    var toResult = function () { view = { type: 'next', onNext: function () { show('result'); } }; renderActions(); };
    if (id === 5) {
      later(function () {
        sfx('vanish');
        setKiroClass('kiro-vanish');
        later(function () { kiroPresent = false; awayNote = false; setKiroClass(''); renderStage(); toResult(); }, 100);
      }, 1200);
    } else {
      later(toResult, 600);
    }
  }

  /* ---------- Events ---------- */
  D.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act], #btn-date') : null;
    if (!b) return;
    if (b.id === 'btn-date') { toast(ui('dateWarn')); sfx('buzz'); return; }
    var act = b.getAttribute('data-act');
    switch (act) {
      case 'choice': if (view.type === 'choices') choose(b.getAttribute('data-c')); break;
      case 'next': if (view.type === 'next') { sfx('click'); view.onNext(); } break;
      case 'pr': if (view.type === 'pr') choosePr(b.getAttribute('data-o')); break;
      case 'final': if (view.type === 'final') finalChoose(Number(b.getAttribute('data-n'))); break;
      case 'ears-tpl': $('ears-input').value = tr(K.EARS_TEMPLATE); view.text = tr(K.EARS_TEMPLATE); break;
      case 'ears-go': if (view.type === 'ears') resolvePr('rc', $('ears-input').value); break;
      case 'ears-back': view = { type: 'pr', pr: K.PRS[game.state.day - 1], auto: game.state.day === 8 }; renderActions(); break;
      case 'again': startGame(); break;
      case 'to-title': clearTimers(); show('title'); break;
      case 'open-album': show('album'); break;
      case 'album-back': show(prevScreen === 'album' ? 'title' : prevScreen); break;
      case 'album-clear':
        if (g.confirm(ui('albumClearConfirm'))) { K.History.clear(); renderAlbum(); }
        break;
      default: break;
    }
  });

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
      if (k === 'enter' || k === 'n') { hit = true; sfx('click'); view.onNext(); }
    }
    if (hit) { e.preventDefault(); if (D.activeElement && D.activeElement.blur) D.activeElement.blur(); }
  });

  // Test hook for manual debugging in the browser console.
  K.debug = { state: function () { return game && game.state; } };

  show('title');
}(window));
