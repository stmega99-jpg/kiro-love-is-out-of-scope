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

  function bgDark(u, drop) {
    var out = '';
    out += '<defs><linearGradient id="' + u + 'dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07070a"/><stop offset="1" stop-color="#14141b"/></linearGradient></defs>';
    out += '<rect width="640" height="400" fill="url(#' + u + 'dk)"/>';
    out += '<rect y="350" width="640" height="2" fill="#2a2a35"/>';
    if (drop) {
      out += '<g class="tomb-drop-svg">' + tomb(110, 372, 1.5) + '</g>';
      [[-26, 0], [0, -8], [26, 0]].forEach(function (d, i) {
        out += '<circle class="dust-svg" style="--dx:' + d[0] + 'px;--t:' + (0.42 + i * 0.02) + 's" cx="' + (110 + d[0] * 0.3) + '" cy="' + (372 + d[1]) + '" r="9" fill="#b9bcc6"/>';
      });
    } else out += tomb(110, 372, 1.5);
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
    // Kept inside x = 130..510: a near-square stage (1080p capture) crops the sides of the 640-wide scene.
    out += '<rect x="132" y="64" width="116" height="82" rx="6" fill="#0f1a14" stroke="#2a4a38" stroke-width="3"/>';
    out += '<text x="143" y="94" font-size="11" font-family="monospace" fill="#5dff9a">0 errors,</text><text x="143" y="114" font-size="11" font-family="monospace" fill="#5dff9a">0 humans_</text>';
    [146, 198, 252, 388, 442, 494].forEach(function (x, i) { out += tomb(x, 392 - (i % 2) * 6, 1.05); });
    return out;
  }

  var BG = { initial: bgSpring, merge: bgDark, rc: bgHalloween };
  K.bgInner = function (theme, uid, scene, drop) {
    uid = uid || 'u';
    if (scene === 'park') return bgPark(uid);
    if (scene === 'tombs') return bgTombs(uid);
    return (BG[theme] || bgSpring)(uid, drop);
  };

  /* ---------- Kiro sprite ---------- */
  // Chibi-leaning proportions: big head, short body, sweater-paw sleeves.
  var SKIN = '#ffe4d2', HAIR_D = '#4f3fa8';

  function f(n) { return Math.round(n * 100) / 100; }

  // Palettes: b = bodice [light, mid, dark], s = skirt, lace = [front, back], bow = ribbon fabric.
  // Shading follows the reference art: three-stop gradients lit from the upper left.
  var P = {
    initial: { b: ['#ffdceb', '#ffb3d1', '#ee8bb3'], s: ['#ffebf3', '#ffc6dc', '#f19dc0'], lace: ['#ffffff', '#ffeaf3'], line: '#f2a0c3', hole: '#ffc6dc', pipe: '#ffffff', bow: ['#ffbcd5', '#ff86b2', '#df5a92'], stock: '#f4d6e4' },
    merge: { b: ['#383844', '#1b1b23', '#0c0c11'], s: ['#30303b', '#1d1d26', '#0d0d12'], lace: ['#53536a', '#3a3a4c'], line: '#6a6a84', hole: '#1d1d26', pipe: '#5a5a72', bow: null, stock: '#101016' },
    rc: { b: ['#6f40ae', '#3d2062', '#210f38'], s: ['#5a3396', '#2d1650', '#150a29'], lace: ['#f3eaff', '#cdb6f2'], line: '#7b3fb0', hole: '#2d1650', pipe: '#d8c4ff', bow: ['#9060d0', '#5a2f94', '#2e1557'], stock: '#1a0f2e' }
  };
  var GOLD = ['#f8e29a', '#c9a03c', '#8a6420'];

  function circ(x, y, r, fill, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function stops(a) { return '<stop offset="0" stop-color="' + a[0] + '"/><stop offset=".55" stop-color="' + a[1] + '"/><stop offset="1" stop-color="' + a[2] + '"/>'; }

  // Gradients shared by every outfit (felt, silver, rose, ink shading).
  function sharedDefs(u) {
    return       '<linearGradient id="' + u + 'ft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3450"/><stop offset=".5" stop-color="#16141f"/><stop offset="1" stop-color="#0a0910"/></linearGradient>' +
      '<linearGradient id="' + u + 'ft2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#47296f"/><stop offset=".5" stop-color="#1f1038"/><stop offset="1" stop-color="#0e0719"/></linearGradient>' +
      '<linearGradient id="' + u + 'sv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f6fc"/><stop offset=".5" stop-color="#b9b9c9"/><stop offset="1" stop-color="#7c7c8e"/></linearGradient>' +
      '<linearGradient id="' + u + 'gd" x1="0" y1="0" x2="0" y2="1">' + stops(GOLD) + '</linearGradient>' +
      '<radialGradient id="' + u + 'rs" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#d4466f"/><stop offset=".55" stop-color="#8e1f47"/><stop offset="1" stop-color="#4a0f27"/></radialGradient>' +
      '<radialGradient id="' + u + 'br" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#5a3a78"/><stop offset=".55" stop-color="#26112f"/><stop offset="1" stop-color="#0c0510"/></radialGradient>' +
      '<radialGradient id="' + u + 'pl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f6e4ee"/><stop offset="1" stop-color="#d7b6c8"/></radialGradient>' +
      '<linearGradient id="' + u + 'bh" x1="0" y1="0" x2="1" y2="1">' + stops(['#ffbcd5', '#ff86b2', '#df5a92']) + '</linearGradient>';
  }

  // Gradients that depend on the outfit.
  function costumeDefs(kind, u) {
    var p = P[kind];
    var d = '<linearGradient id="' + u + 'hem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.s[2] + '" stop-opacity="0"/><stop offset="1" stop-color="' + p.s[2] + '" stop-opacity=".6"/></linearGradient>' +
      '<linearGradient id="' + u + 'wsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.s[2] + '" stop-opacity=".55"/><stop offset="1" stop-color="' + p.s[2] + '" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="' + u + 'bd" cx=".38" cy=".25" r=".95">' + stops(p.b) + '</radialGradient>' +
      '<radialGradient id="' + u + 'sk" cx=".38" cy=".12" r="1.1">' + stops(p.s) + '</radialGradient>' +
      '<linearGradient id="' + u + 'lc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.lace[0] + '"/><stop offset="1" stop-color="' + p.lace[1] + '"/></linearGradient>';
    if (p.bow) d += '<linearGradient id="' + u + 'bw" x1="0" y1="0" x2="1" y2="1">' + stops(p.bow) + '</linearGradient>';
    return d + '<clipPath id="' + u + 'skc"><path d="' + SKIRT + '"/></clipPath>';
  }

  // One lace trim piece: flat top, scalloped lower edge, eyelets, picot dots and a stitched top line.
  function lace(cx, top, w, h, n, p, u, back) {
    var x0 = cx - w / 2, x1 = cx + w / 2, sw = w / n, k;
    var d = 'M' + f(x0) + ' ' + f(top) + ' H' + f(x1) + ' V' + f(top + h * 0.35);
    for (k = 0; k < n; k++) {
      var xr = x1 - k * sw, xl = xr - sw;
      d += ' Q' + f((xr + xl) / 2) + ' ' + f(top + h * 1.7) + ' ' + f(xl) + ' ' + f(top + h * 0.35);
    }
    d += ' Z';
    var s = '<g>';
    if (back) s += '<path transform="translate(0,' + back + ')" d="' + d + '" fill="' + p.lace[1] + '" stroke="' + p.line + '" stroke-width=".7" opacity=".92"/>';
    s += '<path d="' + d + '" fill="url(#' + u + 'lc)" stroke="' + p.line + '" stroke-width=".8" stroke-linejoin="round"/>';
    s += '<path d="M' + f(x0 + 1) + ' ' + f(top + 1.5) + ' H' + f(x1 - 1) + '" stroke="' + p.line + '" stroke-width=".7" stroke-dasharray="1.6 1.4" opacity=".8" fill="none"/>';
    for (k = 0; k < n; k++) {
      var xm = x1 - (k + 0.5) * sw;
      s += circ(f(xm), f(top + h * 0.6), f(Math.min(1.5, sw * 0.13)), p.hole);
      s += circ(f(xm), f(top + h * 1.0), 0.9, p.line);
    }
    return s + '</g>';
  }

  // Soft cloth bow: gradient fabric, inner fold shadows, glossy highlights, notched tails.
  function bow(cx, cy, sc, grad, tail) {
    var g = 'url(#' + grad + ')', t = tail || 1;
    return '<g transform="translate(' + cx + ',' + cy + ') scale(' + sc + ')">' +
      '<g transform="translate(0,6) scale(1,' + t + ') translate(0,-6)">' +
      '<path d="M-2 6 C-10 22 -16 36 -24 50 L-13 44 L-9 56 C-2 42 2 24 1 8 Z" fill="' + g + '"/><path d="M2 6 C10 22 16 36 24 50 L13 44 L9 56 C2 42 -2 24 -1 8 Z" fill="' + g + '"/>' +
      '<path d="M-2 6 C-10 22 -16 36 -24 50 L-13 44 L-9 56 C-2 42 2 24 1 8 Z M2 6 C10 22 16 36 24 50 L13 44 L9 56 C2 42 -2 24 -1 8 Z" fill="#000" opacity=".14"/></g>' +
      '<path d="M-2 0 C-16 -30 -50 -36 -54 -12 C-57 8 -30 18 -2 6 Z" fill="' + g + '" stroke="#000" stroke-opacity=".12" stroke-width="1"/>' +
      '<path d="M2 0 C16 -30 50 -36 54 -12 C57 8 30 18 2 6 Z" fill="' + g + '" stroke="#000" stroke-opacity=".12" stroke-width="1"/>' +
      '<path d="M-4 2 C-20 -4 -36 -10 -46 -10 C-40 2 -22 8 -4 6 Z M4 2 C20 -4 36 -10 46 -10 C40 2 22 8 4 6 Z" fill="#000" opacity=".16"/>' +
      '<path d="M-4 1 C-22 -10 -34 -14 -48 -12 M4 1 C22 -10 34 -14 48 -12" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="M-14 -16 C-26 -26 -40 -26 -47 -18 M14 -16 C26 -26 40 -26 47 -18" fill="none" stroke="#fff" stroke-opacity=".34" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M-10 -4 C-24 -14 -38 -18 -50 -14 M10 -4 C24 -14 38 -18 50 -14" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M-8 4 C-22 6 -36 2 -46 -4 M8 4 C22 6 36 2 46 -4" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="1.2" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="3" rx="8" ry="7" fill="' + g + '" stroke="#000" stroke-opacity=".15" stroke-width="1"/><ellipse cx="-2.5" cy="0" rx="3.2" ry="2" fill="#fff" opacity=".4"/></g>';
  }

  // Small embroidered rose (gold spiral, crimson petals, leaves).
  function miniRose(x, y, r, u) {
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<path d="M-' + (r * 0.9) + ' ' + (r * 0.5) + ' q-' + (r * 1.6) + ' ' + (r * 0.1) + ' -' + (r * 1.8) + ' ' + (r * 1.2) + ' q' + (r * 1.4) + ' 0 ' + (r * 1.8) + ' -' + (r * 1.1) + ' Z M' + (r * 0.9) + ' ' + (r * 0.5) + ' q' + (r * 1.6) + ' ' + (r * 0.1) + ' ' + (r * 1.8) + ' ' + (r * 1.2) + ' q-' + (r * 1.4) + ' 0 -' + (r * 1.8) + ' -' + (r * 1.1) + ' Z" fill="#1f4a35" stroke="url(#' + u + 'gd)" stroke-width=".6"/>' +
      circ(0, 0, r, 'url(#' + u + 'rs)', ' stroke="url(#' + u + 'gd)" stroke-width=".7"') +
      '<path d="M0 0 m-' + (r * 0.3) + ' 0 a' + (r * 0.3) + ' ' + (r * 0.3) + ' 0 1 1 ' + (r * 0.3) + ' ' + (r * 0.3) + ' M-' + (r * 0.7) + ' ' + (r * 0.2) + ' a' + (r * 0.7) + ' ' + (r * 0.7) + ' 0 0 1 ' + (r * 1.2) + ' -' + (r * 0.5) + '" fill="none" stroke="#f3b6c8" stroke-opacity=".8" stroke-width=".8" stroke-linecap="round"/></g>';
  }

  var SKIRT = 'M-40 246 Q-46 298 -74 338 L74 338 Q46 298 40 246 Z';
  var BODICE = 'M-31 184 L31 184 L38 254 L-38 254 Z';

  function sleeves(kind, u) {
    var p = P[kind], s = '';
    [-1, 1].forEach(function (sd) {
      s += '<path d="M' + sd * 32 + ' 196 L' + sd * 50 + ' 250" stroke="' + p.b[1] + '" stroke-width="17" stroke-linecap="round"/>';
      s += '<path d="M' + (sd * 32 - 4) + ' 198 L' + (sd * 50 - 4) + ' 248" stroke="' + p.b[0] + '" stroke-width="4" stroke-linecap="round" opacity=".55"/>';
      s += '<path d="M' + (sd * 32 + 5) + ' 198 L' + (sd * 50 + 5) + ' 248" stroke="' + p.b[2] + '" stroke-width="4" stroke-linecap="round" opacity=".5"/>';
      s += '<g class="k-hand k-hand-' + (sd < 0 ? 'l' : 'r') + '">' + circ(sd * 54, 265, 6, SKIN) +
        circ(sd * 52, 255, 10, 'url(#' + u + 'bd)', ' stroke="' + p.b[2] + '" stroke-opacity=".35" stroke-width="1"') + '</g>';
    });
    return s;
  }

  function torso(kind, u) {
    var p = P[kind], s = '<path d="' + BODICE + '" fill="url(#' + u + 'bd)"/>';
    s += '<path d="M-31 184 L-22 184 L-27 254 L-38 254 Z M31 184 L22 184 L27 254 L38 254 Z" fill="' + p.b[2] + '" opacity=".4"/>';
    if (kind !== 'merge') s += '<ellipse cx="-8" cy="205" rx="8" ry="18" fill="#fff" opacity=".12"/>';
    // waist band
    s += '<path d="M-38 249 H38" stroke="' + (kind === 'rc' ? 'url(#' + u + 'gd)' : p.b[2]) + '" stroke-width="' + (kind === 'rc' ? 2.2 : 4) + '" opacity="' + (kind === 'rc' ? 1 : 0.55) + '"/>';
    if (kind === 'initial') {
      [200, 212, 224].forEach(function (y) { s += circ(0, y, 2, 'url(#' + u + 'pl)', ' stroke="#e9a8c4" stroke-width=".5"'); });
      s += '<path d="M-24 196 Q-20 216 -26 240 M24 196 Q20 216 26 240" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="1.6 2.2" opacity=".85"/>';
      // collar base (Peter Pan)
      s += '<path d="M-27 183 Q-18 199 0 202 Q18 199 27 183 L19 181 Q0 193 -19 181 Z" fill="url(#' + u + 'lc)" stroke="' + p.line + '" stroke-width=".9" stroke-linejoin="round"/>';
    } else if (kind === 'merge') {
      s += '<path d="M-12 184 L0 195 L12 184 L9 181 L0 189 L-9 181 Z" fill="#3c3c4c"/>';
    } else {
      // corset lacing
      [204, 216, 228, 240].forEach(function (y) {
        s += '<path d="M-7 ' + y + ' L7 ' + (y + 11) + ' M7 ' + y + ' L-7 ' + (y + 11) + '" stroke="url(#' + u + 'gd)" stroke-width="1.3" stroke-linecap="round" fill="none"/>';
      });
      s += '<path d="M-9 200 V251 M9 200 V251" stroke="url(#' + u + 'gd)" stroke-width="1.1" opacity=".85"/>';
      // vines on the bodice sides
      s += '<g fill="none" stroke="url(#' + u + 'gd)" stroke-width="1.1" stroke-linecap="round" opacity=".95">' +
        '<path d="M-17 198 Q-27 210 -20 224 Q-15 234 -24 246 M17 198 Q27 210 20 224 Q15 234 24 246"/>' +
        '<path d="M-22 214 q-5 -3 -7 1 M-19 228 q-5 -1 -6 4 M22 214 q5 -3 7 1 M19 228 q5 -1 6 4"/></g>';
      s += circ(-20, 224, 1.4, 'url(#' + u + 'gd)') + circ(20, 224, 1.4, 'url(#' + u + 'gd)');
      // collar base: dark with gold piping
      s += '<path d="M-27 183 Q-18 199 0 202 Q18 199 27 183 L19 181 Q0 193 -19 181 Z" fill="url(#' + u + 'bd)" stroke="url(#' + u + 'gd)" stroke-width="1.1" stroke-linejoin="round"/>';
    }
    return s;
  }

  function skirt(kind, u) {
    var p = P[kind], k = kind === 'merge' ? 0.6 : kind === 'rc' ? 1.15 : 1, N = kind === 'merge' ? 6 : 10, i;
    var s = '<path d="' + SKIRT + '" fill="url(#' + u + 'sk)"/><g clip-path="url(#' + u + 'skc)">';
    function line(j) {
      var xw = -40 + j * 80 / N, xh = -74 + j * 148 / N, xm = xw + (xh - xw) * 0.4;
      return { xw: xw, xh: xh, xm: xm };
    }
    for (i = 0; i < N; i++) {
      var a = line(i), b = line(i + 1);
      s += '<path d="M' + f(a.xw) + ' 246 Q' + f(a.xm) + ' 296 ' + f(a.xh) + ' 338 L' + f(b.xh) + ' 338 Q' + f(b.xm) + ' 296 ' + f(b.xw) + ' 246 Z" fill="' + (i % 2 ? '#fff' : p.s[2]) + '" fill-opacity="' + f((i % 2 ? 0.12 : 0.2) * k) + '"/>';
    }
    for (i = 1; i < N; i++) {
      var c = line(i);
      s += '<path d="M' + f(c.xw) + ' 246 Q' + f(c.xm) + ' 296 ' + f(c.xh) + ' 338" fill="none" stroke="' + p.s[2] + '" stroke-opacity="' + f(0.3 * k) + '" stroke-width="1"/>';
    }
    s += '<rect x="-80" y="294" width="160" height="46" fill="url(#' + u + 'hem)"/><rect x="-44" y="246" width="88" height="16" fill="url(#' + u + 'wsh)"/>';
    if (kind === 'initial') {
      s += '<path d="M-70 321 Q0 327 70 321" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="2 3" stroke-linecap="round" opacity=".9"/>';
    } else if (kind === 'rc') {
      s += '<path d="M-66 322 Q0 328 66 322" fill="none" stroke="url(#' + u + 'gd)" stroke-width="1.2" stroke-dasharray="1.2 2.6" stroke-linecap="round"/>';
      s += '<g fill="none" stroke="url(#' + u + 'gd)" stroke-width="1" stroke-linecap="round" opacity=".95">' +
        '<path d="M-44 312 Q-36 300 -26 306 M-26 306 Q-16 312 -8 304 M44 312 Q36 300 26 306 M26 306 Q16 312 8 304 M-14 322 Q0 312 14 322"/></g>';
      s += miniRose(-26, 306, 5, u) + miniRose(26, 306, 5, u) + miniRose(0, 316, 4.5, u);
    }
    return s + '</g>';
  }

  // Returns { svg, count, top }; every lace piece / bow is one counted element (15 / 2 / 24).
  function frills(kind, u) {
    var p = P[kind], list = [], i, top = '';
    if (kind === 'initial') {
      for (i = 0; i < 9; i++) list.push(lace(-74 + 148 / 9 * (i + 0.5), 329, 16.8, 11, 2, p, u));
      [[-15, 193], [0, 198], [15, 193]].forEach(function (c) { list.push(lace(c[0], c[1], 13, 6, 2, p, u)); });
      list.push(lace(-52, 261, 19, 8, 3, p, u), lace(52, 261, 19, 8, 3, p, u));
      list.push(bow(0, 250, 0.5, u + 'bw'));
      top += circ(0, 191.5, 3.2, 'url(#' + u + 'pl)', ' stroke="#e9a8c4" stroke-width=".7"');
    } else if (kind === 'merge') {
      list.push('<path d="M-60 259 Q-52 267 -44 259" fill="none" stroke="' + p.pipe + '" stroke-width="2" stroke-linecap="round"/>');
      list.push('<path d="M44 259 Q52 267 60 259" fill="none" stroke="' + p.pipe + '" stroke-width="2" stroke-linecap="round"/>');
    } else {
      for (i = 0; i < 14; i++) list.push(lace(-74 + 148 / 14 * (i + 0.5), 329, 10.8, 9, 1, p, u, 4));
      for (i = -2; i <= 2; i++) list.push(lace(i * 11.5, 197 - i * i * 1.6, 11, 6, 1, p, u));
      list.push(lace(-54, 257, 20, 8, 3, p, u, 3), lace(-50, 266, 15, 7, 2, p, u), lace(54, 257, 20, 8, 3, p, u, 3), lace(50, 266, 15, 7, 2, p, u));
      list.push(bow(0, 250, 0.5, u + 'bw'));
      top += miniRose(0, 196, 5.2, u);
      top += '<path d="M-30 267 q-5 3 -9 0 M30 267 q5 3 9 0" fill="none" stroke="url(#' + u + 'gd)" stroke-width="1" stroke-linecap="round"/>';
    }
    return { svg: list.join(''), count: list.length, top: top };
  }
  K.frillCount = function (kind) { return frills(kind in P ? kind : 'initial', 'c-').count; };

  // Headwear is authored around the old head position; the wrapper lowers it onto the larger head.
  function headwear(kind, u) {
    var s, i;
    if (kind === 'initial') {
      return '<g transform="translate(-6,20)"><g transform="translate(-36,62)">' + bow(0, 0, 0.95, u + 'bh', 0.5) + '</g></g>';
    }
    if (kind === 'merge') {
      s = '<ellipse cx="0" cy="70" rx="60" ry="10" fill="#000" opacity=".3"/>' +
        '<ellipse cx="0" cy="66" rx="62" ry="11" fill="url(#' + u + 'ft)"/>' +
        '<path d="M-50 64 Q0 76 52 64" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>' +
        '<path d="M-36 66 Q-10 24 8 -14 Q16 30 38 66 Z" fill="url(#' + u + 'ft)"/>' +
        '<path d="M-18 50 Q-6 22 6 2" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M-33 58 Q0 64 36 58 L38 66 Q0 72 -36 66 Z" fill="#4a3d86"/>' +
        '<path d="M-33 58 Q0 64 36 58" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1"/>' +
        '<rect x="-3" y="58" width="11" height="10" rx="2" fill="url(#' + u + 'sv)" stroke="#777" stroke-width=".6"/><rect x="0" y="61" width="5" height="4" rx="1" fill="#4a3d86"/>';
      return '<g transform="translate(0,18)">' + s + '</g>';
    }
    s = '<ellipse cx="0" cy="72" rx="66" ry="11" fill="#000" opacity=".3"/>' +
      '<ellipse cx="0" cy="68" rx="68" ry="12" fill="url(#' + u + 'ft2)" stroke="#7b3fb0" stroke-width="2"/>';
    for (i = 0; i < 11; i++) {
      var y = 71 - Math.sin(i / 10 * Math.PI) * 3;
      s += lace(-60 + i * 12, y, 12, 7, 1, P.rc, u, 2);
    }
    s += '<path d="M-40 68 Q-12 12 -6 -8 Q16 -12 26 -4 Q8 14 40 68 Z" fill="url(#' + u + 'ft2)" stroke="#7b3fb0" stroke-width="2"/>';
    s += '<path d="M-24 52 Q-16 22 -6 6" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="M12 44 Q20 34 14 26 Q8 20 14 12 M12 44 q6 -2 8 2" fill="none" stroke="url(#' + u + 'gd)" stroke-width="1.1" stroke-linecap="round"/>' + circ(14, 12, 1.4, 'url(#' + u + 'gd)') + circ(20, 46, 1.4, 'url(#' + u + 'gd)');
    s += '<path d="M-34 56 L36 56 L40 68 L-40 68 Z" fill="#6a3699"/>' +
      '<path d="M-34 56 L36 56 M-40 68 L40 68" fill="none" stroke="url(#' + u + 'gd)" stroke-width="1.3"/>';
    s += '<g transform="translate(22,58)">' +
      '<path d="M-10 6 q-12 2 -14 10 q10 0 14 -6 Z M10 6 q12 2 14 10 q-10 0 -14 -6 Z" fill="#1c3a2a" stroke="url(#' + u + 'gd)" stroke-width=".6"/>' +
      circ(0, 0, 12, 'url(#' + u + 'br)', ' stroke="url(#' + u + 'gd)" stroke-width="1.2"') +
      circ(0, 0, 7.5, 'none', ' stroke="#8b3fb8" stroke-width="1.4" stroke-opacity=".9"') +
      '<path d="M0 0 m-3.5 0 a3.5 3.5 0 1 1 3.5 3.5 M-8 2 a8 8 0 0 1 12 -7" fill="none" stroke="#b07ad8" stroke-width="1.3" stroke-linecap="round"/>' +
      '<ellipse cx="-4" cy="-5" rx="3.5" ry="1.8" fill="#fff" opacity=".35"/></g>';
    return '<g transform="translate(0,18)">' + s + '</g>';
  }

  function star(x, y, s, d) {
    return '<path class="twinkle" style="--t:' + d + 's" transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#fff6a8" stroke="#ffd45e" stroke-width=".8"/>';
  }

  // One big eye. `side` is -1 (left) or 1 (right). `joy` makes it a little larger with a star glint.
  function eye(side, joy, u, work) {
    var ry = joy ? 15.5 : 14, rx = joy ? 11.5 : 11;
    var s = '<g transform="translate(' + (side * 21) + ',128)"><g class="k-eye">';
    s += '<ellipse rx="' + rx + '" ry="' + ry + '" fill="url(#' + u + 'iris)"/>';
    if (work) s += '<g transform="translate(' + (-side * 1) + ',3.5)">';
    s += '<ellipse rx="6.2" ry="' + (ry - 5) + '" cy="1.5" fill="#1b2350"/>';
    s += circ(-3.5 * side, -5, joy ? 4.6 : 4, '#fff');
    if (joy) s += '<path transform="translate(' + (4 * side) + ',5) scale(.55)" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#fff"/>';
    else s += circ(4 * side, 5, 2, '#fff', ' opacity=".9"');
    if (work) s += '</g>';
    s += '<path d="M' + (-rx - 1) + ' -5 Q0 ' + (-ry - 4) + ' ' + (rx + 1) + ' -5" fill="none" stroke="#1f2a44" stroke-width="3.2" stroke-linecap="round"/>';
    s += '<path d="M' + (side * (rx + 1)) + ' -5 l' + (side * 4) + ' 2" stroke="#1f2a44" stroke-width="2.4" stroke-linecap="round"/>';
    return s + '</g></g>';
  }

  K.kiroSvg = function (layers, o) {
    o = o || {};
    layers = layers || {};
    var u = (o.uid || 'k') + '-';
    var cb = P[layers.costumeBody] ? layers.costumeBody : 'initial';
    var ch = { initial: 1, merge: 1, rc: 1 }[layers.costumeHead] ? layers.costumeHead : 'initial';
    var joy = o.expr === 'joy', work = o.expr === 'work';
    var fr = frills(cb, u);
    var s = '<g transform="translate(' + (o.x == null ? 320 : o.x) + ',' + (o.y == null ? 18 : o.y) + ') scale(' + (o.scale || 0.93) + ')">';
    s += '<defs><linearGradient id="' + u + 'hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d68ea"/><stop offset="1" stop-color="#5a45c2"/></linearGradient>' +
      '<linearGradient id="' + u + 'hairb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a47b8"/><stop offset="1" stop-color="#43348f"/></linearGradient>' +
      '<linearGradient id="' + u + 'iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f9e"/><stop offset="1" stop-color="#58cfdc"/></linearGradient></defs>';
    s += '<defs>' + sharedDefs(u) + costumeDefs(cb, u) + '</defs>';
    s += '<ellipse cx="0" cy="388" rx="64" ry="8" fill="#000" opacity=".25"/>';
    s += '<g class="k-sway' + (work ? ' k-work' : '') + '">';
    // back hair with rounded tips
    s += '<path d="M-66 120 Q-70 54 0 50 Q70 54 66 120 L74 250 Q76 284 48 282 Q0 294 -48 282 Q-76 284 -74 250 Z" fill="url(#' + u + 'hairb)"/>';
    // legs and shoes
    s += '<rect x="-18" y="336" width="13" height="40" fill="' + P[cb].stock + '"/><rect x="5" y="336" width="13" height="40" fill="' + P[cb].stock + '"/>';
    s += '<ellipse cx="-12" cy="380" rx="14" ry="6.5" fill="#241a2e"/><ellipse cx="12" cy="380" rx="14" ry="6.5" fill="#241a2e"/>';
    // sweater-paw sleeves, body, skirt, then lace and bows on top
    s += sleeves(cb, u);
    s += '<rect x="-9" y="164" width="18" height="26" fill="' + SKIN + '"/>';
    s += torso(cb, u);
    s += skirt(cb, u);
    s += fr.svg + fr.top;
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
    s += eye(-1, joy, u, work) + eye(1, joy, u, work);
    s += '<ellipse cx="-35" cy="145" rx="9" ry="5" fill="#ff8fa3" opacity="' + (joy ? '.6' : '.35') + '"/><ellipse cx="35" cy="145" rx="9" ry="5" fill="#ff8fa3" opacity="' + (joy ? '.6' : '.35') + '"/>';
    if (joy) {
      s += '<path d="M-32 104 Q-21 97 -10 101 M10 101 Q21 97 32 104" fill="none" stroke="' + HAIR_D + '" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<path d="M-6 150 Q0 158 6 150 Z" fill="#d94f6a" stroke="#d94f6a" stroke-width="1.5" stroke-linejoin="round"/>';
      s += star(-62, 96, 1.1, 0) + star(64, 108, .9, .6);
    } else {
      s += '<path d="M-31 107 Q-21 103 -11 106 M11 106 Q21 103 31 107" fill="none" stroke="' + HAIR_D + '" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<path d="M-5 151 Q-2.5 153.5 0 151 Q2.5 153.5 5 151" fill="none" stroke="#b05a6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    s += headwear(ch, u);
    s += '</g></g>';
    return s;
  };

  /* ---------- Widgets ---------- */
  K.tombSvg = function (w, h, cls) {
    return '<svg class="tomb-svg' + (cls ? ' ' + cls : '') + '" viewBox="-40 -80 80 90" width="' + (w || 40) + '" height="' + (h || 45) + '" aria-hidden="true">' + tomb(0, 0, 1) + '</svg>';
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
