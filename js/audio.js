'use strict';
(function (g) {
  var K = g.KLO = g.KLO || {};

  var ctx = null, master = null, noiseBuf = null;
  var enabled = true;
  var mode = 'initial';
  var timer = null;
  var step = 0;
  var nextTime = 0;

  function ensure() {
    if (!ctx) {
      var AC = g.AudioContext || g.webkitAudioContext;
      if (!AC) return false;
      try {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.55;
        master.connect(ctx.destination);
        var len = ctx.sampleRate * 1;
        noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
        var d = noiseBuf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; return false; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  // Single tone with an attack/decay envelope.
  function tone(freq, t, dur, type, vol, o) {
    o = o || {};
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
    var atk = o.attack || 0.005;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + atk);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var node = osc;
    if (o.lp) {
      var f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = o.lp;
      osc.connect(f); node = f;
    }
    if (o.vibrato) {
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.5; lg.gain.value = freq * 0.012;
      lfo.connect(lg); lg.connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    node.connect(gain); gain.connect(master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(t, dur, vol, hp) {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    var gain = ctx.createGain();
    var f = ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = hp || 6000;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(gain); gain.connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  /* ---------- BGM ---------- */
  // Music box, C major. 16 steps x 0.3s.
  var BOX_MEL = [72, 76, 79, 76, 81, 79, 76, 72, 77, 81, 84, 81, 79, 76, 74, 72];
  var BOX_BASS = { 0: 48, 4: 52, 8: 53, 12: 55 };
  function stepBox(i, t) {
    var m = BOX_MEL[i % 16];
    tone(hz(m), t, 1.1, 'sine', 0.16);
    tone(hz(m) * 2.76, t, 0.35, 'sine', 0.03);
    if (BOX_BASS[i % 16] !== undefined) tone(hz(BOX_BASS[i % 16]), t, 1.2, 'triangle', 0.1);
  }

  // Minimal electronic pulse. 16 steps x 0.214s (140 bpm eighths).
  function stepPulse(i, t) {
    var s = i % 16;
    tone(110, t, 0.09, 'square', 0.05, { lp: 900 });
    if (s % 4 === 0) tone(150, t, 0.12, 'sine', 0.2, { slideTo: 45 });
    if (s % 8 === 4) tone(880, t, 0.05, 'square', 0.03);
    if (s % 2 === 1) noise(t, 0.03, 0.04, 8000);
  }

  // Halloween gothic chamber synth. D minor. 32 steps x 0.5s.
  var CHORDS = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]];
  var ARP = [0, 2, 1, 3, 2, 1, 3, 2];
  var GOTH_MEL = { 0: 74, 3: 77, 4: 76, 6: 74, 8: 73, 10: 74, 12: 77, 14: 81, 16: 79, 19: 77, 20: 75, 22: 74, 24: 73, 26: 70, 28: 69, 30: 73 };
  function stepGoth(i, t) {
    var s = i % 32;
    var chord = CHORDS[Math.floor(s / 8)];
    if (s % 8 === 0) {
      for (var c = 0; c < chord.length; c++) {
        tone(hz(chord[c]), t, 4.0, 'sawtooth', 0.035, { lp: 700, attack: 0.9, vibrato: true });
      }
      tone(hz(chord[0] - 12), t, 4.0, 'sine', 0.12, { attack: 0.3 });
    }
    // harpsichord-like pluck
    tone(hz(chord[ARP[s % 8]] + 12), t, 0.35, 'triangle', 0.1, { lp: 3200 });
    if (GOTH_MEL[s] !== undefined) tone(hz(GOTH_MEL[s]), t, 1.2, 'sawtooth', 0.05, { lp: 2200, attack: 0.12, vibrato: true });
    if (s % 16 === 15) tone(hz(81), t, 0.3, 'sine', 0.05); // bell
  }

  var MODES = {
    initial: { dur: 0.3, fn: stepBox },
    merge: { dur: 0.214, fn: stepPulse },
    rc: { dur: 0.5, fn: stepGoth }
  };

  function tick() {
    if (!ctx || !enabled) return;
    var m = MODES[mode];
    while (nextTime < ctx.currentTime + 0.25) {
      m.fn(step, nextTime);
      nextTime += m.dur;
      step++;
    }
  }

  function startLoop() {
    if (timer || !ensure()) return;
    step = 0;
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(tick, 50);
  }

  function stopLoop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* ---------- SFX ---------- */
  var SFX = {
    click: function (t) { tone(660, t, 0.06, 'sine', 0.12); },
    sparkle: function (t) { [84, 88, 91, 96].forEach(function (m, i) { tone(hz(m), t + i * 0.07, 0.3, 'sine', 0.1); }); },
    thunk: function (t) { tone(120, t, 0.35, 'sine', 0.3, { slideTo: 40 }); noise(t, 0.08, 0.1, 500); },
    magic: function (t) { [60, 64, 67, 72, 76].forEach(function (m, i) { tone(hz(m), t + i * 0.06, 0.4, 'triangle', 0.1, { lp: 2500 }); }); },
    buzz: function (t) { tone(140, t, 0.25, 'sawtooth', 0.12, { lp: 600 }); },
    vanish: function (t) { tone(1200, t, 0.1, 'sine', 0.12, { slideTo: 60 }); },
    jingle: function (t) { [72, 76, 79, 84].forEach(function (m, i) { tone(hz(m), t + i * 0.12, 0.5, 'triangle', 0.12); }); },
    notify: function (t) { tone(880, t, 0.1, 'sine', 0.1); tone(1175, t + 0.1, 0.18, 'sine', 0.1); }
  };

  K.audio = {
    unlock: function () { if (enabled) { ensure(); startLoop(); } else { ensure(); } },
    setMode: function (m) {
      if (!MODES[m] || m === mode) return;
      mode = m;
      step = 0;
      if (ctx) nextTime = ctx.currentTime + 0.1;
    },
    setEnabled: function (v) {
      enabled = !!v;
      if (enabled) { startLoop(); } else { stopLoop(); }
    },
    isEnabled: function () { return enabled; },
    stopBgm: function () { stopLoop(); },
    startBgm: function () { if (enabled) startLoop(); },
    sfx: function (name) {
      if (!enabled || !ctx || !SFX[name]) return;
      SFX[name](ctx.currentTime + 0.01);
    }
  };
}(window));
