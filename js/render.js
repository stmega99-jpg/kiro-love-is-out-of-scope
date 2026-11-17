'use strict';
(function (g) {
  var K = g.KLO = g.KLO || {};

  K.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // Escaped text with `code` spans.
  K.rich = function (s) {
    return K.esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  };

  function rand(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* ---------- Tombstone ---------- */
  function tomb(x, y, s, label) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      '<ellipse cx="0" cy="2" rx="32" ry="6" fill="#000" opacity=".45"/>' +
      '<path d="M-22 0 L-22 -44 Q-22 -68 0 -68 Q22 -68 22 -44 L22 0 Z" fill="#8c919b" stroke="#50545c" stroke-width="3"/>' +
      '<path d="M0 -58 V-36 M-8 -49 H8" stroke="#50545c" stroke-width="3" stroke-linecap="round"/>' +
      (label === false ? '' : '<text x="0" y="-14" text-anchor="middle" font-size="10" font-family="serif" fill="#50545c">R.I.P</text>') +
      '</g>';
  }

  /* ---------- Backgrounds (inner SVG, viewBox 0 0 640 400) ---------- */
  function bgSpring(u) {
    var r = rand(7), out = '';
    out += '<defs><linearGradient id="' + u + 'sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeaf4"/><stop offset="1" stop-color="#dce9ff"/></linearGradient></defs>';
    out += '<rect width="640" height="400" fill="url(#' + u + 'sp)"/>';
    out += '<circle cx="540" cy="70" r="34" fill="#fff6d8" opacity=".9"/>';
    [[70, 250], [210, 270], [440, 255], [580, 275]].forEach(function (p) {
      out += '<rect x="' + (p[0] - 7) + '" y="' + p[1] + '" width="14" height="110" fill="#b88a86"/>';
      out += '<circle cx="' + p[0] + '" cy="' + (p[1] - 6) + '" r="62" fill="#ffc6dc"/><circle cx="' + (p[0] - 34) + '" cy="' + (p[1] + 14) + '" r="40" fill="#ffd6e6"/><circle cx="' + (p[0] + 36) + '" cy="' + (p[1] + 10) + '" r="42" fill="#ffd0e2"/>';
    });
    out += '<rect y="345" width="640" height="55" fill="#f7cadc"/>';
    for (var i = 0; i < 24; i++) {
      var x = Math.round(r() * 620), d = (6 + r() * 6).toFixed(1), t = (-r() * 10).toFixed(1), rot = Math.round(r() * 200);
      out += '<g class="petal" style="--x:' + x + 'px;--d:' + d + 's;--t:' + t + 's"><ellipse rx="6" ry="3.4" fill="#ffadc9" transform="rotate(' + rot + ')"/></g>';
    }
    return out;
  }

  function bgDark(u) {
    var out = '';
    out += '<defs><linearGradient id="' + u + 'dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07070a"/><stop offset="1" stop-color="#14141b"/></linearGradient></defs>';
    out += '<rect width="640" height="400" fill="url(#' + u + 'dk)"/>';
    out += '<rect y="350" width="640" height="2" fill="#2a2a35"/>';
    out += tomb(110, 372, 1.5);
    // blossoms stopped: dim petals resting on the floor
    [[200, 392], [260, 388], [380, 394], [470, 389], [540, 393]].forEach(function (p) {
      out += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="6" ry="3" fill="#4a3340" transform="rotate(' + (p[0] % 50) + ' ' + p[0] + ' ' + p[1] + ')"/>';
    });
    return out;
  }

  function bgHalloween(u) {
    var r = rand(31), out = '';
    out += '<defs><linearGradient id="' + u + 'hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150a2a"/><stop offset=".7" stop-color="#4a1d5e"/><stop offset="1" stop-color="#6b2a3a"/></linearGradient>' +
      '<radialGradient id="' + u + 'gl"><stop offset="0" stop-color="#ffb347" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>';
    out += '<rect width="640" height="400" fill="url(#' + u + 'hw)"/>';
    out += '<circle cx="500" cy="80" r="44" fill="#ffd98a"/><circle cx="486" cy="68" r="8" fill="#f3c06a" opacity=".6"/><circle cx="512" cy="96" r="5" fill="#f3c06a" opacity=".6"/>';
    // castle
    out += '<g fill="#0c0616">' +
      '<rect x="360" y="190" width="200" height="160"/>' +
      '<rect x="340" y="150" width="46" height="200"/><polygon points="334,150 363,92 392,150"/>' +
      '<rect x="534" y="130" width="50" height="220"/><polygon points="528,130 559,66 590,130"/>' +
      '<rect x="440" y="140" width="56" height="60"/><polygon points="434,140 468,86 502,140"/>' +
      '<rect x="360" y="180" width="200" height="12"/></g>';
    [[372, 220], [400, 250], [520, 220], [470, 160], [556, 170], [356, 190], [546, 250]].forEach(function (p, i) {
      out += '<rect class="flick" style="--t:' + (i * 0.6) + 's" x="' + p[0] + '" y="' + p[1] + '" width="9" height="14" rx="3" fill="#ffb347"/>';
    });
    out += '<rect y="348" width="640" height="52" fill="#0d0714"/>';
    // lantern pumpkins
    [[90, 366], [220, 372], [610, 366]].forEach(function (p) {
      out += '<circle cx="' + p[0] + '" cy="' + (p[1] - 8) + '" r="34" fill="url(#' + u + 'gl)"/>' +
        '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="19" ry="15" fill="#f07a1a"/>' +
        '<path d="M' + (p[0] - 9) + ' ' + (p[1] - 4) + ' l5 -5 l5 5 z M' + (p[0] + 1) + ' ' + (p[1] - 4) + ' l5 -5 l5 5 z M' + (p[0] - 9) + ' ' + (p[1] + 4) + ' h18 l-3 5 h-12 z" fill="#2a1200"/>';
    });
    for (var i = 0; i < 5; i++) {
      var y = 40 + Math.round(r() * 150), d = (7 + r() * 5).toFixed(1), t = (-r() * 9).toFixed(1);
      out += '<g transform="translate(0,' + y + ')"><g class="bat" style="--d:' + d + 's;--t:' + t + 's"><path class="wing" fill="#0b0612" d="M0 0 C-6 -8 -16 -8 -24 -2 C-18 -2 -14 2 -12 8 C-8 3 -4 3 0 6 C4 3 8 3 12 8 C14 2 18 -2 24 -2 C16 -8 6 -8 0 0 Z"/></g></g>';
    }
    for (var j = 0; j < 16; j++) {
      var bx = [90, 220, 610][j % 3] + Math.round((r() - 0.5) * 30), ed = (3 + r() * 3).toFixed(1), et = (-r() * 6).toFixed(1), ex = Math.round((r() - 0.5) * 50);
      out += '<g transform="translate(' + bx + ',350)"><circle class="ember" style="--d:' + ed + 's;--t:' + et + 's;--x:' + ex + 'px" r="' + (1.5 + r() * 1.8).toFixed(1) + '" fill="#ffb347"/></g>';
    }
    return out;
  }

  function bgPark(u) {
    var out = '';
    out += '<defs><linearGradient id="' + u + 'pk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#fff2d6"/></linearGradient></defs>';
    out += '<rect width="640" height="400" fill="url(#' + u + 'pk)"/>';
    out += '<rect y="350" width="640" height="50" fill="#a9d6a0"/>';
    // Ferris wheel
    out += '<path d="M450 350 L420 190 M390 350 L420 190" stroke="#8a6b52" stroke-width="6" fill="none"/>';
    out += '<g class="wheel"><circle cx="420" cy="190" r="110" fill="none" stroke="#e0527a" stroke-width="5"/><circle cx="420" cy="190" r="6" fill="#e0527a"/>';
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, x = 420 + Math.cos(a) * 110, y = 190 + Math.sin(a) * 110;
      out += '<line x1="420" y1="190" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#e0527a" stroke-width="3"/><rect x="' + (x - 9).toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" width="18" height="16" rx="4" fill="' + (i % 2 ? '#ffd166' : '#6ec6ff') + '"/>';
    }
    out += '</g>';
    // Coffee cups
    out += '<ellipse cx="130" cy="352" rx="100" ry="14" fill="#c9a0dc"/>';
    [[80, 330, '#ff9ec2'], [130, 322, '#ffd166'], [180, 330, '#6ec6ff']].forEach(function (c) {
      out += '<path d="M' + (c[0] - 22) + ' ' + (c[1] - 14) + ' h44 l-6 28 h-32 z" fill="' + c[2] + '" stroke="#fff" stroke-width="2"/><ellipse cx="' + c[0] + '" cy="' + (c[1] - 14) + '" rx="22" ry="5" fill="#fff" opacity=".7"/>';
    });
    return out;
  }

  function bgTombs(u) {
    var out = '';
    out += '<defs><linearGradient id="' + u + 'tb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0a10"/><stop offset="1" stop-color="#181822"/></linearGradient></defs>';
    out += '<rect width="640" height="400" fill="url(#' + u + 'tb)"/>';
    out += '<rect x="40" y="70" width="140" height="90" rx="6" fill="#0f1a14" stroke="#2a4a38" stroke-width="3"/>';
    out += '<text x="52" y="100" font-size="11" font-family="monospace" fill="#5dff9a">0 errors,</text><text x="52" y="120" font-size="11" font-family="monospace" fill="#5dff9a">0 humans_</text>';
    [60, 150, 240, 400, 490, 580].forEach(function (x, i) { out += tomb(x, 392 - (i % 2) * 6, 1.05); });
    return out;
  }

  var BG = { initial: bgSpring, merge: bgDark, rc: bgHalloween };
  K.bgInner = function (theme, uid, scene) {
    uid = uid || 'u';
    if (scene === 'park') return bgPark(uid);
    if (scene === 'tombs') return bgTombs(uid);
    return (BG[theme] || bgSpring)(uid);
  };

  /* ---------- Kiro sprite ---------- */
  var SKIN = '#ffe2cf', HAIR = '#6a54d6', HAIR_D = '#4f3fa8';

  var COSTUMES = {
    initial: { body: '#ffb6d3', skirt: '#ffcde1', trim: '#fff2f8', accent: '#ff8fba', stock: '#f4d6e4' },
    merge: { body: '#16161d', skirt: '#1c1c26', trim: '#3c3c4c', accent: '#2a2a36', stock: '#101016' },
    rc: { body: '#3a1f5c', skirt: '#2b1547', trim: '#d8c4ff', accent: '#7b3fb0', stock: '#1a0f2e' }
  };

  function circ(x, y, r, f, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (extra || '') + '/>'; }

  // Returns { svg, count } so the frill total is verifiable.
  function frills(kind) {
    var c = COSTUMES[kind], list = [], i;
    if (kind === 'initial') {
      for (i = 0; i < 9; i++) list.push(circ(-78 + i * 19.5, 345, 11, c.trim, ' stroke="#ffc2da" stroke-width="1.5"'));
      for (i = -1; i <= 1; i++) list.push(circ(i * 12, 171, 7, c.trim));
      list.push(circ(-62, 258, 9, c.trim), circ(62, 258, 9, c.trim));
      list.push('<path d="M0 250 C-22 232 -26 262 0 252 C26 262 22 232 0 250 Z" fill="' + c.accent + '"/>');
    } else if (kind === 'merge') {
      list.push(circ(-62, 260, 6, c.trim), circ(62, 260, 6, c.trim));
    } else {
      for (i = 0; i < 14; i++) list.push(circ(-78 + i * 12, 345, 9, c.trim, ' stroke="' + c.accent + '" stroke-width="1.5"'));
      for (i = -2; i <= 2; i++) list.push(circ(i * 12, 171, 6, c.trim));
      list.push(circ(-64, 250, 7, c.trim), circ(-60, 264, 7, c.trim), circ(64, 250, 7, c.trim), circ(60, 264, 7, c.trim));
      list.push('<path d="M0 250 C-24 230 -28 264 0 252 C28 264 24 230 0 250 Z" fill="' + c.accent + '"/>');
    }
    return { svg: list.join(''), count: list.length };
  }
  K.frillCount = function (kind) { return frills(kind).count; };

  function headwear(kind) {
    if (kind === 'initial') {
      return '<g transform="translate(-36,62)">' +
        '<path d="M0 0 C-44 -40 -58 18 0 10 Z" fill="#ff8fba" stroke="#ff6fa4" stroke-width="2"/>' +
        '<path d="M0 0 C44 -40 58 18 0 10 Z" fill="#ff8fba" stroke="#ff6fa4" stroke-width="2"/>' +
        '<path d="M-4 8 L-18 38 L-6 32 L0 44 Z M4 8 L18 38 L6 32 L0 44 Z" fill="#ff77ab"/>' +
        circ(0, 5, 8, '#ff5f9d') + '</g>';
    }
    if (kind === 'merge') {
      return '<ellipse cx="0" cy="66" rx="60" ry="11" fill="#101015"/>' +
        '<path d="M-36 66 L8 -14 L38 66 Z" fill="#101015"/>' +
        '<path d="M-32 58 L36 58 L38 66 L-36 66 Z" fill="#3b2f66"/>';
    }
    var s = '<ellipse cx="0" cy="68" rx="68" ry="12" fill="#1a0f2e" stroke="#7b3fb0" stroke-width="2"/>';
    for (var i = 0; i < 11; i++) s += circ(-60 + i * 12, 76 - Math.sin(i / 10 * Math.PI) * 4, 5, '#d8c4ff');
    s += '<path d="M-40 68 Q-12 12 -6 -8 Q16 -12 26 -4 Q8 14 40 68 Z" fill="#1a0f2e" stroke="#7b3fb0" stroke-width="2"/>';
    s += '<path d="M-34 56 L36 56 L40 68 L-40 68 Z" fill="#7b3fb0"/>';
    s += '<g transform="translate(22,58)">' + circ(0, 0, 11, '#120812', ' stroke="#8b3fb8" stroke-width="2"') + circ(0, 0, 7, '#1d0c22', ' stroke="#6b2a8f" stroke-width="1.5"') +
      '<path d="M0 0 m-3 0 a3 3 0 1 1 3 3" fill="none" stroke="#8b3fb8" stroke-width="1.5"/>' +
      '<path d="M-10 6 q-12 2 -14 10 q10 0 14 -6 Z M10 6 q12 2 14 10 q-10 0 -14 -6 Z" fill="#1c3a2a"/></g>';
    return s;
  }

  function star(x, y, s, d) {
    return '<path class="twinkle" style="--t:' + d + 's" transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#fff6a8" stroke="#ffd45e" stroke-width=".8"/>';
  }

  K.kiroSvg = function (layers, o) {
    o = o || {};
    layers = layers || {};
    var cb = layers.costumeBody || 'initial', ch = layers.costumeHead || 'initial';
    var c = COSTUMES[cb] || COSTUMES.initial, joy = o.expr === 'joy';
    var fr = frills(cb in COSTUMES ? cb : 'initial');
    var s = '<g transform="translate(' + (o.x == null ? 320 : o.x) + ',' + (o.y == null ? 18 : o.y) + ') scale(' + (o.scale || 0.93) + ')"' + (o.cls ? ' class="' + o.cls + '"' : '') + '>';
    s += '<ellipse cx="0" cy="392" rx="70" ry="9" fill="#000" opacity=".25"/>';
    // back hair
    s += '<path d="M-60 100 Q-62 48 0 44 Q62 48 60 100 L74 252 Q0 278 -74 252 Z" fill="' + HAIR_D + '"/>';
    // legs
    s += '<rect x="-22" y="340" width="15" height="48" fill="' + c.stock + '"/><rect x="7" y="340" width="15" height="48" fill="' + c.stock + '"/>';
    s += '<ellipse cx="-16" cy="390" rx="14" ry="6" fill="#241a2e"/><ellipse cx="16" cy="390" rx="14" ry="6" fill="#241a2e"/>';
    // arms
    s += '<path d="M-38 176 L-62 262" stroke="' + c.body + '" stroke-width="15" stroke-linecap="round"/><path d="M38 176 L62 262" stroke="' + c.body + '" stroke-width="15" stroke-linecap="round"/>';
    s += circ(-64, 272, 8, SKIN) + circ(64, 272, 8, SKIN);
    // body
    s += '<rect x="-10" y="146" width="20" height="26" fill="' + SKIN + '"/>';
    s += '<path d="M-36 168 L36 168 L42 252 L-42 252 Z" fill="' + c.body + '"/>';
    s += '<path d="M-44 245 L44 245 L80 345 L-80 345 Z" fill="' + c.skirt + '"/>';
    s += fr.svg;
    // head
    s += circ(0, 105, 46, SKIN);
    s += '<path d="M-48 100 Q-48 50 0 48 Q48 50 48 100 Q32 70 14 86 Q0 64 -14 86 Q-34 72 -48 100 Z" fill="' + HAIR + '"/>';
    s += '<path d="M-48 100 Q-58 140 -52 176 Q-40 150 -42 110 Z M48 100 Q58 140 52 176 Q40 150 42 110 Z" fill="' + HAIR + '"/>';
    if (joy) {
      s += '<path d="M-26 112 Q-18 98 -10 112" fill="none" stroke="#1f2a44" stroke-width="3.2" stroke-linecap="round"/><path d="M10 112 Q18 98 26 112" fill="none" stroke="#1f2a44" stroke-width="3.2" stroke-linecap="round"/>';
      s += '<ellipse cx="-30" cy="124" rx="8" ry="5" fill="#ff9aa8" opacity=".7"/><ellipse cx="30" cy="124" rx="8" ry="5" fill="#ff9aa8" opacity=".7"/>';
      s += '<path d="M-11 126 Q0 144 11 126 Z" fill="#d94f6a"/>';
      s += star(-62, 70, 1.4, 0) + star(66, 84, 1.1, .4) + star(-52, 130, .9, .8) + star(58, 40, 1, 1.2);
    } else {
      s += '<ellipse cx="-18" cy="110" rx="5.5" ry="8" fill="#1f2a44"/><ellipse cx="18" cy="110" rx="5.5" ry="8" fill="#1f2a44"/>';
      s += circ(-16, 107, 2, '#fff') + circ(20, 107, 2, '#fff');
      s += '<path d="M-26 96 H-10 M10 96 H26" stroke="' + HAIR_D + '" stroke-width="2.4" stroke-linecap="round"/>';
      s += '<path d="M-8 130 H8" stroke="#b05a6a" stroke-width="2.6" stroke-linecap="round"/>';
    }
    s += headwear(ch in { initial: 1, merge: 1, rc: 1 } ? ch : 'initial');
    s += '</g>';
    return s;
  };

  /* ---------- Widgets ---------- */
  K.tombSvg = function (w, h) {
    return '<svg class="tomb-svg" viewBox="-40 -80 80 90" width="' + (w || 40) + '" height="' + (h || 45) + '" aria-hidden="true">' + tomb(0, 0, 1) + '</svg>';
  };

  K.giftSvg = function () {
    return '<svg viewBox="0 0 80 70" width="64" height="56" aria-hidden="true"><rect x="10" y="28" width="60" height="38" rx="4" fill="#ff9ec2" stroke="#ff6fa4" stroke-width="2"/><rect x="36" y="28" width="8" height="38" fill="#fff2f8"/><rect x="8" y="22" width="64" height="12" rx="3" fill="#ffb6d3" stroke="#ff6fa4" stroke-width="2"/><path d="M40 22 C20 0 10 20 40 22 C70 20 60 0 40 22Z" fill="#fff2f8" stroke="#ff6fa4" stroke-width="2"/></svg>';
  };

  K.cauldronSvg = function () {
    return '<svg viewBox="0 0 120 100" width="104" height="86" aria-hidden="true">' +
      '<path d="M20 36 Q10 90 60 92 Q110 90 100 36 Z" fill="#1c1626" stroke="#7b3fb0" stroke-width="3"/>' +
      '<ellipse cx="60" cy="36" rx="42" ry="10" fill="#34c27a" stroke="#7b3fb0" stroke-width="3"/>' +
      '<rect x="26" y="88" width="10" height="10" fill="#1c1626"/><rect x="84" y="88" width="10" height="10" fill="#1c1626"/>' +
      '<circle class="bubble" style="--t:0s" cx="48" cy="34" r="4" fill="#8dffbf"/><circle class="bubble" style="--t:.6s" cx="64" cy="35" r="5" fill="#8dffbf"/><circle class="bubble" style="--t:1.1s" cx="76" cy="33" r="3" fill="#8dffbf"/>' +
      '</svg>';
  };

  K.stageSvg = function (inner, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + inner + '</svg>';
  };

  // Static full picture for the Release History album.
  K.miniStage = function (layers, uid, o) {
    o = o || {};
    var inner = K.bgInner(layers.bgTheme, uid) + K.kiroSvg(layers, { expr: o.expr });
    return '<svg class="mini-stage" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Kiro">' + inner + '</svg>';
  };
}(window));
