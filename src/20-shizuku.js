
  // ---------------------------------------------------------------------
  //  01 SHIZUKU: a rainy night. Lo-fi hip hop at 84 BPM; the gentle
  //  first song, which also brings in skipping stones.
  //  Scene: rain rings all over the surface, street lamps reflected in
  //  the water, rain streaks in front.
  // ---------------------------------------------------------------------
  rippleSong({
    id: 'shizuku', title: 'SHIZUKU', jp: '雫', genre: 'Lo-fi Hip Hop', level: 2,
    lede: '雨の夜の水たまり。ローファイ・ヒップホップのゆったりしたビートで、波紋の基本と<strong>水切り</strong>を覚える一曲。軒先からは<strong>雫が同じ所に落ち続け</strong>、二つの雨粒の波紋が<strong>交わる点</strong>では同時押し、窓を伝う雫は波紋ごと流れていきます。',
    theme: { ink: '#060d16', ink2: '#0f2233', panel: 'rgba(6, 13, 22, 0.84)', paper: '#e9f1f5', muted: '#8ea4b3', accent: '#ffc27a' },
    hues: ['#7fd8e6', '#a7a4ff', '#ffc27a', '#ff9fb8'],
    bpm: 84, bars: 32, speed: 0.1, attractFromBar: 12,
    sections: [
      { bar: 0, name: 'INTRO', hue: 0 }, { bar: 4, name: 'VERSE', hue: 1 }, { bar: 12, name: 'CHORUS', hue: 2 },
      { bar: 20, name: 'BREAK', hue: 3 }, { bar: 24, name: 'CHORUS II', hue: 2 }, { bar: 30, name: 'OUTRO', hue: 0 },
    ],
    // Fmaj7 - Em7 - Dm9 - Cmaj9
    chords: [
      { pad: [57, 60, 64, 67], bass: 41, lead: [69, 72, 76, 79], ep: [57, 60, 64, 67] },
      { pad: [55, 59, 62, 64], bass: 40, lead: [67, 71, 74, 76], ep: [55, 59, 62, 64] },
      { pad: [53, 57, 60, 64], bass: 38, lead: [69, 72, 74, 77], ep: [57, 60, 64, 65] },
      { pad: [55, 59, 62, 64], bass: 36, lead: [67, 71, 74, 76], ep: [52, 55, 59, 62] },
    ],
    kickOn: (bar, name) => name !== 'INTRO' && name !== 'BREAK',
    chart({ drop, skip, pulse, cross, B }) {
      // INTRO: one drop at a time, half notes, then quarters
      drop(B(0), [0, 0], 0, '..o...o...o.', { a: -90, turn: 90 });
      drop(B(1, 2), [-0.35, 0.1], 1, '..o...o.o.', { a: 0, turn: -70 });
      drop(B(3), [0.3, -0.1], 2, '..o.o.o.', { a: 180, turn: 60 });
      // VERSE: drops alternate sides with a short answer between; a first eighth pair, a first hold
      drop(B(4), [0.35, -0.12], 2, '..o.o.o.oo', { a: 180, turn: 55 });
      // drips from the eaves: the same spot, twice
      pulse(B(5, 2), [-0.05, 0.25], 0, { a: -90, off: 1, n: 2, gap: 1 });
      drop(B(6), [-0.35, 0.12], 3, '..o.o.o.oo', { a: 0, turn: -55 });
      pulse(B(7, 2), [0.05, -0.25], 1, { a: 90, off: 1, n: 2, gap: 1 });
      drop(B(8), [0.3, 0.15], 0, '..o.o.H---', { a: 200, turn: 60 });
      pulse(B(9, 2), [-0.35, -0.1], 2, { a: 0, off: 1, n: 3, gap: 0.5 });
      drop(B(10), [0.25, -0.2], 3, '..o.o.oo', { a: 180, turn: 50 });
      skip(B(11, 1), [-0.55, 0.3], [0.1, 0.1], 2, 'o.o.o.');
      // CHORUS: a new drop every bar from a new place; a skipping stone closes each half
      const SRC = [[-0.45, -0.18], [0.45, 0.18], [0.45, -0.18], [-0.45, 0.18], [0, -0.22], [0, 0.22]];
      [12, 13, 14, 16, 17, 18].forEach((bar, k) => {
        drop(B(bar), SRC[k], k % 4, k % 2 ? '..o.oo.o' : '..o.o.oo', { a: k % 2 ? 200 : -20, turn: 40 });
      });
      skip(B(15, 1), [0.6, -0.3], [-0.2, 0.2], 3, 'o.o.o.');
      skip(B(19, 1), [-0.6, -0.3], [0.2, 0.2], 1, 'o.o.oo');
      // BREAK: slow rings from the centre; ride them outward, and round
      drop(B(20), [0, 0], 3, '..H---..S---', { a: -90, turn: 135, speed: 0.08, spin: 90 });
      // a raindrop running down the glass, its ring sliding with it
      drop(B(22), [0.15, -0.25], 1, '..o.o.o.H---', { a: 30, turn: 100, speed: 0.08, path: [[7, 0.15, 0.22]], ease: 'linear' });
      // CHORUS II: two raindrops fall together; one sings, then the other, and where their rings meet, both keys at once
      [[24, -0.12], [25, 0.12], [26, -0.05], [27, 0.1]].forEach(([b, y], k) => {
        const A = drop(B(b), [-0.35, y], (k * 2) % 4, '..o.oo', { a: 0, turn: y < 0 ? 40 : -40 });
        const Bd = drop(B(b), [0.35, y], (k * 2 + 1) % 4, '......o', { a: 180, turn: 0 });
        cross(B(b, 4), A, Bd);
      });
      drop(B(28), [0, -0.1], 2, '..o.oo..', { a: 90, turn: 50 });
      skip(B(29, 1), [-0.6, 0.3], [0.5, -0.2], 0, 'o.o.oo');
      // OUTRO
      drop(B(30), [0, 0], 0, '..o...o.H---', { a: -90, turn: 120, speed: 0.08 });
    },
    song: {
      kick: { from: 120, to: 42, decay: 0.38, level: 0.9 },
      snare: { tone: 1300, decay: 0.22, body: 170 },
      bass: { wave: 'triangle', subShift: 0, sub: 1, q: 2, open: 500, close: 160 },
      pad: { wave: 'triangle', cutoff: 900, level: 0.035, detune: 6, attack: 0.6 },
      delay: { beats: 0.75, feedback: 0.36, mix: 0.28 }, leadLevel: 0.6, leadSend: 0.5, padBus: 0.8,
      // Water drop: a sine that swoops up into its pitch, then rings into the reverb.
      lead(A, at, midi, dur) {
        const { ac } = A, f0 = A.mtof(midi);
        const gn = ac.createGain();
        gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(0.28, at + 0.004);
        if (dur < 0.3) gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);
        else { gn.gain.exponentialRampToValueAtTime(0.11, at + 0.2); gn.gain.setValueAtTime(0.11, at + dur); gn.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.4); }
        gn.connect(A.bus.lead);
        const end = at + Math.max(0.6, dur + 0.45);
        const o = A.osc('sine', f0, at, end - at);
        o.frequency.setValueAtTime(f0 * 0.7, at); o.frequency.exponentialRampToValueAtTime(f0, at + 0.035);
        const o2 = A.osc('triangle', f0 * 2, at, 0.2);
        o.connect(gn); o2.connect(A.decayGain(at, 0.1, 0.002, 0.12)).connect(gn);
      },
      instruments: {
        // Electric piano: sine tones with a soft bell on top and a slow tremolo.
        ep(A, at, midis, dur, level = 1) {
          const { ac } = A;
          const f = A.filter('lowpass', 1800);
          const gn = ac.createGain();
          gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(0.07 * level, at + 0.01);
          gn.gain.exponentialRampToValueAtTime(0.03 * level, at + 0.4); gn.gain.setValueAtTime(0.03 * level, at + dur);
          gn.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.3);
          const trem = A.osc('sine', 4.2, at, dur + 0.35), tg = ac.createGain(); tg.gain.value = 0.012 * level;
          trem.connect(tg).connect(gn.gain);
          f.connect(gn).connect(A.bus.pad);
          for (const m of midis) {
            const fr = A.mtof(m);
            A.osc('sine', fr, at, dur + 0.35).connect(f);
            A.osc('sine', fr * 4.01, at, 0.3).connect(A.decayGain(at, 0.25, 0.002, 0.25)).connect(f);
          }
        },
      },
      // vinyl crackle and rain under everything
      start(A, at) {
        const { ac } = A, sr = ac.sampleRate, len = sr * 3;
        const buf = ac.createBuffer(1, len, sr), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.02 + (Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : 0);
        const crackle = ac.createBufferSource(); crackle.buffer = buf; crackle.loop = true;
        const hp = A.filter('highpass', 900), cg = ac.createGain(); cg.gain.value = 0.11;
        crackle.connect(hp).connect(cg).connect(A.bus.drum);
        const rain = ac.createBufferSource(); rain.buffer = A.noise; rain.loop = true;
        const lp = A.filter('lowpass', 2600), hp2 = A.filter('highpass', 500), rg = ac.createGain();
        rg.gain.setValueAtTime(0, at - 2); rg.gain.linearRampToValueAtTime(0.05, at);
        rain.connect(lp).connect(hp2).connect(rg).connect(A.bus.fx);
        crackle.start(at - 2); rain.start(at - 2);
        this.amb = [crackle, rain];
      },
      stop() { if (this.amb) for (const s of this.amb) { try { s.stop(); } catch (e) { /* already stopped */ } } this.amb = null; },
      arrange(add, bar, b0, ch, name) {
        const swing = (i) => b0 + i / 2 + (i % 2 ? 0.08 : 0);
        const keys = (lv) => { add(b0, 'ep', ch.ep, 1.4 * 60 / 84, lv); add(b0 + 1.5 + 0.08, 'ep', ch.ep, 2 * 60 / 84, lv * 0.8); };
        if (name === 'INTRO') {
          keys(0.8);
          if (bar >= 2) for (let i = 0; i < 8; i++) add(swing(i), 'hat', false, i % 2 ? 0.6 : 0.9);
        } else if (name === 'VERSE' || name === 'CHORUS' || name === 'CHORUS II') {
          keys(name === 'VERSE' ? 0.9 : 1.1);
          add(b0, 'kick'); add(b0 + 1.5 + 0.08, 'kick', 0.6); add(b0 + 2.5 + 0.08, 'kick', 0.85);
          add(b0 + 1, 'snare'); add(b0 + 3, 'snare');
          if (name !== 'VERSE') add(b0 + 3.75 + 0.04, 'snare', 0.25);
          for (let i = 0; i < 8; i++) add(swing(i), 'hat', false, i % 2 ? 0.55 : 0.9);
          add(b0, 'bass', ch.bass, 1.4 * 60 / 84); add(b0 + 2.5 + 0.08, 'bass', ch.bass, 1.2 * 60 / 84);
          if (name !== 'VERSE' && bar % 4 === 0) add(b0, 'crash');
        } else if (name === 'BREAK') {
          add(b0, 'ep', ch.ep, 3.6 * 60 / 84, 0.8);
          add(b0, 'bass', ch.bass, 3.5 * 60 / 84);
          if (bar === 23) { add(b0 + 2, 'riser', 2 * 60 / 84); for (let i = 12; i < 16; i++) add(b0 + i / 4, 'snare', 0.4 + (i - 12) * 0.15); }
        } else if (name === 'OUTRO') {
          keys(0.7);
          if (bar === 30) { add(b0, 'kick'); add(b0 + 1, 'snare', 0.6); add(b0 + 2.5, 'kick', 0.7); }
          if (bar === 31) add(b0, 'bass', ch.bass, 4 * 60 / 84);
        }
      },
    },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const LAMP = hex('#ffb867'), RAINC = hex('#cfe6f2');
      const LAMPS = [[-0.62, -0.36, 1], [0.58, -0.3, 0.8], [0.2, 0.42, 0.6]];
      const RATE = { INTRO: 4, VERSE: 6, CHORUS: 9, BREAK: 13, 'CHORUS II': 10, OUTRO: 3 };
      return {
        // lamplight broken into wobbling slices by the rain
        back(c) {
          g.globalCompositeOperation = 'lighter';
          for (const [lx, ly, s] of LAMPS) {
            const [x, y] = f.toScreen(lx, ly), len = f.F.u * 0.34 * s;
            for (let i = 0; i < 18; i++) {
              const u = i / 17, yy = y - len / 2 + u * len;
              const w = f.F.u * 0.06 * s * (1 - Math.abs(u - 0.45) * 1.3) * (0.75 + 0.35 * Math.sin(c.now * 3 + i * 1.7));
              if (w <= 0) continue;
              g.fillStyle = rgba(LAMP, 0.11 + 0.05 * c.pulse);
              g.beginPath(); g.ellipse(x + Math.sin(c.now * 2.3 + i) * 4, yy, w / 2, len / 40, 0, 0, TAU); g.fill();
            }
            const glow = g.createRadialGradient(x, y, 0, x, y, f.F.u * 0.22 * s);
            glow.addColorStop(0, rgba(LAMP, 0.12)); glow.addColorStop(1, rgba(LAMP, 0));
            g.fillStyle = glow; g.fillRect(x - f.F.u * 0.22, y - f.F.u * 0.22, f.F.u * 0.44, f.F.u * 0.44);
          }
          g.globalCompositeOperation = 'source-over';
        },
        // raindrops landing everywhere: small rings that fade; drips from the eaves fall onto their spot
        surface(c) {
          for (const d of f.DROPS) {
            if (d.rings < 2) continue;
            if (d.beat > c.beat + 2) break;
            for (let k = 0; k < d.rings; k++) {
              const u = (d.beat + k * d.gap - c.beat) / 0.6;
              if (u < 0 || u > 1) continue;
              const [x, y] = f.toScreen(d.x, d.y), h = u * f.F.u * 0.35;
              g.fillStyle = rgba(RAINC, 0.8 * (1 - u * 0.5));
              g.beginPath(); g.ellipse(x, y - h, 2.5, 4.5, 0, 0, TAU); g.fill();
              g.strokeStyle = rgba(RAINC, 0.25); g.lineWidth = 1;
              g.beginPath(); g.moveTo(x, y - h - 4); g.lineTo(x, y - h - 18); g.stroke();
            }
          }
          if (kit.reduceMotion) return;
          const rate = RATE[c.sec.name] || 6;
          const k1 = Math.floor(c.now * rate), k0 = Math.floor((c.now - 1.2) * rate);
          g.lineWidth = 1;
          for (let k = k0; k <= k1; k++) {
            const age = c.now - k / rate;
            if (age < 0) continue;
            const x = (hash(k * 3 + 1) * 2 - 1) * 0.9, y = (hash(k * 3 + 2) * 2 - 1) * 0.55;
            g.strokeStyle = rgba(RAINC, 0.2 * (1 - age / 1.2));
            f.ringPath(x, y, 0.008 + age * 0.06); g.stroke();
          }
        },
        // rain falling past, slanting a little
        front(c) {
          if (kit.reduceMotion) return;
          const n = c.sec.name === 'BREAK' ? 90 : c.sec.name.startsWith('CHORUS') ? 70 : 45;
          g.strokeStyle = rgba(RAINC, 0.1); g.lineWidth = 1;
          g.beginPath();
          for (let i = 0; i < n; i++) {
            const sp = 600 + hash(i * 7 + 3) * 500, x = hash(i * 7 + 1) * (f.W + 100) - 50;
            const y = ((c.now * sp + hash(i * 7 + 2) * (f.H + 80)) % (f.H + 80)) - 40;
            g.moveTo(x - y * 0.12, y); g.lineTo(x - y * 0.12 - 3, y + 18);
          }
          g.stroke();
        },
      };
    },
  });
