'use strict';
(function (g) {
  var K = g.KLO = g.KLO || {};

  var START_CREDITS = 4000;
  var EXHAUST_AT = 0.5;
  var HISTORY_KEY = 'klo.history';
  var HISTORY_MAX = 50;

  function round2(v) { return Math.round(v * 100) / 100; }

  function initialLayers() {
    var o = {};
    K.LAYER_IDS.forEach(function (id) { o[id] = 'initial'; });
    return o;
  }

  function validateEars(text) {
    var t = String(text == null ? '' : text).trim();
    var re = /^(WHEN|WHILE|IF|WHERE)\s+([\s\S]+?)[,、\s]+THE\s+(\S[\s\S]*?)\s+SHALL\s+(\S[\s\S]*)$/i;
    if (!re.test(t)) return { ok: false, code: 'format' };
    if (!/(デート|遊園地|date|amusement|theme\s*park)/i.test(t)) return { ok: false, code: 'topic' };
    return { ok: true };
  }

  function createGame(rng) {
    rng = rng || Math.random;
    var s = {
      day: 1,
      credits: START_CREDITS,
      layers: initialLayers(),
      earsText: '',
      ended: null
    };
    // The affection value is a constant. It can never be written to.
    Object.defineProperty(s, 'actualAffection', { value: 0, writable: false, enumerable: true, configurable: false });

    function between(a, b) { return round2(a + rng() * (b - a)); }
    function secs(a, b) { return a + Math.floor(rng() * (b - a + 1)); }

    // Single place where credits go down. Never below 0.00, on any day.
    function spend(cost) {
      s.credits = round2(Math.max(0, s.credits - Math.max(0, cost)));
    }

    function prOfDay(day) { return K.PRS[day - 1]; }

    var api = {
      state: s,

      // Day 1-9 only. Day 10 never ends in END 5.
      isExhausted: function () { return s.day <= 9 && s.credits <= EXHAUST_AT; },
      canOrder: function () { return s.credits > 0; },

      // A / B / C conversation action.
      talk: function () {
        var used = between(0.20, 0.45);
        var elapsed = secs(3, 8);
        spend(used);
        return { used: used, elapsed: elapsed };
      },

      // option: 'merge' | 'close' | 'rc'. Touches exactly one layer.
      resolvePR: function (option, earsText) {
        var pr = prOfDay(s.day);
        if (!pr) throw new Error('no PR for day ' + s.day);
        var res = { option: option, layer: pr.layer, used: 0, elapsed: 0, endId: null };
        if (option === 'merge') {
          s.layers[pr.layer] = 'merge';
          if (pr.layer === 'playerInput') { res.endId = 3; s.ended = 3; }
        } else if (option === 'close') {
          s.layers[pr.layer] = 'initial';
        } else if (option === 'rc') {
          if (!api.canOrder()) throw new Error('no credits');
          if (pr.layer === 'dateModule') {
            var v = validateEars(earsText);
            if (!v.ok) { res.error = v.code; return res; }
            s.earsText = String(earsText).trim();
          }
          res.used = between(650, 900);
          res.elapsed = secs(4, 9);
          spend(res.used);
          s.layers[pr.layer] = 'rc';
        } else {
          throw new Error('bad option');
        }
        return res;
      },

      advanceDay: function () { if (s.day < 10) s.day += 1; return s.day; },

      dateAvailable: function () { return s.layers.dateModule === 'rc'; },

      // Day 10. Exhaustion is deliberately not consulted here.
      finalChoice: function (n) {
        if (s.day !== 10) throw new Error('not day 10');
        var res = { used: 0, elapsed: 0, endId: null };
        if (n === 1) {
          if (!api.dateAvailable()) throw new Error('date not implemented');
          res.endId = 1;
        } else if (n === 2) {
          res.used = between(480, 520);
          res.elapsed = secs(5, 9);
          spend(res.used);
          res.endId = 2;
        } else if (n === 3) {
          res.endId = 4;
        } else {
          throw new Error('bad choice');
        }
        s.ended = res.endId;
        return res;
      },

      // Used when day 1-9 ends in credit exhaustion.
      exhaust: function () { s.ended = 5; return 5; },

      snapshot: function (extra) {
        var o = {
          day: s.day,
          credits: s.credits,
          layers: JSON.parse(JSON.stringify(s.layers)),
          earsText: s.earsText
        };
        if (extra) for (var k in extra) o[k] = extra[k];
        return o;
      }
    };
    return api;
  }

  /* ---------- Release History (localStorage; failures are ignored) ---------- */
  var memoryHistory = [];

  var History = {
    load: function () {
      try {
        var raw = g.localStorage.getItem(HISTORY_KEY);
        if (!raw) return memoryHistory.slice();
        var arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      } catch (e) { return memoryHistory.slice(); }
    },
    add: function (rec) {
      var list = History.load();
      list.unshift(rec);
      list = list.slice(0, HISTORY_MAX);
      memoryHistory = list.slice();
      try { g.localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
    },
    clear: function () {
      memoryHistory = [];
      try { g.localStorage.removeItem(HISTORY_KEY); } catch (e) { /* ignore */ }
    }
  };

  function formatCredits(v) {
    v = Math.max(0, Number(v) || 0);
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  K.createGame = createGame;
  K.validateEars = validateEars;
  K.History = History;
  K.formatCredits = formatCredits;
  K.START_CREDITS = START_CREDITS;
  K.EXHAUST_AT = EXHAUST_AT;
}(typeof window !== 'undefined' ? window : globalThis));
