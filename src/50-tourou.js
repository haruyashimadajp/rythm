
  // ---------------------------------------------------------------------
  //  04 TOUROU: a summer festival night on the river. Matsuri rock at
  //  150 BPM: taiko, shime-daiko, the clank of the kane, shamisen,
  //  shinobue flute and distorted guitar.
  //  Scene: paper lanterns drift on the current, stall lights glow on
  //  both banks, embers rise, and fireworks open in the choruses.
  // ---------------------------------------------------------------------
  rippleSong({
    id: 'tourou', title: 'TOUROU', jp: '灯籠', genre: 'Matsuri Rock', level: 6,
    lede: '夏祭りの夜の川。太鼓とお囃子に三味線、篠笛、歪んだギターが重なる<strong>和ロック</strong>です。灯籠が流れていくなか、サビでは花火が次々に上がります。',
    theme: { ink: '#0a0716', ink2: '#24133a', panel: 'rgba(10, 7, 22, 0.84)', paper: '#fff3e6', muted: '#b8a3b0', accent: '#ffc94a' },
    hues: ['#ff5a3c', '#ffc94a', '#ff9ec7', '#8fb4ff'],
    bpm: 150, bars: 44, speed: 0.12, attractFromBar: 16,
    sections: [
      { bar: 0, name: 'INTRO', hue: 0 }, { bar: 4, name: 'VERSE', hue: 3 }, { bar: 12, name: 'BUILD', hue: 1 },
      { bar: 16, name: 'CHORUS', hue: 0 }, { bar: 24, name: 'BREAK', hue: 2 }, { bar: 28, name: 'CHORUS II', hue: 1 },
      { bar: 40, name: 'FINALE', hue: 0 },
    ],
    // Dm - Bb - Csus2 - Dm, in the minyo scale D F G A C
    chords: [
      { pad: [62, 65, 69, 72], bass: 38, lead: [74, 77, 79, 81] },
      { pad: [58, 62, 65, 69], bass: 34, lead: [74, 77, 81, 72] },
      { pad: [60, 62, 67, 72], bass: 36, lead: [72, 74, 79, 81] },
      { pad: [62, 65, 69, 72], bass: 38, lead: [81, 79, 77, 74] },
    ],
    kickOn: (bar, name) => name !== 'BREAK',
    chart({ drop, skip, B }) {
      // INTRO: the taiko's "don, don, do-ko" from four sides
      drop(B(0), [-0.3, 0], 0, '..o.o.oo', { a: 0, turn: 60 });
      drop(B(1), [0.3, 0], 0, '..o.o.oo', { a: 180, turn: -60 });
      drop(B(2), [0, -0.2], 3, '..o.o.oo', { a: 90, turn: 60 });
      drop(B(3), [0, 0.2], 3, '..o.oooo', { a: -90, turn: -50 });
      // VERSE: a drop every bar, zigzagging over the river, shamisen eighths; every fourth a hold
      const V = [[-0.45, -0.2], [0.45, 0.2], [-0.45, 0.2], [0.45, -0.2], [-0.2, 0.05], [0.25, -0.05], [-0.5, 0], [0.5, 0]];
      const VP = ['..o.oo.o', '..oo.o.o', '..o.oo.o', '..o.H-..'];
      V.forEach((p, k) => drop(B(4 + k), p, k % 4, VP[k % 4], { a: p[0] < 0 ? 0 : 180, turn: p[1] < 0 ? -50 : 50 }));
      // BUILD: two stones skip across, then runs that spiral out
      skip(B(12), [0.65, 0.32], [-0.3, -0.1], 1, 'o.o.o.o.');
      skip(B(13), [-0.65, 0.32], [0.3, -0.1], 1, 'o.o.o.o.');
      drop(B(14), [0, 0], 2, '..o.oooo', { a: -90, turn: 40 });
      drop(B(15), [0.1, 0.05], 2, '..oooooo', { a: 90, turn: 45 });
      // CHORUS: a drop every bar leaping across; every fourth bar a hold that circles
      for (let k = 0; k < 8; k++) {
        const a = k * 135 * DEG, p = [Math.cos(a) * 0.45, Math.sin(a) * 0.25];
        const pat = ['..o.oo.o', '..oo.oo.', '..o.o.oo', '..S---'][k % 4];
        drop(B(16 + k), p, k % 4, pat, { a: Math.atan2(-p[1], -p[0]) / DEG + 30, turn: k % 2 ? 45 : -45, spin: k === 3 ? 150 : -150 });
      }
      // BREAK: the river slows; ride the rings out, then round
      drop(B(24), [0, 0], 2, '..H---.H---', { a: -90, turn: 180, speed: 0.09 });
      drop(B(26), [0, 0.05], 3, '..S-----', { a: 0, speed: 0.09, spin: 200 });
      // CHORUS II: busier runs close to each drop, stones, and a last spin
      const C2 = [[-0.4, -0.15], [0.4, 0.15], [0, -0.2], [-0.4, 0.15], [0.4, -0.15], [0, 0.2]];
      const P2 = ['..o.oooo', '..oooo.o', '..o.oo..', '..oooo.o', '..o.oooo', '..oooo.o'];
      [28, 29, 30, 32, 33, 34].forEach((bar, k) => drop(B(bar), C2[k], k % 4, P2[k], { a: C2[k][0] <= 0 ? 0 : 180, turn: k % 2 ? 40 : -40 }));
      skip(B(31), [-0.6, 0.35], [0.5, 0.3], 0, 'o.o.o.oo');
      drop(B(35), [0, 0], 1, '..S---', { a: -90, spin: 220 });
      [[36, -0.3, -0.1], [37, 0.3, 0.1], [38, 0.3, -0.12], [39, -0.3, 0.12]].forEach(([b, x, y], k) => drop(B(b), [x, y], k, k % 2 ? '..oo.oo.' : '..o.o.oo', { a: x < 0 ? 0 : 180, turn: y < 0 ? -50 : 50 }));
      // FINALE
      drop(B(40), [0, 0], 0, '..o.o.oo', { a: -90, turn: 70 });
      drop(B(41), [-0.3, 0], 1, '..o.o.oo', { a: 0, turn: 70 });
      drop(B(42), [0.3, 0], 3, '..o.H---', { a: 180, turn: 70 });
    },
    song: {
      kick: { from: 140, to: 48, decay: 0.32, click: 0.6 },
      snare: { tone: 2200, decay: 0.16, body: 210 },
      bass: { wave: 'sawtooth', subShift: -12, sub: 0.6, q: 4, open: 1400, close: 260 },
      pad: { wave: 'sawtooth', cutoff: 1300, level: 0.03, detune: 9, attack: 0.3 },
      delay: { beats: 0.75, feedback: 0.25, mix: 0.16 }, leadLevel: 0.6, leadSend: 0.25, padBus: 0.7,
      // Shamisen: a bright pluck that snaps into pitch, with the click of the plectrum.
      lead(A, at, midi, dur) {
        const { ac } = A, f0 = A.mtof(midi), len = Math.max(0.45, dur + 0.25);
        const f = A.filter('lowpass', 5000, 2);
        f.frequency.setValueAtTime(5000, at); f.frequency.exponentialRampToValueAtTime(900, at + 0.25);
        const gn = A.decayGain(at, 0.2, 0.002, len);
        f.connect(gn).connect(A.bus.lead);
        for (const [type, det, v] of [['sawtooth', 0, 1], ['square', 7, 0.4]]) {
          const o = A.osc(type, f0 * 1.03, at, len + 0.05); o.frequency.exponentialRampToValueAtTime(f0, at + 0.03); o.detune.value = det;
          const og = ac.createGain(); og.gain.value = v; o.connect(og).connect(f);
        }
        A.noiseSrc(at, 0.03).connect(A.filter('bandpass', 3000)).connect(A.decayGain(at, 0.2, 0.001, 0.02)).connect(A.bus.lead);
      },
      instruments: {
        taiko(A, at, level = 1) {
          const o = A.osc('sine', 125, at, 0.7); o.frequency.exponentialRampToValueAtTime(52, at + 0.18);
          o.connect(A.decayGain(at, 0.75 * level, 0.003, 0.6)).connect(A.bus.drum);
          A.noiseSrc(at, 0.12).connect(A.filter('lowpass', 500)).connect(A.decayGain(at, 0.45 * level, 0.002, 0.08)).connect(A.bus.drum);
        },
        shime(A, at, level = 1) {
          const o = A.osc('sine', 420, at, 0.1); o.frequency.exponentialRampToValueAtTime(300, at + 0.05);
          o.connect(A.decayGain(at, 0.18 * level, 0.001, 0.07)).connect(A.bus.drum);
          A.noiseSrc(at, 0.05).connect(A.filter('bandpass', 2600, 1.5)).connect(A.decayGain(at, 0.15 * level, 0.001, 0.04)).connect(A.bus.drum);
        },
        // atarigane: a small hand gong, struck with a clank
        kane(A, at, level = 1) {
          const f = A.filter('bandpass', 3200, 2);
          f.connect(A.decayGain(at, 0.12 * level, 0.001, 0.14)).connect(A.bus.drum);
          for (const fr of [1320, 2150, 3410]) A.osc('square', fr, at, 0.2).connect(f);
        },
        // shinobue: a breathy flute with a scoop into each note and a late vibrato
        fue(A, at, midi, dur, level = 1) {
          const { ac } = A, f0 = A.mtof(midi);
          const gn = ac.createGain();
          gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(0.09 * level, at + 0.05);
          gn.gain.setValueAtTime(0.09 * level, at + dur * 0.85); gn.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.08);
          gn.connect(A.bus.lead);
          const o = A.osc('sine', f0 * 0.97, at, dur + 0.1); o.frequency.exponentialRampToValueAtTime(f0, at + 0.06);
          const vib = A.osc('sine', 5.5, at, dur + 0.1), vg = ac.createGain();
          vg.gain.setValueAtTime(0, at); vg.gain.linearRampToValueAtTime(f0 * 0.012, at + Math.min(dur, 0.6));
          vib.connect(vg).connect(o.frequency);
          o.connect(gn);
          A.osc('triangle', f0 * 2, at, dur + 0.1).connect(A.decayGain(at, 0.012 * level, 0.03, dur)).connect(gn);
          A.noiseSrc(at, dur + 0.1).connect(A.filter('bandpass', f0 * 2, 3)).connect(A.decayGain(at, 0.05 * level, 0.03, dur)).connect(A.bus.lead);
        },
        // distorted guitar: root, fifth and octave through a waveshaper
        gtr(A, at, midi, dur, level = 1) {
          const { ac } = A;
          if (!A.curve) {
            const c = new Float32Array(1024);
            for (let i = 0; i < 1024; i++) { const x = (i / 1023) * 2 - 1; c[i] = Math.tanh(x * 6); }
            A.curve = c;
          }
          const ws = ac.createWaveShaper(); ws.curve = A.curve;
          const pre = ac.createGain(); pre.gain.value = 0.6;
          const lp = A.filter('lowpass', 2600, 1);
          const gn = ac.createGain();
          gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(0.05 * level, at + 0.005);
          gn.gain.setValueAtTime(0.05 * level, at + dur * 0.8); gn.gain.exponentialRampToValueAtTime(0.0001, at + dur);
          pre.connect(ws).connect(lp).connect(gn).connect(A.bus.pad);
          for (const [iv, det] of [[0, -8], [7, 8], [12, 0]]) { const o = A.osc('sawtooth', A.mtof(midi + iv), at, dur + 0.02); o.detune.value = det; o.connect(pre); }
        },
      },
      arrange(add, bar, b0, ch, name) {
        const SPB = 60 / 150;
        const shime8 = (lv) => { for (let i = 0; i < 8; i++) add(b0 + i / 2, 'shime', i % 2 ? lv * 0.6 : lv); };
        const kane = () => { add(b0 + 0.5, 'kane'); add(b0 + 1.5, 'kane', 0.6); add(b0 + 2.5, 'kane'); add(b0 + 3.25, 'kane', 0.5); add(b0 + 3.5, 'kane', 0.8); };
        const rock = () => { add(b0, 'kick'); add(b0 + 1.5, 'kick', 0.8); add(b0 + 2, 'kick'); add(b0 + 1, 'snare'); add(b0 + 3, 'snare'); for (let i = 0; i < 8; i++) add(b0 + i / 2, 'hat', i % 2 === 1); };
        const bass8 = () => { for (let i = 0; i < 8; i++) add(b0 + i / 2, 'bass', ch.bass + (i === 3 || i === 7 ? 12 : 0), SPB * 0.45); };
        const chug = (lv) => { for (let i = 0; i < 8; i++) add(b0 + i / 2, 'gtr', ch.bass + 12, SPB * (i % 4 === 0 ? 0.9 : 0.4), lv); };
        if (name === 'INTRO') {
          for (const [b, lv] of [[0, 1], [1, 0.8], [2, 1], [2.5, 0.7], [3, 0.9]]) add(b0 + b, 'taiko', lv);
          if (bar >= 2) shime8(0.7);
          if (bar === 3) kane();
        } else if (name === 'VERSE') {
          add(b0, 'taiko'); add(b0 + 2, 'taiko', 0.8); add(b0 + 3.5, 'taiko', 0.6);
          shime8(0.8); kane(); bass8();
        } else if (name === 'BUILD') {
          const div = bar < 14 ? 2 : 4;
          for (let i = 0; i < 4 * div; i++) add(b0 + i / div, 'taiko', 0.45 + (0.55 * ((bar - 12) * 4 * div + i)) / (16 * div));
          bass8(); chug(bar < 14 ? 0.5 : 0.8);
          if (bar === 14) add(b0, 'riser', 8 * SPB);
        } else if (name === 'CHORUS' || name === 'CHORUS II') {
          if (bar % 4 === 0) add(b0, 'crash');
          rock(); add(b0, 'taiko'); add(b0 + 2, 'taiko', 0.8); kane(); bass8(); chug(1);
        } else if (name === 'BREAK') {
          add(b0, 'taiko', 0.6); shime8(0.35);
          add(b0, 'bass', ch.bass, SPB * 3.5);
          if (bar === 27) { add(b0, 'riser', 4 * SPB); for (let i = 0; i < 8; i++) add(b0 + 2 + i / 4, 'taiko', 0.5 + i * 0.06); }
        } else if (name === 'FINALE') {
          if (bar === 40) add(b0, 'crash');
          if (bar < 43) { rock(); add(b0, 'taiko'); add(b0 + 2, 'taiko'); kane(); bass8(); chug(1); }
          else { add(b0, 'crash'); add(b0, 'taiko'); add(b0, 'gtr', ch.bass + 12, SPB * 3.5, 1); add(b0, 'bass', ch.bass, SPB * 3.5); }
        }
      },
      // the shinobue's tune over the choruses and the break: [beat, midi, beats]
      extra(add) {
        const A = [[0, 81, 1], [1, 79, 0.5], [1.5, 77, 0.5], [2, 79, 1], [3, 81, 1], [4, 84, 1.5], [5.5, 81, 0.5], [6, 79, 2], [8, 77, 1], [9, 79, 0.5], [9.5, 81, 0.5], [10, 79, 1], [11, 77, 1], [12, 74, 3]];
        const Bm = [[16, 74, 0.5], [16.5, 77, 0.5], [17, 79, 1], [18, 81, 1], [19, 84, 1], [20, 86, 2], [22, 84, 1], [23, 81, 1], [24, 79, 1], [25, 81, 1], [26, 79, 0.5], [26.5, 77, 0.5], [27, 74, 1], [28, 74, 3]];
        const SPB = 60 / 150;
        const play = (start, notes, lv) => { for (const [b, m, d] of notes) add(start + b, 'fue', m, d * SPB, lv); };
        play(16 * 4, [...A, ...Bm], 1);
        play(28 * 4, [...A, ...Bm], 1);
        play(36 * 4, A, 1);
        play(24 * 4, [[0, 74, 2], [2, 77, 2], [4, 79, 4], [8, 81, 2], [10, 79, 2], [12, 77, 4]], 1.2);
      },
    },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const WARM = hex('#ffb35c'), PAPERL = hex('#ffe9c2'), GOLD = hex('#ffd36b');
      // fireworks: when and where each one opens (beats), from the song's structure
      const FW = [];
      const fwAt = (beat, size) => FW.push({ beat, t: beat * f.SPB, x: (hash(beat * 13 + 1) * 2 - 1) * 0.65, y: (hash(beat * 7 + 2) * 2 - 1) * 0.38, hue: Math.floor(hash(beat * 3 + 5) * 4), size, seed: beat * 97 });
      for (let bar = 0; bar < 44; bar++) {
        const name = f.SECTIONS[kit.secIndex(f.SECTIONS, bar)].name;
        if (name === 'VERSE' && bar % 4 === 0) fwAt(bar * 4, 0.7);
        if (name === 'CHORUS') { fwAt(bar * 4, 1); fwAt(bar * 4 + 2, 0.8); }
        if (name === 'CHORUS II') { fwAt(bar * 4, 1); fwAt(bar * 4 + 1.5, 0.7); fwAt(bar * 4 + 2, 0.9); if (bar % 2) fwAt(bar * 4 + 3, 0.7); }
        if (name === 'FINALE') for (let i = 0; i < (bar === 43 ? 1 : 6); i++) fwAt(bar * 4 + i * 0.5 + (bar === 43 ? 0 : 0.25), bar === 43 ? 1.8 : 0.8);
      }
      const LANTERNS = Array.from({ length: 8 }, (_, i) => ({ y: -0.4 + (i / 7) * 0.8 + (hash(i + 40) - 0.5) * 0.08, speed: 0.012 + hash(i + 50) * 0.01, off: hash(i + 60) * 2.2 }));
      let fired = new Set();
      function drawFirework(fw, now) {
        const age = now - fw.t;
        const [cx, cy] = f.toScreen(fw.x, fw.y), col = f.HUES[fw.hue];
        if (age < 0) {
          // the shell rising
          const u = 1 + age / 0.45, sy = cy + (1 - u) * f.H * 0.35;
          g.strokeStyle = rgba(GOLD, 0.6 * u); g.lineWidth = 2;
          g.beginPath(); g.moveTo(cx, sy + 26); g.lineTo(cx, sy); g.stroke();
          return;
        }
        if (!fired.has(fw)) { fired.add(fw); f.flash(0.05 * fw.size, WARM); }
        const life = 1.9, u = age / life, n = 48, R = f.F.u * 0.3 * fw.size;
        const reach = 1 - Math.exp(-age * 4), drop = age * age * f.F.u * 0.05;
        g.fillStyle = rgba(col, 0.9 * (1 - u));
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU + hash(fw.seed + i) * 0.15, v = 0.75 + hash(fw.seed + i + 50) * 0.35;
          const x = cx + Math.cos(a) * R * v * reach, y = cy + Math.sin(a) * R * v * reach + drop;
          g.beginPath(); g.arc(x, y, 2.8 * (1 - u) + 0.7, 0, TAU); g.fill();
          if (age < 0.9) {
            g.strokeStyle = rgba(col, 0.4 * (1 - age / 0.9)); g.lineWidth = 1.4;
            g.beginPath(); g.moveTo(cx + Math.cos(a) * R * v * reach * 0.6, cy + Math.sin(a) * R * v * reach * 0.6 + drop); g.lineTo(x, y); g.stroke();
          }
        }
        if (age < 0.25) {
          const gl = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.7);
          gl.addColorStop(0, rgba(PAPERL, 0.5 * (1 - age / 0.25))); gl.addColorStop(1, rgba(col, 0));
          g.fillStyle = gl; g.fillRect(cx - R, cy - R, R * 2, R * 2);
        }
      }
      return {
        back(c) {
          const { W, H } = f;
          // stall lights along both banks
          g.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 18; i++) {
            for (const side of [0, 1]) {
              const x = ((i + 0.5) / 18) * W + (hash(i + side * 30) - 0.5) * 30, y = side ? H - 6 - hash(i + 9) * 20 : 6 + hash(i + 19) * 20;
              const r = 18 + hash(i * 3 + side) * 22, tw = 0.6 + 0.4 * Math.sin(c.now * (1 + hash(i)) + i);
              const gl = g.createRadialGradient(x, y, 0, x, y, r);
              gl.addColorStop(0, rgba(i % 3 ? WARM : f.HUES[0], 0.16 * tw)); gl.addColorStop(1, rgba(WARM, 0));
              g.fillStyle = gl; g.fillRect(x - r, y - r, r * 2, r * 2);
            }
          }
          for (const fw of FW) {
            if (fw.t - 0.45 > c.now) break;
            if (c.now - fw.t < 1.9) drawFirework(fw, c.now);
          }
          g.globalCompositeOperation = 'source-over';
        },
        // paper lanterns drifting downstream
        surface(c) {
          const s = f.noteR() * 0.85, bright = c.sec.name === 'BREAK' ? 1 : 0.7;
          for (const L of LANTERNS) {
            const x = ((c.now * L.speed + L.off) % 2.2) - 1.1, y = L.y + Math.sin(c.now * 0.7 + L.off * 3) * 0.015;
            const [sx, sy] = f.toScreen(x, y), flick = 0.9 + 0.1 * Math.sin(c.now * 9 + L.off * 20);
            const gl = g.createRadialGradient(sx, sy, 0, sx, sy, s * 3.5);
            gl.addColorStop(0, rgba(WARM, 0.3 * bright * flick)); gl.addColorStop(1, rgba(WARM, 0));
            g.fillStyle = gl; g.fillRect(sx - s * 3.5, sy - s * 3.5, s * 7, s * 7);
            // a square paper lantern seen from above: a dark rim, glowing paper, a cross of wooden frame
            g.fillStyle = rgba(hex('#3a1a10'), 0.9);
            g.fillRect(sx - s * 0.62, sy - s * 0.62, s * 1.24, s * 1.24);
            const pg = g.createRadialGradient(sx, sy, 0, sx, sy, s * 0.7);
            pg.addColorStop(0, rgba(PAPERL, (0.85 + 0.15 * bright) * flick)); pg.addColorStop(1, rgba(WARM, 0.7 * bright + 0.2));
            g.fillStyle = pg; g.fillRect(sx - s / 2, sy - s / 2, s, s);
            g.strokeStyle = rgba(hex('#3a1a10'), 0.55); g.lineWidth = 1;
            g.beginPath(); g.moveTo(sx - s / 2, sy); g.lineTo(sx + s / 2, sy); g.moveTo(sx, sy - s / 2); g.lineTo(sx, sy + s / 2); g.stroke();
          }
        },
        // embers rising from the festival
        front(c) {
          if (kit.reduceMotion) return;
          g.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 26; i++) {
            const sp = 30 + hash(i * 3 + 1) * 40, age = ((c.now * sp + hash(i * 3 + 2) * f.H) % f.H) / f.H;
            const x = hash(i * 3 + 3) * f.W + Math.sin(c.now * 1.3 + i) * 14, y = f.H * (1 - age);
            g.fillStyle = rgba(WARM, 0.5 * Math.sin(Math.PI * age));
            g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill();
          }
          g.globalCompositeOperation = 'source-over';
        },
        hit(c, n, grade, x, y) { if (grade === 'perfect' && c.sec.name.startsWith('CHORUS')) f.burst(x, y, GOLD, 0.5, 1.5); },
        reset() { fired = new Set(); },
      };
    },
  });
