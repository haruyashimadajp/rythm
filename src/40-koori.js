
  // ---------------------------------------------------------------------
  //  03 KOORI: a frozen lake at night. A waltz in 3/4 at 168 BPM: music
  //  box, pizzicato strings and celesta.
  //  Scene: ripples spread as hexagons like ice crystals, every hit
  //  cracks the ice, snow falls, and an aurora hangs over the far shore.
  // ---------------------------------------------------------------------
  const KOORI_SKATE = []; // drops carried by a skater (the scene draws the blade marks behind the ring's centre)
  rippleSong({
    id: 'koori', title: 'KOORI', jp: '氷', genre: 'Waltz', level: 5,
    lede: '凍った湖の夜の<strong>3拍子のワルツ</strong>。波紋は氷の結晶のように六角形に広がり、叩くたびに氷にひびが走ります。<strong>スケーターが波紋を連れて滑り</strong>、<strong>凍りついて止まる波紋</strong>ではノーツが縁に詰まり、岸の向こうから<strong>巨大な氷の波</strong>が押し寄せます。',
    theme: { ink: '#070b1c', ink2: '#16224a', panel: 'rgba(7, 11, 28, 0.84)', paper: '#eef4ff', muted: '#9aa6c9', accent: '#ffe6a3' },
    hues: ['#9be7ff', '#c7a8ff', '#e8f1ff', '#ffe6a3'],
    bpm: 168, beatsPerBar: 3, bars: 72, speed: 0.1, ring: { sides: 6, rot: 90 }, attractFromBar: 32,
    sections: [
      { bar: 0, name: 'INTRO', hue: 0 }, { bar: 8, name: 'THEME', hue: 1 }, { bar: 24, name: 'BRIDGE', hue: 2 },
      { bar: 32, name: 'CLIMAX', hue: 3 }, { bar: 48, name: 'REPRISE', hue: 1 }, { bar: 64, name: 'CODA', hue: 0 },
    ],
    // Am - Dm - G - C - F - Dm - E - E7
    chords: [
      { pad: [57, 60, 64, 69], bass: 45, lead: [76, 72, 69, 81] },
      { pad: [57, 62, 65, 69], bass: 38, lead: [74, 77, 81, 69] },
      { pad: [55, 59, 62, 67], bass: 43, lead: [74, 71, 79, 67] },
      { pad: [55, 60, 64, 67], bass: 36, lead: [72, 76, 79, 67] },
      { pad: [57, 60, 65, 69], bass: 41, lead: [77, 72, 81, 69] },
      { pad: [57, 62, 65, 69], bass: 38, lead: [74, 77, 81, 69] },
      { pad: [56, 59, 64, 68], bass: 40, lead: [76, 71, 80, 68] },
      { pad: [56, 59, 62, 68], bass: 40, lead: [74, 71, 80, 76] },
    ],
    kickOn: (bar, name) => name === 'CLIMAX' || name === 'REPRISE',
    chart({ drop, skip, B }) {
      // INTRO: a drop every two bars, quarter notes
      [[0, 0], [-0.35, 0.1], [0.35, -0.1]].forEach((p, k) => drop(B(k * 2), p, k, '..o.o.o...', { a: -90 + k * 120, turn: 70 }));
      drop(B(6), [0, 0.15], 3, '..o.o.o.o.o.', { a: -90, turn: 60 });
      // THEME: skaters glide across the ice in curves, their rings carried along; every fourth ends on a hold
      const T = [[-0.4, -0.12], [0.4, 0.12], [-0.3, 0.2], [0.3, -0.2], [-0.45, 0.05], [0.45, -0.05], [0, -0.22], [0, 0.2]];
      T.forEach((p, k) => {
        const pat = k % 4 === 3 ? '..o.H---' : k % 2 ? '..o.ooo.o.' : '..o.o.o.oo';
        const s = p[0] < 0 ? 1 : -1, mid = [p[0] + s * 0.15, p[1] + (p[1] < 0 ? 0.12 : -0.12)], end = [p[0] + s * 0.3, p[1]];
        KOORI_SKATE.push(drop(B(8 + k * 2), p, k % 4, pat, { a: p[0] < 0 ? 0 : 180, turn: k % 2 ? -55 : 55, path: [[2.5, mid[0], mid[1]], [5, end[0], end[1]]] }));
      });
      // BRIDGE: stones slide across the ice, and slow rings to ride round
      skip(B(24), [-0.65, -0.3], [0.6, 0.3], 1, 'o.o.o.o.o.o.');
      drop(B(26), [0, 0], 3, '..S-----', { a: -90, speed: 0.08, spin: 180 });
      // a ring that freezes: it slows to a stop, and its notes crowd together at the edge
      drop(B(28), [0.05, 0], 2, '..o.o.o.o.', { speed: 0.22, accel: -0.06, a: -90, turn: 80 });
      drop(B(30), [0, 0], 0, '..S-----', { a: 90, speed: 0.08, spin: -180 });
      // CLIMAX: a drop every bar, leaping across the lake; every fourth bar a hold that turns
      for (let k = 0; k < 16; k++) {
        if (k === 5 || k === 13) {
          // the ice heaves: a giant wave from beyond the shore, its notes strung along the arc
          const c = k === 5 ? [-1.5, -0.95] : [1.5, 0.95], D = Math.hypot(c[0], c[1]), th = Math.atan2(-c[1], -c[0]) / DEG;
          drop(B(32 + k), c, 3, '..o.oo', { speed: 0.22, r0: D - 0.22 * 1.75, angs: [th - 8, th, th + 6] });
          continue;
        }
        const a = k * 135 * DEG, p = [Math.cos(a) * 0.45, Math.sin(a) * 0.24];
        const pat = k % 4 === 3 ? '..S--' : k % 2 ? '..oo.o' : '..o.oo';
        drop(B(32 + k), p, k % 4, pat, { a: (Math.atan2(-p[1], -p[0]) / DEG) + (k % 2 ? 30 : -30) + (k === 6 ? 150 : 0), turn: k % 2 ? 50 : -50, spin: k % 8 === 3 ? 100 : -100 });
      }
      // REPRISE: two drops land together; one plays two notes, then the other
      for (let k = 0; k < 8; k++) {
        const s = k % 2 ? 1 : -1, y = [0.12, -0.15, 0.2, -0.05][k % 4];
        drop(B(48 + k * 2), [0.42 * s, y], (k * 2) % 4, '..o.o.....', { a: s < 0 ? -20 : 160, turn: 50 });
        drop(B(48 + k * 2), [-0.42 * s, -y], (k * 2 + 1) % 4, k === 7 ? '......o.oo' : '......o.o.', { a: s < 0 ? 160 : -20, turn: 50 });
      }
      // CODA
      drop(B(64), [0, 0], 0, '..o.o.o.o.o.', { a: -90, turn: 70 });
      drop(B(66), [-0.3, 0.05], 1, '..o.o.o.', { a: 0, turn: -60 });
      drop(B(68), [0.3, -0.05], 2, '..o.o.o.', { a: 180, turn: 60 });
      drop(B(70), [0, 0], 3, '..H---', { a: -90, speed: 0.08 });
    },
    song: {
      kick: { from: 90, to: 50, decay: 0.6, level: 0.7 },
      bass: { wave: 'triangle', subShift: 0, sub: 0.6, q: 1, open: 900, close: 300 },
      pad: { wave: 'sawtooth', cutoff: 1500, level: 0.04, detune: 7, attack: 0.4 },
      delay: { beats: 1, feedback: 0.3, mix: 0.22 }, leadLevel: 0.55, leadSend: 0.55, padBus: 0.8,
      // Music box: a tine with a high, quickly fading overtone, and a long ring.
      lead(A, at, midi, dur) {
        const f0 = A.mtof(midi), len = Math.max(1.2, dur + 0.8);
        A.osc('sine', f0, at, len).connect(A.decayGain(at, 0.24, 0.002, len)).connect(A.bus.lead);
        A.osc('sine', f0 * 3, at, 0.5).connect(A.decayGain(at, 0.05, 0.002, 0.4)).connect(A.bus.lead);
        A.osc('sine', f0 * 5.4, at, 0.12).connect(A.decayGain(at, 0.04, 0.001, 0.08)).connect(A.bus.lead);
      },
      instruments: {
        // pizzicato strings: a plucked triangle per note
        pizz(A, at, midis, level = 1) {
          const f = A.filter('lowpass', 1800);
          f.connect(A.decayGain(at, 0.09 * level, 0.004, 0.28)).connect(A.bus.pad);
          for (const m of midis) A.osc('triangle', A.mtof(m), at, 0.35).connect(f);
        },
        celesta(A, at, midi, level = 1) {
          const f0 = A.mtof(midi);
          A.osc('sine', f0, at, 0.7).connect(A.decayGain(at, 0.07 * level, 0.002, 0.6)).connect(A.bus.pad);
          A.osc('sine', f0 * 4, at, 0.2).connect(A.decayGain(at, 0.025 * level, 0.001, 0.15)).connect(A.bus.pad);
        },
        timp(A, at, midi, level = 1) {
          const f0 = A.mtof(midi), o = A.osc('sine', f0 * 1.04, at, 1);
          o.frequency.exponentialRampToValueAtTime(f0, at + 0.1);
          o.connect(A.decayGain(at, 0.4 * level, 0.004, 0.9)).connect(A.bus.drum);
          const lp = A.filter('lowpass', 300);
          A.noiseSrc(at, 0.15).connect(lp).connect(A.decayGain(at, 0.3 * level, 0.002, 0.1)).connect(A.bus.drum);
        },
      },
      arrange(add, bar, b0, ch, name) {
        const waltz = (lv) => { add(b0, 'pizz', [ch.bass, ch.bass + 12], lv); add(b0 + 1, 'pizz', ch.pad.slice(1), lv * 0.8); add(b0 + 2, 'pizz', ch.pad.slice(1), lv * 0.8); };
        const arp = (lv) => { const ns = [...ch.pad.slice(1), ch.pad[1] + 12, ...ch.pad.slice(1).reverse()]; for (let i = 0; i < 6; i++) add(b0 + i / 2, 'celesta', ns[i] + 12, lv); };
        if (name === 'INTRO') {
          if (bar >= 4) waltz(0.6);
        } else if (name === 'THEME') {
          waltz(1);
          if (bar % 2) add(b0, 'bass', ch.bass, 3 * 60 / 168);
        } else if (name === 'BRIDGE') {
          arp(0.8);
          add(b0, 'bass', ch.bass, 3 * 60 / 168);
          if (bar === 31) { for (let i = 0; i < 6; i++) add(b0 + i / 2, 'timp', ch.bass, 0.4 + i * 0.1); add(b0, 'riser', 3 * 60 / 168); }
        } else if (name === 'CLIMAX' || name === 'REPRISE') {
          if (bar % 8 === 0) add(b0, 'crash');
          add(b0, 'timp', ch.bass, name === 'CLIMAX' ? 1 : 0.7);
          waltz(1);
          add(b0, 'bass', ch.bass, 3 * 60 / 168);
          if (name === 'CLIMAX' || bar % 2) arp(name === 'CLIMAX' ? 1 : 0.7);
          add(b0 + 1, 'shaker', 0.6); add(b0 + 2, 'shaker', 0.6);
        } else if (name === 'CODA') {
          if (bar < 70) waltz(0.6);
          if (bar === 70) { add(b0, 'timp', ch.bass, 0.8); add(b0, 'pizz', [ch.bass, ...ch.pad], 1); }
        }
      },
    },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const ICE = hex('#cfefff'), AUR = [hex('#5cffc0'), hex('#9b7bff'), hex('#5cc8ff')];
      const cracks = [];
      let frost = [], lastFlash = -1;
      const aur = document.createElement('canvas'), actx = aur.getContext('2d');
      let aurImg = null;
      function growFrost() {
        // a few frost ferns creeping in from the corners (fractions of the screen, so they survive a resize)
        frost = [];
        const rnd = kit.mulberry32(7);
        const grow = (x, y, a, len, depth) => {
          const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
          frost.push([x, y, nx, ny]);
          if (depth < 4) for (const s of [-1, 1]) if (rnd() < 0.8) grow(nx, ny, a + s * (0.5 + rnd() * 0.4), len * 0.62, depth + 1);
        };
        for (const [x, y, a] of [[0, 0, 0.8], [1, 0, 2.3], [0, 1, -0.8], [1, 1, -2.3]]) for (let i = -1; i <= 1; i++) grow(x, y, a + i * 0.35, 0.07, 0);
      }
      growFrost();
      return {
        back(c) {
          const { W, H } = f;
          // the climax opens each eight bars with a cold white flash
          if (c.sec.name === 'CLIMAX' && c.bar % 8 === 0 && c.bar !== lastFlash) { lastFlash = c.bar; f.flash(0.18, ICE); }
          // aurora curtains over the far shore: computed per pixel at low resolution, then scaled up soft
          if (aur.width) {
            const { width: aw, height: ah } = aur, px = aurImg.data;
            px.fill(0);
            for (let b = 0; b < 3; b++) {
              const col = AUR[b], strength = 0.42 + 0.14 * c.pulse;
              for (let x = 0; x < aw; x++) {
                const u = x / aw;
                const top = ah * (0.08 + b * 0.1 + 0.12 * Math.sin(u * 5 + c.now * 0.15 + b * 2) + 0.05 * Math.sin(u * 13 - c.now * 0.3 + b));
                const len = ah * (0.35 + 0.25 * Math.sin(u * 9 + c.now * 0.4 + b * 1.3) + 0.12 * Math.sin(u * 23 + c.now * 0.7));
                const rays = 0.75 + 0.25 * Math.sin(u * 60 + b * 4 + c.now * 0.5);
                for (let y = Math.max(0, Math.floor(top)); y < Math.min(ah, top + len); y++) {
                  const e = (y - top) / len, a = (e < 0.12 ? e / 0.12 : Math.pow(1 - e, 1.6)) * strength * rays;
                  const o = (y * aw + x) * 4;
                  px[o] += col[0] * a; px[o + 1] += col[1] * a; px[o + 2] += col[2] * a; px[o + 3] += 255 * a;
                }
              }
            }
            actx.putImageData(aurImg, 0, 0);
            g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true;
            g.drawImage(aur, 0, 0, W, H * 0.5);
            g.restore();
          }
          g.strokeStyle = rgba(ICE, 0.07); g.lineWidth = 1;
          g.beginPath();
          for (const [x0, y0, x1, y1] of frost) { g.moveTo(x0 * W, y0 * H); g.lineTo(x1 * W, y1 * H); }
          g.stroke();
        },
        surface(c) {
          // blade marks behind each skater, and the skater's glint
          for (const d of KOORI_SKATE) {
            const off = (c.now - d.t) / f.SPB;
            if (off < 0 || c.now > d.last + 1) continue;
            const fade = Math.min(1, d.last + 1 - c.now);
            for (const side of [-1, 1]) {
              g.strokeStyle = rgba(ICE, 0.35 * fade); g.lineWidth = 1;
              g.beginPath();
              for (let k = 0; k <= 16; k++) {
                const o = Math.max(0, off - 2.5 + (k / 16) * 2.5), [x, y] = f.ringC(d, o), [x2, y2] = f.ringC(d, o + 0.05);
                const n = Math.atan2(y2 - y, x2 - x) + Math.PI / 2, [sx, sy] = f.toScreen(x + Math.cos(n) * 0.008 * side, y + Math.sin(n) * 0.008 * side);
                if (k) g.lineTo(sx, sy); else g.moveTo(sx, sy);
              }
              g.stroke();
            }
            const [sx, sy] = f.toScreen(...f.ringC(d, off));
            g.fillStyle = rgba(ICE, 0.9 * fade); g.beginPath(); g.arc(sx, sy, 3, 0, TAU); g.fill();
          }
          // a freezing ring grows frost spikes as it slows
          for (const r of f.rings) {
            if (!(r.d.accel < 0)) continue;
            const off = (c.now - r.d.t) / f.SPB, v = r.d.speed + r.d.accel * off, still = Math.max(0, 1 - v / r.d.speed);
            g.strokeStyle = rgba(ICE, 0.6 * still); g.lineWidth = 1.2;
            g.beginPath();
            for (let k = 0; k < 18; k++) {
              const a = (k * TAU) / 18 + r.d.beat, rr = r.R * f.shape(a), len = 0.025 * still * (k % 2 ? 0.6 : 1);
              const [x0, y0] = f.toScreen(r.x + Math.cos(a) * rr, r.y + Math.sin(a) * rr), [x1, y1] = f.toScreen(r.x + Math.cos(a) * (rr + len), r.y + Math.sin(a) * (rr + len));
              g.moveTo(x0, y0); g.lineTo(x1, y1);
            }
            g.stroke();
          }
          // each falling drop freezes into a turning snowflake where it lands
          for (const d of f.DROPS) {
            if (d.t > c.now) break;
            if (d.small || c.now > d.last + 1) continue;
            const [x, y] = f.toScreen(d.x, d.y), r = f.noteR() * 0.7, rot = c.now * 0.6 + d.beat;
            g.strokeStyle = rgba(f.HUES[d.hue], 0.6 * Math.min(1, (d.last + 1 - c.now))); g.lineWidth = 1.5;
            g.beginPath();
            for (let k = 0; k < 6; k++) {
              const a = rot + (k * TAU) / 6, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r;
              g.moveTo(x, y); g.lineTo(ex, ey);
              const mx = x + Math.cos(a) * r * 0.6, my = y + Math.sin(a) * r * 0.6;
              for (const s of [-1, 1]) { g.moveTo(mx, my); g.lineTo(mx + Math.cos(a + s * 0.7) * r * 0.3, my + Math.sin(a + s * 0.7) * r * 0.3); }
            }
            g.stroke();
          }
          // cracks left by hits
          for (let i = cracks.length - 1; i >= 0; i--) {
            const k = cracks[i], age = c.now - k.t;
            if (age > 3 || age < -0.1) { cracks.splice(i, 1); continue; }
            const grow = Math.min(1, age / 0.25);
            g.strokeStyle = rgba(ICE, 0.45 * (1 - age / 3)); g.lineWidth = 1;
            g.beginPath();
            for (const [x0, y0, x1, y1, depth] of k.lines) {
              if (depth / 3 > grow) continue;
              g.moveTo(x0, y0); g.lineTo(x0 + (x1 - x0) * grow, y0 + (y1 - y0) * grow);
            }
            g.stroke();
          }
        },
        // snowfall, heavier in the climax
        front(c) {
          if (kit.reduceMotion) return;
          const n = c.sec.name === 'CLIMAX' ? 110 : c.sec.name === 'REPRISE' ? 80 : 50;
          g.fillStyle = rgba(ICE, 0.55);
          for (let i = 0; i < n; i++) {
            const sp = 25 + hash(i * 5 + 1) * 45, s = 0.8 + hash(i * 5 + 2) * 1.8;
            const y = ((c.now * sp + hash(i * 5 + 3) * (f.H + 20)) % (f.H + 20)) - 10;
            const x = hash(i * 5 + 4) * f.W + Math.sin(c.now * 0.8 + i) * 18;
            g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
          }
        },
        hit(c, n, grade, x, y) {
          if (grade === 'miss') return;
          const rnd = Math.random, lines = [], r = f.noteR();
          const grow = (px, py, a, len, depth) => {
            for (let i = 0; i < 3; i++) {
              const nx = px + Math.cos(a) * (len / 3), ny = py + Math.sin(a) * (len / 3);
              lines.push([px, py, nx, ny, depth]);
              px = nx; py = ny; a += (rnd() - 0.5) * 0.7;
              if (depth < 2 && rnd() < 0.4) grow(px, py, a + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.5), len * 0.5, depth + 1);
            }
          };
          const arms = 3 + Math.floor(rnd() * 3);
          for (let i = 0; i < arms; i++) grow(x, y, (i * TAU) / arms + rnd() * 0.8, r * (2.2 + rnd() * 2.2), 0);
          cracks.push({ lines, t: c.now });
          if (cracks.length > 14) cracks.shift();
        },
        reset() { cracks.length = 0; lastFlash = -1; },
        layout() {
          aur.width = Math.max(1, Math.ceil(f.W / 10)); aur.height = Math.max(1, Math.ceil((f.H * 0.5) / 10));
          aurImg = actx.createImageData(aur.width, aur.height);
        },
      };
    },
  });
