
  // ---------------------------------------------------------------------
  //  02 KOI: a sunlit pond. Disco house at 124 BPM: four on the floor,
  //  offbeat bass and piano stabs.
  //  Scene: koi gliding under the surface, lily pads with lotus flowers
  //  that bounce on the kick, caustic light and sun glints.
  // ---------------------------------------------------------------------
  rippleSong({
    id: 'koi', title: 'KOI', jp: '鯉', genre: 'Disco House', level: 4,
    lede: '陽の差す池。鯉がゆったり泳ぐ下で、四つ打ちのハウスが鳴り続けます。裏拍のベースとピアノに乗って、<strong>8分の連打</strong>と<strong>回る長押し</strong>が始まります。',
    theme: { ink: '#03140f', ink2: '#0b3a2c', panel: 'rgba(3, 20, 15, 0.84)', paper: '#f2f7ee', muted: '#94b8a6', accent: '#ffd25e' },
    hues: ['#ff8a3d', '#ffd25e', '#4fe0b0', '#ff7eb6'],
    bpm: 124, bars: 40, speed: 0.12, attractFromBar: 16,
    sections: [
      { bar: 0, name: 'INTRO', hue: 2 }, { bar: 4, name: 'GROOVE', hue: 0 }, { bar: 12, name: 'BUILD', hue: 1 },
      { bar: 16, name: 'CHORUS', hue: 3 }, { bar: 24, name: 'BREAK', hue: 2 }, { bar: 28, name: 'CHORUS II', hue: 0 },
      { bar: 36, name: 'OUTRO', hue: 1 },
    ],
    // Am9 - D9 - Gmaj9 - Em9
    chords: [
      { pad: [60, 64, 67, 71], bass: 45, lead: [69, 72, 76, 79] },
      { pad: [60, 64, 66, 69], bass: 38, lead: [69, 74, 78, 76] },
      { pad: [59, 62, 66, 69], bass: 43, lead: [71, 74, 78, 79] },
      { pad: [59, 62, 66, 67], bass: 40, lead: [67, 71, 74, 76] },
    ],
    kickOn: (bar, name) => name !== 'INTRO' && name !== 'BREAK',
    chart({ drop, skip, B }) {
      // INTRO
      drop(B(0), [0, 0], 2, '..o.o.o.o.', { a: -90, turn: 80 });
      drop(B(1, 2), [-0.35, 0.05], 0, '..o.o.o.', { a: 0, turn: -60 });
      drop(B(2, 2), [0.35, -0.05], 1, '..o.o.oo', { a: 180, turn: 60 });
      drop(B(3, 2), [-0.1, 0.25], 3, '..o.o.', { a: -90, turn: 50 });
      // GROOVE: eighth pairs, short answers from the middle, a hold, a skipping stone
      drop(B(4), [0.4, -0.15], 0, '..o.o.oo.o', { a: 180, turn: -45 });
      drop(B(5, 2), [-0.1, 0.2], 3, '..o.oo', { a: -90, turn: 45 });
      drop(B(6), [-0.4, 0.15], 1, '..o.o.oo.o', { a: 0, turn: -45 });
      drop(B(7, 2), [0.1, -0.2], 2, '..o.oo', { a: 90, turn: 45 });
      drop(B(8), [0.35, 0.18], 2, '..o.ooH---', { a: 200, turn: 50 });
      drop(B(9, 2), [-0.3, -0.15], 0, '..o.oo', { a: 0, turn: 40 });
      skip(B(10, 1), [-0.65, 0.3], [0.1, 0], 3, 'o.o.o.oo');
      drop(B(11), [0.4, 0], 0, '..o.o.o.', { a: 180, turn: -50 });
      // BUILD: two drops land together and take turns, left, right, left, right; then a run
      [[12, -0.42, -0.1, 0.42, 0.1], [13, -0.4, 0.15, 0.4, -0.15], [14, -0.2, -0.25, 0.2, 0.25]].forEach(([b, x1, y1, x2, y2]) => {
        drop(B(b), [x1, y1], 1, '..o...o.', { a: 0, turn: 40 });
        drop(B(b), [x2, y2], 3, '....o...o.', { a: 180, turn: -40 });
      });
      drop(B(15), [0, 0], 1, '..o.oooo', { a: -90, turn: 40 });
      // CHORUS: a drop every bar from somewhere new; every fourth ends in a hold that circles round
      const SRC = [[-0.45, -0.18], [0.45, 0.18], [0.45, -0.18], [-0.45, 0.18], [0, -0.22], [0, 0.22], [-0.5, 0], [0.5, 0]];
      SRC.forEach((p, k) => {
        const pat = k % 4 === 3 ? '..o.S---' : k % 2 ? '..o.oo.o' : '..o.o.oo';
        drop(B(16 + k), p, k % 4, pat, { a: k % 2 ? 200 : -20, turn: 40, spin: k === 3 ? 140 : -140 });
      });
      // BREAK: a slow ring to ride, then a long skip across the pond
      drop(B(24), [0, 0], 2, '..H---..S---', { a: -90, turn: 135, speed: 0.09, spin: -120 });
      skip(B(26, 1), [0.62, 0.3], [-0.3, -0.12], 0, 'o.o.o.o.o.oo');
      // CHORUS II: one side calls, the other answers
      [[28, -0.4, -0.15, 0.4, 0.15], [30, 0.4, -0.15, -0.4, 0.15], [32, 0, -0.25, 0, 0.25]].forEach(([b, x1, y1, x2, y2], k) => {
        drop(B(b), [x1, y1], (k * 2) % 4, '..o.o.oo', { a: -60, turn: 30 });
        drop(B(b + 1), [x2, y2], (k * 2 + 1) % 4, '..o.o.oo', { a: 120, turn: 30 });
      });
      drop(B(34), [-0.3, 0], 1, '..o.oo.oo.', { a: 0, turn: 50 });
      drop(B(35), [0.3, 0], 3, '..o.H---', { a: 180, turn: 50 });
      // OUTRO
      drop(B(36), [0, 0], 2, '..o.o.o.o.', { a: -90, turn: 75 });
      drop(B(37, 2), [0.3, 0.1], 1, '..o.o.', { a: 180, turn: 60 });
      drop(B(38), [-0.2, -0.1], 0, '..o...H---', { a: 0, turn: 120, speed: 0.09 });
    },
    song: {
      kick: { from: 150, to: 45, decay: 0.34, click: 1 },
      bass: { wave: 'sawtooth', subShift: -12, sub: 0.5, q: 7, open: 1100, close: 200 },
      pad: { wave: 'sawtooth', cutoff: 1400, level: 0.03, detune: 10, attack: 0.25 },
      delay: { beats: 0.75, feedback: 0.3, mix: 0.2 }, leadLevel: 0.55, leadSend: 0.3, padBus: 0.7,
      // Marimba: a warm sine with a bright overtone that dies at once.
      lead(A, at, midi, dur) {
        const f0 = A.mtof(midi), len = Math.max(0.4, dur + 0.2);
        A.osc('sine', f0, at, len).connect(A.decayGain(at, 0.3, 0.003, len)).connect(A.bus.lead);
        A.osc('sine', f0 * 4, at, 0.12).connect(A.decayGain(at, 0.09, 0.001, 0.08)).connect(A.bus.lead);
        A.osc('sine', f0 * 10, at, 0.03).connect(A.decayGain(at, 0.03, 0.001, 0.02)).connect(A.bus.lead);
      },
      instruments: {
        // House piano stab: detuned square and saw through a bright band.
        stab(A, at, midis, level = 1) {
          const f = A.filter('bandpass', 1500, 0.6), gn = A.decayGain(at, 0.06 * level, 0.003, 0.22);
          f.connect(gn).connect(A.bus.pad);
          for (const m of midis) for (const [type, det] of [['square', -6], ['sawtooth', 6]]) {
            const o = A.osc(type, A.mtof(m + 12), at, 0.3); o.detune.value = det; o.connect(f);
          }
        },
      },
      arrange(add, bar, b0, ch, name) {
        const SPB = 60 / 124;
        const four = () => { for (let i = 0; i < 4; i++) add(b0 + i, 'kick'); };
        const clap = () => { add(b0 + 1, 'clap'); add(b0 + 3, 'clap'); };
        const offHats = (open) => { for (let i = 0; i < 4; i++) add(b0 + i + 0.5, 'hat', open); };
        const offBass = () => { for (let i = 0; i < 4; i++) { add(b0 + i + 0.5, 'bass', ch.bass + (i % 2 ? 12 : 0), SPB * 0.42); } };
        const stabs = (lv) => { for (const s of [0.5, 1.5, 2.75, 3.5]) add(b0 + s, 'stab', ch.pad, lv); };
        if (name === 'INTRO') {
          if (bar >= 1) offHats(false);
          if (bar >= 2) for (let i = 0; i < 4; i++) add(b0 + i, 'kick', 0.6);
        } else if (name === 'GROOVE') {
          four(); clap(); offHats(true); offBass();
          for (let i = 0; i < 16; i++) if (i % 4 !== 2) add(b0 + i / 4, 'hat', false, 0.5);
          if (bar % 2) stabs(0.7);
        } else if (name === 'BUILD') {
          four(); offBass();
          const div = bar < 14 ? 1 : bar < 15 ? 2 : 4;
          for (let i = 0; i < 4 * div; i++) add(b0 + i / div, 'clap', 0.5 + (i / (4 * div)) * 0.5);
          if (bar === 14) add(b0, 'riser', 8 * SPB);
        } else if (name === 'CHORUS' || name === 'CHORUS II') {
          if (bar % 4 === 0) add(b0, 'crash');
          four(); clap(); offHats(true); offBass(); stabs(1);
          for (let i = 0; i < 16; i++) add(b0 + i / 4, 'shaker', i % 2 ? 0.6 : 1);
        } else if (name === 'BREAK') {
          stabs(0.6);
          add(b0, 'bass', ch.bass, SPB * 3.5);
          if (bar === 27) { add(b0, 'riser', 4 * SPB); for (let i = 8; i < 16; i++) add(b0 + i / 4, 'clap', 0.4 + (i - 8) * 0.07); }
        } else if (name === 'OUTRO') {
          if (bar === 36) add(b0, 'crash');
          if (bar <= 38) { four(); offHats(false); }
          if (bar <= 37) { clap(); offBass(); }
          if (bar === 39) add(b0, 'stab', ch.pad, 0.8);
        }
      },
    },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const PAD = hex('#1f6b45'), PAD_DARK = hex('#134a30'), LOTUS = hex('#ff9cc8'), SUN = hex('#fff3c4');
      const KOI = [hex('#ff7a2e'), hex('#f4efe6'), hex('#ffcb47'), hex('#e8452c')];
      const PADS = [[-0.7, -0.38, 0.09, 0.3, true], [0.68, 0.36, 0.11, 1.8, true], [-0.62, 0.4, 0.07, 4, false], [0.72, -0.4, 0.075, 2.6, false], [0.05, 0.47, 0.06, 5.1, false]];
      // each koi swims a slow figure; its body follows the path a moment behind the head
      const FISH = [0, 1, 2, 3].map((i) => ({ w1: 0.13 + i * 0.03, w2: 0.21 + i * 0.025, p1: i * 1.9, p2: i * 2.7, col: KOI[i], spot: KOI[(i + 1) % 4], size: 0.9 + (i % 2) * 0.25 }));
      const fishAt = (fi, t) => [0.66 * Math.sin(t * fi.w1 + fi.p1) + 0.08 * Math.sin(t * fi.w1 * 2.7), 0.4 * Math.sin(t * fi.w2 + fi.p2)];
      function drawFish(fi, now) {
        // spine: where the head was a moment ago, with a swimming wave down the body
        const N = 14, spine = [];
        for (let k = 0; k < N; k++) spine.push(fishAt(fi, now - k * 0.13));
        const pts = spine.map(([x, y], k) => {
          const [px, py] = spine[Math.max(0, k - 1)], [qx, qy] = spine[Math.min(N - 1, k + 1)];
          const a = Math.atan2(qy - py, qx - px), w = Math.sin(now * 5 + fi.p1 - k * 0.55) * 0.005 * (k / N);
          return f.toScreen(x - Math.sin(a) * w, y + Math.cos(a) * w);
        });
        const len = f.F.u * 0.03 * fi.size;
        const width = (k) => len * (k < 3 ? 0.55 + k * 0.17 : Math.max(0.12, 1.05 - (k - 3) * 0.09));
        const side = (k, sgn) => {
          const [px, py] = pts[Math.max(0, k - 1)], [qx, qy] = pts[Math.min(N - 1, k + 1)];
          const a = Math.atan2(qy - py, qx - px) + (sgn * Math.PI) / 2;
          return [pts[k][0] + Math.cos(a) * width(k), pts[k][1] + Math.sin(a) * width(k)];
        };
        g.save();
        g.globalAlpha = 0.6;
        // pectoral fins and the tail fan
        const [fx, fy] = pts[3], fa = Math.atan2(pts[2][1] - pts[4][1], pts[2][0] - pts[4][0]);
        g.fillStyle = rgba(fi.col, 0.55);
        for (const sg of [-1, 1]) {
          const a = fa + sg * 2.2;
          g.beginPath(); g.ellipse(fx + Math.cos(a) * len * 0.9, fy + Math.sin(a) * len * 0.9, len * 0.7, len * 0.28, a, 0, TAU); g.fill();
        }
        const [tx, ty] = pts[N - 1], ta = Math.atan2(pts[N - 1][1] - pts[N - 3][1], pts[N - 1][0] - pts[N - 3][0]), wag = Math.sin(now * 5 + fi.p1 - 8) * 0.4;
        g.beginPath(); g.moveTo(tx, ty);
        g.quadraticCurveTo(tx + Math.cos(ta + 0.9 + wag) * len * 1.6, ty + Math.sin(ta + 0.9 + wag) * len * 1.6, tx + Math.cos(ta + wag) * len * 1.3, ty + Math.sin(ta + wag) * len * 1.3);
        g.quadraticCurveTo(tx + Math.cos(ta - 0.9 + wag) * len * 1.6, ty + Math.sin(ta - 0.9 + wag) * len * 1.6, tx, ty);
        g.fill();
        // the body, with patches of its second colour
        g.beginPath();
        for (let k = 0; k < N; k++) { const [x, y] = side(k, 1); if (k) g.lineTo(x, y); else g.moveTo(x, y); }
        for (let k = N - 1; k >= 0; k--) { const [x, y] = side(k, -1); g.lineTo(x, y); }
        g.closePath();
        g.fillStyle = rgba(fi.col, 1); g.fill();
        g.clip();
        g.fillStyle = rgba(fi.spot, 1);
        for (const k of [2, 6, 9]) { g.beginPath(); g.arc(pts[k][0] + len * 0.3, pts[k][1], len * 0.8, 0, TAU); g.fill(); }
        g.restore();
      }
      return {
        back(c) {
          // caustic light network, brighter on the beat
          if (!kit.reduceMotion) {
            g.globalCompositeOperation = 'lighter';
            g.strokeStyle = rgba(SUN, 0.03 + 0.025 * c.pulse); g.lineWidth = 2;
            for (let i = 0; i < 10; i++) {
              g.beginPath();
              for (let x = -20; x <= f.W + 20; x += 28) {
                const y = (f.H * (i + 0.5)) / 10 + Math.sin(x * 0.011 + c.now * 0.7 + i * 1.3) * 18 + Math.sin(x * 0.027 - c.now * 0.5 + i) * 7;
                if (x < 0) g.moveTo(x, y); else g.lineTo(x, y);
              }
              g.stroke();
            }
            g.globalCompositeOperation = 'source-over';
          }
          const ray = g.createLinearGradient(0, 0, f.W, f.H);
          ray.addColorStop(0, rgba(SUN, 0.08)); ray.addColorStop(0.5, rgba(SUN, 0)); ray.addColorStop(1, rgba(SUN, 0.03));
          g.fillStyle = ray; g.fillRect(0, 0, f.W, f.H);
          for (const fi of FISH) drawFish(fi, c.now);
        },
        // lily pads, and lotus flowers that bounce on the kick
        surface(c) {
          for (const [x, y, r, rot, lotus] of PADS) {
            const [sx, sy] = f.toScreen(x, y), R = r * f.F.u, a0 = rot + Math.sin(c.now * 0.3 + rot) * 0.15;
            g.fillStyle = rgba(PAD, 0.85);
            g.beginPath(); g.moveTo(sx, sy); g.arc(sx, sy, R, a0 + 0.25, a0 + TAU - 0.25); g.closePath(); g.fill();
            g.strokeStyle = rgba(PAD_DARK, 0.9); g.lineWidth = 1.2;
            for (let k = 1; k < 7; k++) { const a = a0 + 0.25 + (k * (TAU - 0.5)) / 7; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a) * R * 0.9, sy + Math.sin(a) * R * 0.9); g.stroke(); }
            if (!lotus) continue;
            const s = R * 0.55 * (1 + 0.12 * c.pulse);
            for (let k = 0; k < 8; k++) {
              const a = (k * TAU) / 8 + c.now * 0.1;
              g.fillStyle = rgba(LOTUS, k % 2 ? 0.75 : 0.95);
              g.beginPath(); g.ellipse(sx + Math.cos(a) * s * 0.5, sy + Math.sin(a) * s * 0.5, s * 0.55, s * 0.24, a, 0, TAU); g.fill();
            }
            g.fillStyle = rgba(SUN, 0.95);
            g.beginPath(); g.arc(sx, sy, s * 0.22, 0, TAU); g.fill();
          }
        },
        // sun glints that wink on each beat
        front(c) {
          if (kit.reduceMotion || c.beat < 0) return;
          const k = Math.floor(c.beat), fade = Math.pow(1 - (c.beat - k), 2);
          g.globalCompositeOperation = 'lighter';
          g.strokeStyle = rgba(SUN, 0.5 * fade); g.lineWidth = 1.2;
          const n = c.sec.name.startsWith('CHORUS') ? 10 : 5;
          for (let i = 0; i < n; i++) {
            const x = hash(k * 31 + i) * f.W, y = hash(k * 17 + i * 5 + 3) * f.H, s = 3 + hash(k + i * 9) * 6;
            g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke();
          }
          g.globalCompositeOperation = 'source-over';
        },
        // in the choruses, hits throw lotus petals
        hit(c, n, grade, x, y) { if (grade === 'perfect' && c.sec.name.startsWith('CHORUS')) f.burst(x, y, LOTUS, 0.5, 1.4); },
      };
    },
  });
