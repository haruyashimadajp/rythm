
  // ---------------------------------------------------------------------
  //  05 UZU: a whirlpool in a storm. Drum & bass at 174 BPM: two-step
  //  breaks with ghost snares and a wobbling reese bass.
  //  Scene: spiral arms turning round the eye, debris sucked inward,
  //  driving rain, lightning on the drops, and the screen shakes.
  // ---------------------------------------------------------------------
  // lightning strikes (beats): the start of each four-bar block of the drops
  const UZU_STRIKES = [48, 64, 80, 96, 144, 160, 176];
  const UZU_SHOCK = new Map(); // strike beat -> where the bolt hits the water (field units); a shock wave spreads from there
  rippleSong({
    id: 'uzu', title: 'UZU', jp: '渦', genre: 'Drum & Bass', level: 8,
    lede: '嵐の夜の渦潮の<strong>ドラムンベース</strong>。ドロップでは<strong>雷が落ちた所から衝撃波</strong>が渦を横切り、波紋は<strong>渦に流されて回り</strong>、最後は<strong>渦の目へ引き込まれて縮みます</strong>。石が一直線に跳ねる水切り連打と、渦を巻く長押しも。',
    theme: { ink: '#04030a', ink2: '#160c2e', panel: 'rgba(4, 3, 10, 0.86)', paper: '#f1edff', muted: '#9d95c0', accent: '#d8ff5c' },
    hues: ['#3de8ff', '#a86bff', '#ff3d9a', '#d8ff5c'],
    bpm: 174, bars: 52, speed: 0.11, attractFromBar: 12,
    sections: [
      { bar: 0, name: 'INTRO', hue: 1 }, { bar: 4, name: 'BUILD', hue: 0 }, { bar: 12, name: 'DROP', hue: 2 },
      { bar: 28, name: 'BREAK', hue: 1 }, { bar: 32, name: 'BUILD II', hue: 3 }, { bar: 36, name: 'DROP II', hue: 0 },
      { bar: 48, name: 'OUTRO', hue: 1 },
    ],
    // Em - C - Am - B
    chords: [
      { pad: [52, 55, 59, 64], bass: 40, lead: [71, 74, 76, 79] },
      { pad: [52, 55, 60, 64], bass: 36, lead: [72, 76, 79, 74] },
      { pad: [52, 57, 60, 64], bass: 33, lead: [69, 72, 76, 74] },
      { pad: [54, 59, 63, 66], bass: 35, lead: [71, 75, 78, 74] },
    ],
    kickOn: (bar, name) => name !== 'INTRO' && name !== 'BREAK',
    chart({ drop, skip, B }) {
      // INTRO
      drop(B(0), [0, 0], 1, '..o.o.o.o.', { a: -90, turn: 90 });
      drop(B(1, 2), [-0.35, 0.1], 0, '..o.o.oo', { a: 0, turn: 60 });
      drop(B(2, 2), [0.35, -0.1], 2, '..o.o.o.o.', { a: 180, turn: 60 });
      // BUILD: a drop every bar, swinging across, then stones
      const BS = [[-0.45, -0.18], [0.45, 0.18], [-0.45, 0.18], [0.45, -0.18], [-0.2, 0], [0.25, 0]];
      BS.forEach((p, k) => drop(B(4 + k), p, k % 4, k % 2 ? '..oo.o.o' : '..o.oo.o', { a: p[0] < 0 ? 0 : 180, turn: p[1] < 0 ? -45 : 45 }));
      skip(B(10), [0.6, -0.32], [-0.5, 0.2], 1, 'o.o.o.oo');
      skip(B(11), [-0.6, 0.3], [0.5, -0.2], 2, 'o.oooooo', { decay: 0.92 });
      // DROP: four-bar blocks: a run that heads for the middle, a skipping stream that carries on
      // from where it ended, a spiral hold, and a run from the other side
      const block = (bar, k) => {
        const s = k % 2 ? 1 : -1;
        // lightning strikes the water at the edge; its shock wave sweeps down across the whirlpool
        const hit = [0.35 * s, -0.62];
        UZU_SHOCK.set(B(bar), hit);
        drop(B(bar), hit, (k * 2) % 4, '..oo.oo.', { speed: 0.3, r0: 0.1, angs: [90 + 28 * s, 90 + 12 * s, 90 - 4 * s, 90 - 14 * s] });
        skip(B(bar + 1), [0.45 * s, 0.32], [-0.5 * s, -0.25], (k * 2 + 1) % 4, 'oooooooo', { decay: 0.94 });
        // the current carries this ring round the eye while the hold circles it
        const orbit = [1, 2, 3, 4].map((o) => { const a = Math.atan2(0.15, -0.25 * s) - o * 0.55 * s; return [o, Math.cos(a) * 0.29, Math.sin(a) * 0.2]; });
        drop(B(bar + 2), [-0.25 * s, 0.15], (k * 2 + 2) % 4, '..S---', { a: s < 0 ? 180 : 0, spin: 200 * s, turn: 60, path: orbit, ease: 'linear' });
        // and this one is dragged into the eye: a ring that closes, its notes spiralling inward
        drop(B(bar + 3), [0.3 * s, 0.1], (k * 2 + 3) % 4, '..o.oo.o', { speed: -0.13, r0: 0.5, a: s < 0 ? 200 : -20, turn: s < 0 ? 60 : -60 });
      };
      [12, 16, 20, 24].forEach((bar, k) => block(bar, k));
      // BREAK: the eye of the storm; one long spiral, then a ride outward
      drop(B(28), [0, 0], 1, '..S-------', { a: -90, speed: 0.09, spin: 300 });
      drop(B(30), [0, 0.02], 3, '..H---.o.o', { a: 90, speed: 0.09, turn: 80 });
      // BUILD II: stones faster and faster
      skip(B(32), [-0.65, -0.3], [0.6, 0.3], 0, 'o...o...o.o.o.o.', { decay: 0.97 });
      skip(B(34), [0.65, -0.3], [-0.6, 0.3], 3, 'o.o.o.o.oooooooo', { decay: 0.97 });
      // DROP II: the blocks again, mirrored, then a closing barrage of runs
      [36, 40].forEach((bar, k) => block(bar, k + 1));
      const R = [[0.4, 0.15], [-0.4, -0.15], [0.4, -0.15], [-0.4, 0.15]];
      R.forEach((p, k) => drop(B(44 + k), p, k % 4, k === 3 ? '..oooo..' : '..oo.ooo', { a: p[0] < 0 ? 0 : 180, turn: p[1] < 0 ? -40 : 40 }));
      // OUTRO
      drop(B(48), [0, 0], 0, '..o.o.oo', { a: -90, turn: 70 });
      drop(B(49), [-0.35, 0.05], 1, '..o.o.oo', { a: 0, turn: 70 });
      drop(B(50), [0.3, -0.05], 2, '..o.H---', { a: 180, turn: 60 });
    },
    song: {
      kick: { from: 170, to: 45, decay: 0.3, click: 1 },
      snare: { tone: 2100, decay: 0.15, body: 200 },
      pad: { wave: 'sawtooth', cutoff: 1100, level: 0.035, detune: 14, attack: 0.3 },
      delay: { beats: 0.75, feedback: 0.3, mix: 0.18 }, leadLevel: 0.5, leadSend: 0.22, padBus: 0.65, bassLevel: 0.85,
      // Zap: a saw that drops into its pitch through a closing band, with a square an octave down.
      lead(A, at, midi, dur) {
        const f0 = A.mtof(midi), len = Math.max(0.22, dur + 0.1);
        const bp = A.filter('bandpass', 4000, 1.5);
        bp.frequency.setValueAtTime(4000, at); bp.frequency.exponentialRampToValueAtTime(900, at + 0.15);
        bp.connect(A.decayGain(at, 0.32, 0.002, len)).connect(A.bus.lead);
        const o = A.osc('sawtooth', f0 * 2, at, len + 0.05); o.frequency.exponentialRampToValueAtTime(f0, at + 0.04); o.connect(bp);
        A.osc('square', f0 / 2, at, len).connect(A.decayGain(at, 0.06, 0.002, len)).connect(A.bus.lead);
      },
      instruments: {
        // Reese bass: two detuned saws and a sub, through a filter wobbled by an LFO (`rate` in beats per wobble).
        reese(A, at, midi, dur, rate) {
          const { ac } = A, f0 = A.mtof(midi), SPB = 60 / 174;
          const f = A.filter('lowpass', 380, 8);
          const lfo = A.osc('sine', 1 / (rate * SPB), at, dur + 0.02), lg = ac.createGain(); lg.gain.value = rate < 1 ? 900 : 260;
          lfo.connect(lg).connect(f.frequency);
          const gn = ac.createGain();
          gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(0.26, at + 0.01);
          gn.gain.setValueAtTime(0.26, at + dur - 0.04); gn.gain.exponentialRampToValueAtTime(0.0001, at + dur);
          f.connect(gn).connect(A.bus.bass);
          for (const det of [-14, 14]) { const o = A.osc('sawtooth', f0, at, dur + 0.02); o.detune.value = det; o.connect(f); }
          const sg = ac.createGain(); sg.gain.value = 0.9;
          A.osc('sine', f0 / 2, at, dur + 0.02).connect(sg).connect(gn);
        },
        thunder(A, at) {
          const lp = A.filter('lowpass', 900, 0.7);
          lp.frequency.setValueAtTime(900, at); lp.frequency.exponentialRampToValueAtTime(70, at + 2.4);
          A.noiseSrc(at, 2.6).connect(lp).connect(A.decayGain(at, 0.7, 0.01, 2.4)).connect(A.bus.fx);
          const crack = A.filter('highpass', 1500);
          A.noiseSrc(at, 0.2).connect(crack).connect(A.decayGain(at, 0.3, 0.001, 0.15)).connect(A.bus.fx);
        },
        // a sub drop that slides down into each drop
        sub(A, at) {
          const o = A.osc('sine', 110, at, 1.2); o.frequency.exponentialRampToValueAtTime(30, at + 1.1);
          o.connect(A.decayGain(at, 0.5, 0.01, 1.1)).connect(A.bus.bass);
        },
      },
      arrange(add, bar, b0, ch, name) {
        const SPB = 60 / 174;
        const twoStep = (ghosts) => {
          add(b0, 'kick'); add(b0 + 2.5, 'kick');
          add(b0 + 1, 'snare'); add(b0 + 3, 'snare');
          if (ghosts) { add(b0 + 1.75, 'kick', 0.7); add(b0 + 3.75, 'snare', 0.35); add(b0 + 2.25, 'snare', 0.25); }
        };
        if (name === 'INTRO') {
          if (bar >= 2) for (let i = 0; i < 8; i++) add(b0 + i / 2, 'hat', false);
          add(b0, 'reese', ch.bass, 4 * SPB, 4);
        } else if (name === 'BUILD' || name === 'BUILD II') {
          const late = name === 'BUILD' ? bar >= 8 : bar >= 34;
          if (!late) { twoStep(false); for (let i = 0; i < 16; i++) add(b0 + i / 4, 'hat', false, i % 2 ? 0.5 : 0.9); add(b0, 'reese', ch.bass, 4 * SPB, 2); }
          else {
            const div = (name === 'BUILD' ? bar < 10 : bar < 35) ? 2 : 4;
            for (let i = 0; i < 4 * div; i++) add(b0 + i / div, 'snare', 0.4 + 0.6 * (i / (4 * div)));
            for (let i = 0; i < 4; i++) add(b0 + i, 'kick');
            add(b0, 'reese', ch.bass, 4 * SPB, 1 / div);
            if (bar === 11 || bar === 35) { add(b0, 'riser', 4 * SPB); add(b0 + 3, 'sub'); }
          }
        } else if (name === 'DROP' || name === 'DROP II') {
          if (bar % 4 === 0) add(b0, 'crash');
          twoStep(true);
          for (let i = 0; i < 16; i++) add(b0 + i / 4, 'hat', i % 4 === 2, i % 2 ? 0.6 : 1);
          add(b0, 'reese', ch.bass, 4 * SPB, name === 'DROP' ? (bar % 4 === 3 ? 0.25 : 0.5) : 0.25);
        } else if (name === 'BREAK') {
          for (let i = 0; i < 4; i++) add(b0 + i + 0.5, 'hat', false, 0.6);
          add(b0, 'reese', ch.bass, 4 * SPB, 4);
          if (bar === 31) { for (let i = 0; i < 4; i++) add(b0 + i, 'kick'); for (let i = 8; i < 16; i++) add(b0 + i / 4, 'snare', 0.3 + (i - 8) * 0.08); }
        } else if (name === 'OUTRO') {
          if (bar === 48) add(b0, 'crash');
          if (bar <= 49) { twoStep(false); for (let i = 0; i < 8; i++) add(b0 + i / 2, 'hat', false); }
          if (bar <= 50) add(b0, 'reese', ch.bass, 4 * SPB, 2);
          if (bar === 51) add(b0, 'sub');
        }
      },
      // thunder on each lightning strike
      extra(add) { for (const beat of UZU_STRIKES) add(beat, 'thunder'); },
    },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const BOLT = hex('#e8f4ff'), ARM = [hex('#3de8ff'), hex('#a86bff')];
      let lastShake = -1, struck = new Set();
      // a jagged bolt from the top of the screen down to the water
      function drawBolt(beat, age) {
        const rnd = kit.mulberry32(Math.round(beat * 31));
        const hit = UZU_SHOCK.get(beat), [hx, hy] = hit ? f.toScreen(hit[0], hit[1]) : [(0.2 + rnd() * 0.6) * f.W, f.H * (0.45 + rnd() * 0.4)];
        let x = hx + (rnd() - 0.5) * 120, y = -10;
        const endY = hy;
        g.strokeStyle = rgba(BOLT, 0.9 * (1 - age / 0.2)); g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(x, y);
        while (y < endY - 30) { x += (hx - x) * 0.25 + (rnd() - 0.5) * 50; y += 20 + rnd() * 30; g.lineTo(x, y); }
        g.lineTo(hx, hy);
        g.stroke();
      }
      return {
        back(c) {
          const { F } = f;
          // spiral arms turning round the eye, faster in the drops
          const speed = c.sec.name.startsWith('DROP') ? 0.9 : c.sec.name === 'BREAK' ? 0.15 : 0.4;
          const spin = c.now * speed;
          g.globalCompositeOperation = 'lighter';
          for (let arm = 0; arm < 6; arm++) {
            g.strokeStyle = rgba(ARM[arm % 2], 0.09 + 0.07 * c.pulse); g.lineWidth = 2 + (arm % 3);
            g.beginPath();
            for (let k = 0; k <= 60; k++) {
              const t = k / 60, r = 0.04 + t * 1.1, a = spin + (arm * TAU) / 6 + t * 5.5;
              const [x, y] = f.toScreen(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.75);
              if (k) g.lineTo(x, y); else g.moveTo(x, y);
            }
            g.stroke();
          }
          // debris drawn into the eye
          g.fillStyle = rgba(ARM[0], 0.35);
          for (let i = 0; i < 70; i++) {
            const u = (c.now * (0.08 + hash(i) * 0.08) + hash(i + 100)) % 1, r = (1 - u) * 1.0, a = hash(i + 200) * TAU + spin * 1.5 + u * 6;
            const [x, y] = f.toScreen(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.75);
            g.beginPath(); g.arc(x, y, 1 + u * 1.5, 0, TAU); g.fill();
          }
          g.globalCompositeOperation = 'source-over';
          const eye = g.createRadialGradient(F.cx, F.cy, 0, F.cx, F.cy, F.u * 0.3);
          eye.addColorStop(0, rgba(f.INK, 0.7)); eye.addColorStop(1, rgba(f.INK, 0));
          g.fillStyle = eye; g.fillRect(F.cx - F.u * 0.3, F.cy - F.u * 0.3, F.u * 0.6, F.u * 0.6);
          // the drops shake the screen on every kick
          const beat = Math.floor(c.beat);
          if (c.sec.name.startsWith('DROP') && beat !== lastShake && c.beat - beat < 0.1) { lastShake = beat; f.shake(beat % 4 === 0 ? 9 : 4); }
        },
        front(c) {
          if (!kit.reduceMotion) {
            // driving rain
            const n = c.sec.name.startsWith('DROP') ? 120 : c.sec.name === 'BREAK' ? 40 : 80;
            g.strokeStyle = rgba(BOLT, 0.1); g.lineWidth = 1;
            g.beginPath();
            for (let i = 0; i < n; i++) {
              const sp = 1100 + hash(i * 7 + 3) * 700, x = hash(i * 7 + 1) * (f.W + 300) - 50;
              const y = ((c.now * sp + hash(i * 7 + 2) * (f.H + 80)) % (f.H + 80)) - 40;
              g.moveTo(x - y * 0.35, y); g.lineTo(x - y * 0.35 - 9, y + 26);
            }
            g.stroke();
          }
          // lightning
          for (const beat of UZU_STRIKES) {
            const age = c.now - beat * f.SPB;
            if (age < 0) break;
            if (age > 0.2) continue;
            if (!struck.has(beat)) { struck.add(beat); f.flash(0.55, BOLT); f.shake(14); }
            drawBolt(beat, age);
          }
        },
        hit(c, n, grade, x, y) { if (grade === 'perfect' && c.sec.name.startsWith('DROP')) f.burst(x, y, BOLT, 0.4, 1.6); },
        reset() { lastShake = -1; struck = new Set(); },
      };
    },
  });
