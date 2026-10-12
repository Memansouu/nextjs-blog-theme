// Soundtrack for the Paloma film, synthesised offline with the Web Audio API.
// window.renderAudio() resolves to a base64 16-bit stereo WAV.
(function () {
  const SR = 48000;

  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  async function renderAudio() {
    const { DUR, BEAT, BAR, STEPS, POURS } = window;
    const ac = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
    const r = rng(2024);

    // shared noise buffer
    const nb = ac.createBuffer(1, SR * 4, SR); const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = r() * 2 - 1;
    const noise = (t, dur, off = 0) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; s.start(t, off % 3, dur); return s; };

    // buses
    const master = ac.createGain(); master.gain.value = 0.9;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
    master.connect(comp).connect(ac.destination);
    const music = ac.createGain(); music.gain.value = 0.42; music.connect(master);
    const sfx = ac.createGain(); sfx.gain.value = 1.0; sfx.connect(master);
    // short room for the glass sounds
    const conv = ac.createConvolver();
    { const len = SR * 1.4, ir = ac.createBuffer(2, len, SR);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3.2) * 0.6; }
      conv.buffer = ir; }
    const verb = ac.createGain(); verb.gain.value = 0.16; verb.connect(conv).connect(master);
    const out = (node, pan = 0, wet = true) => { const p = ac.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(sfx); if (wet) p.connect(verb); return p; };

    // ---------- instruments ----------
    function epiano(t, midi, dur, vel, dest) {
      const f = mtof(midi);
      const g = ac.createGain(); g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel, t + 0.012); g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      [[1, 1], [2, 0.22], [3, 0.06], [4.02, 0.03]].forEach(([h, a]) => {
        const o = ac.createOscillator(); o.frequency.value = f * h; o.detune.value = (h === 1 ? 3 : -4);
        const og = ac.createGain(); og.gain.value = a; o.connect(og).connect(g); o.start(t); o.stop(t + dur + 0.05);
      });
      const trem = ac.createOscillator(); trem.frequency.value = 4.6; const tg = ac.createGain(); tg.gain.value = vel * 0.12;
      trem.connect(tg).connect(g.gain); trem.start(t); trem.stop(t + dur);
      g.connect(dest);
    }
    function bass(t, midi, dur, vel) {
      const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(midi);
      const o2 = ac.createOscillator(); o2.frequency.value = mtof(midi);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(lp); o2.connect(lp); lp.connect(g).connect(music);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    }
    function shaker(t, vel) {
      const s = noise(t, 0.09, r() * 3); const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
      const p = ac.createStereoPanner(); p.pan.value = 0.35;
      s.connect(hp).connect(g).connect(p).connect(music);
    }
    function kick(t, vel) {
      const o = ac.createOscillator(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.14);
      const g = ac.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g).connect(music); o.start(t); o.stop(t + 0.3);
    }
    function rim(t, vel) {
      const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = 1750;
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 6;
      const g = ac.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      const p = ac.createStereoPanner(); p.pan.value = -0.25;
      o.connect(bp).connect(g).connect(p).connect(music); o.start(t); o.stop(t + 0.05);
    }

    // ---------- sound effects ----------
    function clink(t, pitch, vel, decay = 0.45, pan = 0) {
      const base = 2150 * pitch;
      const g = ac.createGain(); g.gain.value = vel; out(g, pan);
      [[1, 1, 1], [1.59, 0.6, 0.8], [2.31, 0.45, 0.6], [3.13, 0.3, 0.45], [4.42, 0.18, 0.3]].forEach(([h, a, d]) => {
        const o = ac.createOscillator(); o.frequency.value = base * h;
        const og = ac.createGain(); og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(a, t + 0.002);
        og.gain.exponentialRampToValueAtTime(0.0001, t + decay * d);
        o.connect(og).connect(g); o.start(t); o.stop(t + decay + 0.05);
      });
      const s = noise(t, 0.02, r() * 3); const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000;
      const ng = ac.createGain(); ng.gain.setValueAtTime(0.5, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
      s.connect(hp).connect(ng).connect(g);
    }
    function thunk(t, f, vel, dur = 0.09) {
      const o = ac.createOscillator(); o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
      const g = ac.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); out(g, 0, false); o.start(t); o.stop(t + dur + 0.02);
    }
    function clack(t, vel) {
      const s = noise(t, 0.06, r() * 3); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 2.5;
      const g = ac.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      s.connect(bp).connect(g); out(g, 0.05);
    }
    function pour(T, len, fill0, fill1, vel, soda) {
      const s = noise(T - 0.05, len + 0.4, r() * 3);
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.2;
      const f0 = 520 + 1300 * fill0, f1 = 520 + 1300 * fill1;
      bp.frequency.setValueAtTime(f0, T);
      // gurgle: jittered resonance that climbs as the glass fills
      for (let k = 0; k * 0.035 < len; k++) {
        const tt = T + k * 0.035, base = f0 + (f1 - f0) * Math.min(1, (k * 0.035) / len);
        bp.frequency.setValueAtTime(base * (0.8 + r() * 0.45), tt);
      }
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
      const g = ac.createGain(); g.gain.setValueAtTime(0, T - 0.03);
      g.gain.linearRampToValueAtTime(vel, T + 0.05); g.gain.linearRampToValueAtTime(vel * 0.7, T + len * 0.6);
      g.gain.linearRampToValueAtTime(0, T + len + 0.06);
      s.connect(bp).connect(lp).connect(g); out(g, 0.08);
      // impact splash
      const sp = noise(T, 0.16, r() * 3); const sl = ac.createBiquadFilter(); sl.type = 'lowpass'; sl.frequency.value = 2400;
      const sg = ac.createGain(); sg.gain.setValueAtTime(vel * 1.1, T); sg.gain.exponentialRampToValueAtTime(0.0001, T + 0.15);
      sp.connect(sl).connect(sg); out(sg, 0.05);
      // glugs
      for (let k = 0; k < 9; k++) {
        const tt = T + 0.08 + r() * (len - 0.15), f = (330 + 500 * (fill0 + (fill1 - fill0) * ((tt - T) / len))) * (0.9 + r() * 0.25);
        const o = ac.createOscillator(); o.frequency.setValueAtTime(f, tt); o.frequency.exponentialRampToValueAtTime(f * 1.5, tt + 0.03);
        const og = ac.createGain(); og.gain.setValueAtTime(0, tt); og.gain.linearRampToValueAtTime(vel * 0.35, tt + 0.006); og.gain.exponentialRampToValueAtTime(0.0001, tt + 0.04);
        o.connect(og); out(og, 0.08, false); o.start(tt); o.stop(tt + 0.05);
      }
      if (soda) fizz(T + 0.1, DUR - T - 0.1, vel);
    }
    function fizz(t, dur, vel) {
      const s = noise(t, dur, r() * 3); const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5200;
      const g = ac.createGain(); g.gain.setValueAtTime(0, t);
      // crackle: many tiny random spikes, thinning out over time
      let tt = t;
      while (tt < t + dur) {
        const age = tt - t, dens = 0.012 + age * 0.012;
        const a = vel * 0.5 * Math.exp(-age / 2.5) + vel * 0.03 * Math.exp(-age / 6);
        g.gain.setValueAtTime(a * (0.3 + r()), tt); g.gain.setValueAtTime(a * 0.12, tt + 0.004);
        tt += dens * (0.5 + r());
      }
      g.gain.setValueAtTime(0, t + dur);
      s.connect(hp).connect(g); out(g, -0.1);
    }
    function swirl(t, dur, vel) {
      const s = noise(t, dur, r() * 3); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
      for (let k = 0; k * 0.05 < dur; k++) bp.frequency.setValueAtTime(900 + 500 * Math.sin(2 * Math.PI * (k * 0.05) / BEAT), t + k * 0.05);
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.2); g.gain.linearRampToValueAtTime(0, t + dur);
      s.connect(bp).connect(g); out(g, 0);
    }

    // ---------- music ----------
    // Fmaj9 | Am7 | Dm9 | Bbmaj9  (repeat), resolve to Fmaj9 at the end
    const chords = [
      { root: 41, v: [57, 60, 64, 67] },  // F: A C E G
      { root: 45, v: [55, 60, 64, 67] },  // Am7: G C E G
      { root: 38, v: [57, 60, 64, 65] },  // Dm9: A C E F
      { root: 46, v: [57, 60, 62, 65] },  // Bbmaj9: A C D F
    ];
    const nBars = Math.ceil(DUR / BAR);
    for (let b = 0; b < nBars; b++) {
      const T = b * BAR, ch = b >= 12 ? chords[0] : chords[b % 4];
      const finale = b >= 10;
      // comp: beat 1 and the "and" of 2, bossa-light
      const hits = b === 0 ? [[0, 2.2]] : [[0, 1.0], [1.5, 0.8], [3, 0.55]];
      for (const [bt, len] of hits) for (const m of ch.v) epiano(T + bt * BEAT, m, BEAT * (len * 1.6 + 0.5), 0.05 * (bt ? 0.75 : 1), music);
      if (b >= 1) {
        bass(T, ch.root, BEAT * 1.4, 0.32);
        bass(T + 2.5 * BEAT, ch.root + 7, BEAT * 1.2, 0.22);
        if (!finale || b === 10) bass(T + 3.5 * BEAT, ch.root + 12, BEAT * 0.5, 0.16);
      }
      if (b >= 2 && b < 12) {
        kick(T, 0.32); kick(T + 2 * BEAT, 0.2);
        for (let e = 0; e < 8; e++) shaker(T + e * BEAT / 2, e % 2 ? 0.08 : 0.04);
        rim(T + 1.5 * BEAT, 0.05); rim(T + 3 * BEAT, 0.05);
      }
    }
    // final bell chord
    for (const m of [65, 69, 72, 76, 79]) epiano(BAR * 12, m, 2.2, 0.045, music);

    // ---------- step sounds ----------
    const ice = STEPS[0];
    for (let i = 0; i < 4; i++) {
      const t = ice.T + i * BEAT;
      if (i < 2) { thunk(t, 170, 0.5); clink(t, 1.0 + i * 0.12, 0.30, 0.55, -0.1 + i * 0.2); }
      else { clack(t, 0.45); clink(t, 1.25 + (i - 2) * 0.1, 0.18, 0.35, -0.1 + (i - 2) * 0.2); }
    }
    let V = 0; const total = POURS.reduce((a, p) => a + p.ml, 0);
    for (const p of POURS) {
      const f0 = V / total; V += p.ml; const f1 = V / total;
      pour(p.T, 1.3, f0, f1, 0.22 + 0.12 * Math.min(1, p.ml / 50), !!p.soda);
    }
    const stir = STEPS[6];
    swirl(stir.T - 0.2, 2.3, 0.05);
    for (let k = 0; k < 4; k++) clink(stir.T + k * BEAT, 1.45 + (k % 2) * 0.08, 0.16, 0.3, 0.1);
    const garn = STEPS[7];
    { const s = noise(garn.T, 0.1, 1.3); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 850; bp.Q.value = 1.6;
      const g = ac.createGain(); g.gain.setValueAtTime(0.45, garn.T); g.gain.exponentialRampToValueAtTime(0.0001, garn.T + 0.09);
      s.connect(bp).connect(g); out(g, 0.3); thunk(garn.T, 140, 0.35, 0.08); clink(garn.T + 0.01, 1.7, 0.07, 0.25, 0.35); }
    // the finished glass: one clear ting when the title lands
    clink(BAR * 10.5, 0.92, 0.22, 2.4, 0);

    const buf = await ac.startRendering();
    return encodeWav(buf);
  }

  function encodeWav(buf) {
    const ch = buf.numberOfChannels, n = buf.length, bytes = 44 + n * ch * 2;
    const ab = new ArrayBuffer(bytes), dv = new DataView(ab);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, buf.sampleRate, true);
    dv.setUint32(28, buf.sampleRate * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, n * ch * 2, true);
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    let o = 44, peak = 0;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) peak = Math.max(peak, Math.abs(data[c][i]));
    const norm = peak > 0.98 ? 0.98 / peak : 1;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i] * norm)); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7FFF, true); o += 2; }
    let bin = ''; const u8 = new Uint8Array(ab), CH = 0x8000;
    for (let i = 0; i < u8.length; i += CH) bin += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
    return btoa(bin);
  }

  window.renderAudio = renderAudio;
})();
