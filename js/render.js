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
  // Chibi-leaning proportions: big head, short body, sweater-paw sleeves.
  var SKIN = '#ffe4d2', HAIR_D = '#4f3fa8';

  var COSTUMES = {
    initial: { body: '#ffb6d3', skirt: '#ffcde1', trim: '#fff2f8', accent: '#ff8fba', stock: '#f4d6e4' },
    merge: { body: '#16161d', skirt: '#1c1c26', trim: '#3c3c4c', accent: '#2a2a36', stock: '#101016' },
    rc: { body: '#3a1f5c', skirt: '#2b1547', trim: '#d8c4ff', accent: '#7b3fb0', stock: '#1a0f2e' }
  };

  function circ(x, y, r, f, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (extra || '') + '/>'; }

  // Returns { svg, count } so the frill total is verifiable (15 / 2 / 24).
  function frills(kind) {
    var c = COSTUMES[kind], list = [], i;
    if (kind === 'initial') {
      for (i = 0; i < 9; i++) list.push(circ(-72 + i * 18, 338, 10, c.trim, ' stroke="#ffc2da" stroke-width="1.5"'));
      for (i = -1; i <= 1; i++) list.push(circ(i * 11, 189, 6.5, c.trim));
      list.push(circ(-52, 262, 8, c.trim), circ(52, 262, 8, c.trim));
      list.push('<path d="M0 252 C-22 234 -26 264 0 254 C26 264 22 234 0 252 Z" fill="' + c.accent + '"/>');
    } else if (kind === 'merge') {
      list.push(circ(-52, 262, 5, c.trim), circ(52, 262, 5, c.trim));
    } else {
      for (i = 0; i < 14; i++) list.push(circ(-72 + i * 11.08, 338, 8, c.trim, ' stroke="' + c.accent + '" stroke-width="1.5"'));
      for (i = -2; i <= 2; i++) list.push(circ(i * 11, 189, 5.5, c.trim));
      list.push(circ(-54, 258, 6.5, c.trim), circ(-50, 268, 6.5, c.trim), circ(54, 258, 6.5, c.trim), circ(50, 268, 6.5, c.trim));
      list.push('<path d="M0 252 C-24 232 -28 266 0 254 C28 266 24 232 0 252 Z" fill="' + c.accent + '"/>');
    }
    return { svg: list.join(''), count: list.length };
  }
  K.frillCount = function (kind) { return frills(kind).count; };

  // Headwear is authored around the old head position; the wrapper lowers it onto the larger head.
  function headwear(kind) {
    var s;
    if (kind === 'initial') {
      s = '<g transform="translate(-36,62)">' +
        '<path d="M0 0 C-44 -40 -58 18 0 10 Z" fill="#ff8fba" stroke="#ff6fa4" stroke-width="2"/>' +
        '<path d="M0 0 C44 -40 58 18 0 10 Z" fill="#ff8fba" stroke="#ff6fa4" stroke-width="2"/>' +
        '<path d="M-4 8 L-18 38 L-6 32 L0 44 Z M4 8 L18 38 L6 32 L0 44 Z" fill="#ff77ab"/>' +
        circ(0, 5, 8, '#ff5f9d') + '</g>';
      return '<g transform="translate(-6,20)">' + s + '</g>';
    }
    if (kind === 'merge') {
      s = '<ellipse cx="0" cy="66" rx="62" ry="11" fill="#101015"/>' +
        '<path d="M-36 66 L8 -14 L38 66 Z" fill="#101015"/>' +
        '<path d="M-32 58 L36 58 L38 66 L-36 66 Z" fill="#3b2f66"/>';
      return '<g transform="translate(0,18)">' + s + '</g>';
    }
    s = '<ellipse cx="0" cy="68" rx="68" ry="12" fill="#1a0f2e" stroke="#7b3fb0" stroke-width="2"/>';
    for (var i = 0; i < 11; i++) s += circ(-60 + i * 12, 76 - Math.sin(i / 10 * Math.PI) * 4, 5, '#d8c4ff');
    s += '<path d="M-40 68 Q-12 12 -6 -8 Q16 -12 26 -4 Q8 14 40 68 Z" fill="#1a0f2e" stroke="#7b3fb0" stroke-width="2"/>';
    s += '<path d="M-34 56 L36 56 L40 68 L-40 68 Z" fill="#7b3fb0"/>';
    s += '<g transform="translate(22,58)">' + circ(0, 0, 11, '#120812', ' stroke="#8b3fb8" stroke-width="2"') + circ(0, 0, 7, '#1d0c22', ' stroke="#6b2a8f" stroke-width="1.5"') +
      '<path d="M0 0 m-3 0 a3 3 0 1 1 3 3" fill="none" stroke="#8b3fb8" stroke-width="1.5"/>' +
      '<path d="M-10 6 q-12 2 -14 10 q10 0 14 -6 Z M10 6 q12 2 14 10 q-10 0 -14 -6 Z" fill="#1c3a2a"/></g>';
    return '<g transform="translate(0,18)">' + s + '</g>';
  }

  function star(x, y, s, d) {
    return '<path class="twinkle" style="--t:' + d + 's" transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#fff6a8" stroke="#ffd45e" stroke-width=".8"/>';
  }

  // One big eye. `side` is -1 (left) or 1 (right). `joy` makes it a little larger with a star glint.
  function eye(side, joy, u) {
    var ry = joy ? 15.5 : 14, rx = joy ? 11.5 : 11;
    var s = '<g transform="translate(' + (side * 21) + ',128)"><g class="k-eye">';
    s += '<ellipse rx="' + rx + '" ry="' + ry + '" fill="url(#' + u + 'iris)"/>';
    s += '<ellipse rx="6.2" ry="' + (ry - 5) + '" cy="1.5" fill="#1b2350"/>';
    s += circ(-3.5 * side, -5, joy ? 4.6 : 4, '#fff');
    if (joy) s += '<path transform="translate(' + (4 * side) + ',5) scale(.55)" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#fff"/>';
    else s += circ(4 * side, 5, 2, '#fff', ' opacity=".9"');
    s += '<path d="M' + (-rx - 1) + ' -5 Q0 ' + (-ry - 4) + ' ' + (rx + 1) + ' -5" fill="none" stroke="#1f2a44" stroke-width="3.2" stroke-linecap="round"/>';
    s += '<path d="M' + (side * (rx + 1)) + ' -5 l' + (side * 4) + ' 2" stroke="#1f2a44" stroke-width="2.4" stroke-linecap="round"/>';
    return s + '</g></g>';
  }

  K.kiroSvg = function (layers, o) {
    o = o || {};
    layers = layers || {};
    var u = (o.uid || 'k') + '-';
    var cb = COSTUMES[layers.costumeBody] ? layers.costumeBody : 'initial';
    var ch = { initial: 1, merge: 1, rc: 1 }[layers.costumeHead] ? layers.costumeHead : 'initial';
    var c = COSTUMES[cb], joy = o.expr === 'joy';
    var fr = frills(cb);
    var s = '<g transform="translate(' + (o.x == null ? 320 : o.x) + ',' + (o.y == null ? 18 : o.y) + ') scale(' + (o.scale || 0.93) + ')">';
    s += '<defs><linearGradient id="' + u + 'hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d68ea"/><stop offset="1" stop-color="#5a45c2"/></linearGradient>' +
      '<linearGradient id="' + u + 'hairb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a47b8"/><stop offset="1" stop-color="#43348f"/></linearGradient>' +
      '<linearGradient id="' + u + 'iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f9e"/><stop offset="1" stop-color="#58cfdc"/></linearGradient></defs>';
    s += '<ellipse cx="0" cy="388" rx="64" ry="8" fill="#000" opacity=".25"/>';
    s += '<g class="k-sway">';
    // back hair with rounded tips
    s += '<path d="M-66 120 Q-70 54 0 50 Q70 54 66 120 L74 250 Q76 284 48 282 Q0 294 -48 282 Q-76 284 -74 250 Z" fill="url(#' + u + 'hairb)"/>';
    // legs and shoes
    s += '<rect x="-18" y="336" width="13" height="40" fill="' + c.stock + '"/><rect x="5" y="336" width="13" height="40" fill="' + c.stock + '"/>';
    s += '<ellipse cx="-12" cy="380" rx="14" ry="6.5" fill="#241a2e"/><ellipse cx="12" cy="380" rx="14" ry="6.5" fill="#241a2e"/>';
    // sweater-paw sleeves: little hands peek out under the cuffs
    s += '<path d="M-32 196 L-50 250" stroke="' + c.body + '" stroke-width="17" stroke-linecap="round"/><path d="M32 196 L50 250" stroke="' + c.body + '" stroke-width="17" stroke-linecap="round"/>';
    s += circ(-54, 265, 6, SKIN) + circ(54, 265, 6, SKIN);
    s += circ(-52, 255, 10, c.body) + circ(52, 255, 10, c.body);
    // body
    s += '<rect x="-9" y="164" width="18" height="26" fill="' + SKIN + '"/>';
    s += '<path d="M-31 184 L31 184 L38 254 L-38 254 Z" fill="' + c.body + '"/>';
    s += '<path d="M-40 246 L40 246 L74 338 L-74 338 Z" fill="' + c.skirt + '"/>';
    s += fr.svg;
    // head: soft rounded face
    s += '<ellipse cx="0" cy="122" rx="55" ry="50" fill="' + SKIN + '"/>';
    // front hair: fringe, side locks with rounded ends, ahoge, highlight bands
    s += '<path d="M-58 118 Q-62 60 0 56 Q62 60 58 118 Q44 86 26 102 Q12 76 0 100 Q-12 76 -26 102 Q-44 86 -58 118 Z" fill="url(#' + u + 'hair)"/>';
    s += '<path d="M-54 118 Q-68 160 -60 200 Q-52 212 -44 200 Q-44 152 -42 126 Z M54 118 Q68 160 60 200 Q52 212 44 200 Q44 152 42 126 Z" fill="url(#' + u + 'hair)"/>';
    s += '<path d="M0 58 Q-8 38 8 28" fill="none" stroke="#7d68ea" stroke-width="6" stroke-linecap="round"/>';
    s += '<path d="M-36 80 Q-18 66 4 70" fill="none" stroke="#b7a8ff" stroke-width="5" stroke-linecap="round" opacity=".75"/>';
    s += '<path d="M-58 150 Q-60 170 -56 184" fill="none" stroke="#b7a8ff" stroke-width="4" stroke-linecap="round" opacity=".6"/>';
    // small ghost hair clip
    s += '<g transform="translate(-52,146)"><path d="M-8 9 V-2 Q-8 -11 0 -11 Q8 -11 8 -2 V9 L4.5 5.5 L0 9 L-4.5 5.5 Z" fill="#f6f2ff" stroke="#9a86f0" stroke-width="1.4"/>' +
      circ(-3, -3, 1.4, '#3b2f66') + circ(3, -3, 1.4, '#3b2f66') + '</g>';
    // face
    s += eye(-1, joy, u) + eye(1, joy, u);
    s += '<ellipse cx="-35" cy="145" rx="9" ry="5" fill="#ff8fa3" opacity="' + (joy ? '.6' : '.35') + '"/><ellipse cx="35" cy="145" rx="9" ry="5" fill="#ff8fa3" opacity="' + (joy ? '.6' : '.35') + '"/>';
    if (joy) {
      s += '<path d="M-32 104 Q-21 97 -10 101 M10 101 Q21 97 32 104" fill="none" stroke="' + HAIR_D + '" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<path d="M-6 150 Q0 158 6 150 Z" fill="#d94f6a" stroke="#d94f6a" stroke-width="1.5" stroke-linejoin="round"/>';
      s += star(-62, 96, 1.1, 0) + star(64, 108, .9, .6);
    } else {
      s += '<path d="M-31 107 Q-21 103 -11 106 M11 106 Q21 103 31 107" fill="none" stroke="' + HAIR_D + '" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<path d="M-5 151 Q-2.5 153.5 0 151 Q2.5 153.5 5 151" fill="none" stroke="#b05a6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    s += headwear(ch);
    s += '</g></g>';
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
    var inner = K.bgInner(layers.bgTheme, uid) + K.kiroSvg(layers, { expr: o.expr, uid: uid });
    return '<svg class="mini-stage" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Kiro">' + inner + '</svg>';
  };
}(window));
