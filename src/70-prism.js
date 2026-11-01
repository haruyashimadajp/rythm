
  // ---------------------------------------------------------------------
  //  06 PRISM: light through a prism. The melodic trance song from the
  //  dodge game (128 BPM), played from its recording.
  //  Chart: light splits into red, green and blue rings that spread at
  //  different speeds; where two colours cross, white light (a note for
  //  two presses); light sources glide round the edge and leave string
  //  art; giant beams sweep in from the corners; a mirrored section.
  //  Scene: a glass prism with a beam of white light fanning into a
  //  rainbow, a faceted glass floor, a kaleidoscope, a starry nocturne.
  // ---------------------------------------------------------------------
  // the song's own score (beats), written out by the composing program of the dodge game
  const SCORE_PRISM = {
    kick: [32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,116,116.5,117,117.5,118,118.5,119,119.5,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240],
    piano: [[0,2],[2,1],[3,1],[4,2],[6,1],[7,1],[8,2],[10,1],[11,1],[12,3],[16,2],[18,1],[19,1],[20,2],[22,1],[23,1],[24,2],[26,1],[27,1],[28,3],[64,0.5],[65,0.5],[66,0.5],[67,0.5],[68,0.5],[69,0.5],[70,0.5],[71,0.5],[72,0.5],[73,0.5],[74,0.5],[75,0.5],[76,0.5],[77,0.5],[78,0.5],[79,0.5],[80,0.5],[81,0.5],[82,0.5],[83,0.5],[84,0.5],[85,0.5],[86,0.5],[87,0.5],[88,0.5],[89,0.5],[90,0.5],[91,0.5],[92,0.5],[93,0.5],[94,0.5],[95,0.5],[184,2],[186,1],[187,1],[188,2],[190,1],[191,1],[192,2],[194,1],[195,1],[196,3]],
    lead: [[120,1.5],[121.5,1.5],[123,1],[124,1.5],[125.5,1.5],[127,0.5],[127.5,0.5],[128,1.5],[129.5,1.5],[131,1],[132,1.5],[133.5,1.5],[135,1],[136,1.5],[137.5,1.5],[139,1],[140,1.5],[141.5,1.5],[143,0.5],[143.5,0.5],[144,1.5],[145.5,1.5],[147,1],[148,2],[150,1],[151,1],[152,1.5],[153.5,1.5],[155,1],[156,1.5],[157.5,1.5],[159,0.5],[159.5,0.5],[160,1.5],[161.5,1.5],[163,1],[164,1.5],[165.5,1.5],[167,1],[200,1.5],[201.5,1.5],[203,1],[204,1.5],[205.5,1.5],[207,0.5],[207.5,0.5],[208,1.5],[209.5,1.5],[211,1],[212,1.5],[213.5,1.5],[215,1],[216,1.5],[217.5,1.5],[219,1],[220,1.5],[221.5,1.5],[223,0.5],[223.5,0.5],[224,1.5],[225.5,1.5],[227,1],[228,2],[230,1],[231,1],[232,1.5],[233.5,1.5],[235,1],[236,1.5],[237.5,1.5],[239,0.5],[239.5,0.5]],
    zap: [32,64,120,127.5,135.5,136,143.5,151.5,152,159.5,167.5,168,200,207.5,215.5,216,223.5,231.5,232,239.5,240],
    crash: [32,64,96,120,168,184,200,240],
    clap: [65,67,69,71,73,75,77,79,81,83,85,87,89,91,88,88.5,89,89.5,90,90.5,91,91.5,93,95,92,92.25,92.5,92.75,93,93.25,93.5,93.75,94,94.25,94.5,94.75,95,95.25,95.5,95.75,112,112.5,113,113.5,114,114.5,115,115.5,116,116.25,116.5,116.75,117,117.25,117.5,117.75,118,118.25,118.5,118.75,119,119.25,119.5,119.75,121,123,125,127,129,131,133,135,137,139,141,143,145,147,149,151,153,155,157,159,161,163,165,167,169,171,173,175,177,179,181,183,201,203,205,207,209,211,213,215,217,219,221,223,225,227,229,231,233,235,237,239],
  };
  rippleSong({
    id: 'prism', title: 'PRISM', jp: '分光', genre: 'Melodic Trance', level: 7,
    lede: '光でできた曲。白い光は<strong>赤・緑・青の波紋</strong>に分かれて違う速さで広がり、色が<strong>交わる点では白い光</strong>になります（同時押し）。光源が水面の縁を滑って糸の模様を描き、巨大な光の波が隅から押し寄せます。',
    theme: { ink: '#07061a', ink2: '#1b1640', panel: 'rgba(7, 6, 26, 0.86)', paper: '#f6f3ff', muted: '#a8a3cc', accent: '#fff0c2' },
    hues: ['#ff4f7a', '#45f0a8', '#5a8dff', '#fff0c2'],
    bpm: 128, bars: 63, speed: 0.11, ring: { chroma: true }, attractFromBar: 30,
    audioFile: { src: 'audio/prism.mp3', t0: 0.5 },
    pulse: kickPulse(SCORE_PRISM.kick),
    sections: [
      { bar: 0, name: 'PRELUDE', hue: 3 }, { bar: 8, name: 'SPECTRUM', hue: 2 }, { bar: 16, name: 'STRING ART', hue: 1 },
      { bar: 24, name: 'KALEIDOSCOPE', hue: 0 }, { bar: 28, name: 'RISE', hue: 3 }, { bar: 30, name: 'OPUS', hue: 0 },
      { bar: 42, name: 'MIRROR', hue: 2 }, { bar: 46, name: 'NOCTURNE', hue: 1 }, { bar: 50, name: 'MASTERPIECE', hue: 3 },
      { bar: 60, name: 'FIN', hue: 3 },
    ],
    chords: [{}],
    chart({ drop, skip, wave, cross, tip }) {
      const R = 0, G = 1, BL = 2, WH = 3;
      // a pattern for a drop landing at `land`: a beat is a tap, [beat, beats] a hold, [beat, beats, 'S'] a circling hold
      const pat = (land, notes) => {
        const a = [];
        for (const n of notes) {
          const [b, l = 0, kind = 'H'] = [].concat(n), i = Math.round((b - land) * 2);
          while (a.length <= i + l * 2) a.push('.');
          a[i] = l ? kind : 'o';
          for (let k = 1; k < l * 2; k++) a[i + k] = '-';
        }
        return a.join('');
      };
      const toward = ([x, y], tilt = 0) => Math.atan2(-y, -x) / DEG + tilt;
      // a giant beam of white light sweeping in from off screen, arriving on `beat`
      const beam = (beat, [x, y]) => wave(beat - 1, [x, y], WH, { speed: 0.5, r0: Math.hypot(x, y) - 1.4 });
      // one drop of white light splitting into three rings: blue fastest, then green, then red
      const spectrum = (land, p, notes, a0, fan = 60) => {
        const sp = [[BL, 0.15], [G, 0.11], [R, 0.08]];
        return notes.map((ns, k) => (ns.length ? drop(land, p, sp[k][0], pat(land, ns), { a: a0 + fan * k, speed: sp[k][1], turn: -20 * Math.sign(fan) }) : null)).filter(Boolean);
      };

      // PRELUDE: the piano, from the corners of a turning triangle of red, green and blue
      const tri = (rot) => [0, 1, 2].map((k) => { const a = (rot + k * 120) * DEG; return [Math.cos(a) * 0.3, Math.sin(a) * 0.26]; });
      const T1 = tri(-90), T2 = tri(90);
      [[1, [2, 3, 4]], [5, [6, 7, 8]], [9, [10, 11, [12, 1.5]]]].forEach(([land, ns], k) => drop(land, T1[k], k, pat(land, ns), { a: -90 + k * 120, turn: 60, speed: 0.09 }));
      drop(15, [0, 0], WH, pat(15, [16]), { a: 90, speed: 0.09 });
      [[17, [18, 19, 20]], [21, [22, 23, 24]], [25, [26, 27, [28, 2, 'S']]]].forEach(([land, ns], k) => drop(land, T2[k], k, pat(land, ns), { a: 90 + k * 120, turn: 60, speed: 0.09, spin: 150 }));
      // SPECTRUM: every bar a drop of white light splits into a fan of three colours
      beam(32, [-1.7, 0]);
      const SP = [[-0.4, -0.15], [0.4, 0.15], [-0.4, 0.15], [0.4, -0.15], [0, -0.22], [0, 0.22], [-0.45, 0], [0.45, 0]];
      SP.forEach((p, k) => {
        const land = 32 + k * 4, d = k >= 4;
        spectrum(land, p, [d ? [land + 1, land + 1.5] : [land + 1], d ? [land + 2, land + 2.5] : [land + 2], [land + 3, land + 3.5]], toward(p, -60));
      });
      // STRING ART: light sources glide from corner to corner; each one's ring threads the next notes
      beam(64, [1.7, 0]);
      const PEG = [[-0.5, -0.3], [0.5, -0.3], [0.55, 0.3], [-0.55, 0.3]];
      for (let k = 0; k < 8; k++) {
        const land = 64 + k * 4, a = PEG[k % 4], b = PEG[(k + 1) % 4];
        // the notes trail inward and behind the gliding source, like a wake
        const phi = Math.atan2(b[1] - a[1], b[0] - a[0]) / DEG, inP = Math.cos((phi + 90) * DEG) * -a[0] + Math.sin((phi + 90) * DEG) * -a[1] > 0;
        drop(land, a, k % 3, k % 2 ? '..oo.oo.' : '..o.oo.o', { path: [[4, b[0], b[1]]], ease: 'linear', a: phi + (inP ? 90 : -90), turn: inP ? 30 : -30 });
      }
      // KALEIDOSCOPE: giant rings from each corner in turn, their notes strung along the sweeping arc
      const sweep = (land, c, hue, offs, spread = 6, v = 0.22) => {
        const D = Math.hypot(c[0], c[1]), mid = (offs[0] + offs[offs.length - 1]) / 2, th = toward(c);
        drop(land, c, hue, pat(land, offs.map((o) => land + o)), { speed: v, r0: D - v * mid, angs: offs.map((_, i) => th + spread * (i - (offs.length - 1) / 2) * Math.sign(c[0] * c[1] || 1)) });
      };
      [[-1.5, -0.95], [1.5, -0.95], [1.5, 0.95], [-1.5, 0.95]].forEach((c, k) => sweep(96 + k * 4, c, k % 3, k < 2 ? [1, 2, 3] : [1, 2, 2.5, 3]));
      // RISE: sparks skip across, faster
      skip(112, [-0.6, 0.3], [0.5, -0.25], WH, 'o.o.o.o.');
      skip(116, [0.6, 0.3], [-0.5, -0.25], WH, 'o.o.oooo');
      // OPUS: the lead melody; at the end of each phrase two colours meet in white light
      beam(120, [-1.7, -0.3]);
      // the lead melody bar by bar (plus the arpeggio note inside each long note); each bar's drop lands
      // near where the last note was, so the melody wanders over the water; crossings on the zaps
      const clampP = ([x, y]) => [Math.max(-0.5, Math.min(0.5, x)), Math.max(-0.28, Math.min(0.28, y))];
      const lead = (from, to, crosses, style, start = [0, 0]) => {
        const bars = new Map();
        for (const [b, l] of SCORE_PRISM.lead) {
          if (b < from || b >= to) continue;
          const k = Math.floor((b - from) / 4);
          if (!bars.has(k)) bars.set(k, []);
          for (const x of l === 1.5 ? [b, b + 1] : [b]) if (!crosses.includes(x)) bars.get(k).push(x);
        }
        const events = [...[...bars.values()].filter((ns) => ns.length).map((ns) => ({ at: ns[0], ns })), ...crosses.map((z) => ({ at: z, z }))].sort((a, b) => a.at - b.at);
        let last = start, k = 0;
        const recent = [];
        for (const e of events) {
          if (e.z !== undefined) {
            // two colours from either side, near the last note; they cross at two points, one above and
            // one below the line between them, and both are struck together
            // where to put them: near enough to reach from the last note, clear of the notes just played
            let cx = 0, cy = 0, best = -1;
            for (const dx of [0, -0.2, 0.2, -0.35, 0.35]) {
              for (const y of [-0.14, 0, 0.14]) {
                const x = Math.max(-0.4, Math.min(0.4, last[0] * 0.6 + dx)), pts = [[x, y - 0.24], [x, y + 0.24]];
                if (Math.min(...pts.map((q) => Math.hypot(q[0] - last[0], q[1] - last[1]))) > 0.42) continue;
                const clear = Math.min(9, ...recent.flatMap(([rx, ry]) => pts.map((q) => Math.hypot(q[0] - rx, q[1] - ry))));
                if (clear > best) { best = clear; cx = x; cy = y; }
              }
            }
            const A = drop(e.z - 3.5, [cx - 0.3, cy], k % 2 ? G : R, ''), B2 = drop(e.z - 3.5, [cx + 0.3, cy], k % 2 ? BL : G, '');
            const P = cross(e.z, A, B2);
            if (P) { last = Math.hypot(P[0][0] - last[0], P[0][1] - last[1]) < Math.hypot(P[1][0] - last[0], P[1][1] - last[1]) ? P[0] : P[1]; recent.push(...P); }
            continue;
          }
          // the next drop goes a step away from the last note, in a direction clear of the notes just played
          const ns = e.ns, land = ns[0] - 1;
          let p = null, bestD = -1;
          for (let j = 0; j < 6; j++) {
            const dir = (k * 137.5 + j * 60) * DEG, q = clampP([last[0] + Math.cos(dir) * 0.38, last[1] + Math.sin(dir) * 0.38]);
            const dmin = Math.min(9, ...recent.map(([x, y]) => Math.hypot(q[0] - x, q[1] - y)));
            if (dmin > bestD) { bestD = dmin; p = q; }
            if (dmin >= 0.32) break;
          }
          let ds;
          if (style === 'spectrum' && k % 2 === 0 && ns.length >= 3) {
            const c1 = Math.ceil(ns.length * 0.4), c2 = Math.ceil(ns.length * 0.8);
            ds = spectrum(land, p, [ns.slice(0, c1), ns.slice(c1, c2), ns.slice(c2)], toward(p, -35), 35);
          } else if (style === 'spectrum') {
            // a light source sliding as it sings
            const q = clampP([-p[0] * 0.5, p[1] + (p[1] > 0 ? -0.25 : 0.25)]);
            const phi = Math.atan2(q[1] - p[1], q[0] - p[0]) / DEG;
            ds = [drop(land, p, (k + 1) % 3, pat(land, ns), { path: [[ns[ns.length - 1] - land, q[0], q[1]]], ease: 'linear', a: phi + 120, turn: 45 })];
          } else ds = [drop(land, p, k % 3, pat(land, ns), { a: toward(p, 30), turn: 60 })];
          const lastDrop = ds.reduce((m, d) => (d.beat + d.notes[d.notes.length - 1].offEnd > m.beat + m.notes[m.notes.length - 1].offEnd ? d : m));
          last = tip(lastDrop, -1).p;
          for (const d of ds) d.notes.forEach((_, i) => recent.push(tip(d, i).p));
          recent.splice(0, Math.max(0, recent.length - 8));
          k++;
        }
      };
      lead(120, 168, [127.5, 136, 143.5, 152, 159.5], 'plain', [-0.7, 0.1]);
      // MIRROR: every drop has its reflection across the middle; the two take turns
      beam(168, [1.7, 0.3]);
      [0.15, -0.15, 0.2, -0.1].forEach((y, k) => {
        const land = 168 + k * 4, busy = k >= 2, a = y > 0 ? -90 : 90;
        drop(land, [-0.28, y], k % 3, busy ? (k === 3 ? '..oo..o' : '..oo..oo') : '..o...o.', { a, turn: y > 0 ? 35 : -35 });
        drop(land, [0.28, y], k % 3, busy ? '....oo' : '....o...o.', { a, turn: y > 0 ? -35 : 35 });
      });
      // NOCTURNE: the piano again, alone; ride the long notes
      beam(184, [0, -1.3]);
      drop(183, [0, -0.15], WH, pat(183, [[184, 1.5], 186, 187]), { a: 180, turn: 60, speed: 0.08 });
      drop(187, [0.25, 0.1], BL, pat(187, [[188, 1.5], 190, 191]), { a: 200, turn: 60, speed: 0.08 });
      drop(191, [-0.25, 0.1], R, pat(191, [[192, 1.5], 194, 195]), { a: -20, turn: 60, speed: 0.08 });
      drop(195, [0, 0.05], G, pat(195, [[196, 3, 'S']]), { a: -90, speed: 0.08, spin: 240 });
      // MASTERPIECE: the melody a half step up; now it splits into colours and slides as it goes
      beam(200, [-1.7, 0.3]);
      lead(200, 240, [207.5, 216, 223.5, 232, 239.5], 'spectrum', [0.3, -0.2]);
      beam(240, [1.7, -0.3]);
      beam(242, [-1.7, 0.3]);
    },
    song: { arrange() {} },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const WHITE = hex('#ffffff'), RAIN = ['#ff3b5c', '#ff9a3b', '#ffe94a', '#4dff7a', '#3bd5ff', '#4a6bff', '#b04dff'].map(hex);
      const TARGET = { PRELUDE: 0.35, SPECTRUM: 1, 'STRING ART': 0.6, KALEIDOSCOPE: 0.45, RISE: 0.85, OPUS: 1, MIRROR: 0.7, NOCTURNE: 0.08, MASTERPIECE: 1.25, FIN: 0.5 };
      const ART = f.CHART.filter((n) => n.beat >= 64 && n.beat < 96);
      const rays = [];
      let beamI = 0.2;
      const noteAt = (n) => { const d = n.drop, off = (n.t - d.t) / f.SPB, [cx, cy] = f.ringC(d, off), r = f.ringR(d, off); return f.toScreen(cx + Math.cos(n.ang) * r, cy + Math.sin(n.ang) * r); };
      function fan(cx, cy, ang, I, spread, len) {
        // white light in, a rainbow out
        g.globalCompositeOperation = 'lighter';
        RAIN.forEach((col, k) => {
          const a0 = ang - spread / 2 + (spread * k) / 7, a1 = a0 + spread / 7;
          const gr = g.createRadialGradient(cx, cy, 0, cx, cy, len);
          gr.addColorStop(0, rgba(col, 0.28 * I)); gr.addColorStop(1, rgba(col, 0));
          g.fillStyle = gr;
          g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, len, a0, a1); g.closePath(); g.fill();
        });
        g.globalCompositeOperation = 'source-over';
      }
      return {
        back(c) {
          const { W, H, F } = f;
          beamI += ((TARGET[c.sec.name] ?? 0.5) - beamI) * Math.min(1, c.dt * 1.5);
          const I = beamI * (0.8 + 0.35 * c.pulse);
          // a faceted glass floor: a triangular lattice that glints
          g.lineWidth = 1;
          const s = F.u * 0.16;
          for (let row = -1; row * s * 0.866 < H + s; row++) {
            for (let col = -1; col * s < W + s; col++) {
              const x = col * s + (row % 2 ? s / 2 : 0), y = row * s * 0.866, k = row * 97 + col;
              const tw = 0.025 + 0.035 * Math.max(0, Math.sin(c.now * 0.9 + hash(k) * 9));
              g.strokeStyle = rgba(RAIN[Math.abs(k) % 7], tw);
              g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y); g.lineTo(x + s / 2, y + s * 0.866); g.closePath(); g.stroke();
            }
          }
          // the kaleidoscope: six mirrored wedges of coloured glass turning behind everything
          if (c.sec.name === 'KALEIDOSCOPE' || c.sec.name === 'MASTERPIECE') {
            const k = c.sec.name === 'KALEIDOSCOPE' ? 1 : 0.45;
            g.save(); g.translate(F.cx, F.cy); g.globalCompositeOperation = 'lighter';
            for (let w = 0; w < 12; w++) {
              g.save(); g.rotate((w * TAU) / 12 + c.now * 0.15); if (w % 2) g.scale(1, -1);
              for (let i = 0; i < 7; i++) {
                const r1 = F.u * (0.15 + hash(i * 3 + 1) * 0.8), a1 = hash(i * 3 + 2) * (TAU / 12), sz = F.u * (0.05 + hash(i) * 0.12);
                const x = Math.cos(a1) * r1, y = Math.sin(a1) * r1;
                g.fillStyle = rgba(RAIN[i], 0.07 * k * (0.6 + 0.4 * Math.sin(c.now * 2 + i)));
                g.beginPath(); g.moveTo(x, y - sz); g.lineTo(x + sz, y + sz * 0.6); g.lineTo(x - sz, y + sz * 0.6); g.closePath(); g.fill();
              }
              g.restore();
            }
            g.restore();
          }
          // stars for the nocturne
          if (c.sec.name === 'NOCTURNE' || c.sec.name === 'PRELUDE') {
            for (let i = 0; i < 90; i++) {
              const a = 0.25 + 0.75 * Math.max(0, Math.sin(c.now * (0.5 + hash(i)) + i));
              g.fillStyle = rgba(WHITE, 0.5 * a * (c.sec.name === 'NOCTURNE' ? 1 : 0.4));
              g.fillRect(hash(i * 3 + 7) * W, hash(i * 5 + 11) * H, 1.5, 1.5);
            }
          }
          // the beam: white light from the left edge into the prism, a rainbow fanning out of it
          const [px, py] = f.toScreen(-0.05, 0), ang = (F.portrait ? Math.PI / 2 : 0) + Math.sin(c.now * 0.2) * 0.25;
          if (I > 0.02) {
            const sx = px - Math.cos(ang) * W, sy = py - Math.sin(ang) * W;
            g.globalCompositeOperation = 'lighter';
            g.strokeStyle = rgba(WHITE, 0.18 * I); g.lineWidth = 10; g.beginPath(); g.moveTo(sx, sy); g.lineTo(px, py); g.stroke();
            g.strokeStyle = rgba(WHITE, 0.5 * I); g.lineWidth = 2; g.stroke();
            g.globalCompositeOperation = 'source-over';
            fan(px, py, ang, I, 0.5 + 0.1 * c.pulse, Math.hypot(W, H));
            if (c.sec.name === 'MASTERPIECE') { fan(px, py, ang + c.now * 0.6, I * 0.5, 0.35, Math.hypot(W, H)); fan(px, py, ang - c.now * 0.6 + Math.PI, I * 0.5, 0.35, Math.hypot(W, H)); }
          }
          // the prism itself, turning slowly
          const ps = F.u * 0.07;
          g.save(); g.translate(px, py); g.rotate(c.now * 0.25);
          const pg = g.createLinearGradient(-ps, -ps, ps, ps);
          pg.addColorStop(0, rgba(WHITE, 0.16)); pg.addColorStop(1, rgba(RAIN[5], 0.08));
          g.fillStyle = pg; g.strokeStyle = rgba(WHITE, 0.45 + 0.3 * c.pulse); g.lineWidth = 1.5;
          g.beginPath(); for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k * TAU) / 3; g.lineTo(Math.cos(a) * ps, Math.sin(a) * ps); } g.closePath(); g.fill(); g.stroke();
          g.restore();
        },
        surface(c) {
          // string art: each note of the gliding section is threaded to the next once both have sounded
          if (c.beat > 62 && c.beat < 104) {
            const fade = c.beat < 96 ? 1 : 1 - (c.beat - 96) / 8;
            g.lineWidth = 1;
            for (let i = 1; i < ART.length; i++) {
              const a = ART[i - 1], b = ART[i];
              if (b.t > c.now) break;
              const [ax, ay] = noteAt(a), [bx, by] = noteAt(b);
              const gr = g.createLinearGradient(ax, ay, bx, by);
              gr.addColorStop(0, rgba(f.HUES[a.drop.hue], 0.45 * fade)); gr.addColorStop(1, rgba(f.HUES[b.drop.hue], 0.45 * fade));
              g.strokeStyle = gr; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
              // the string art fills in: lines from each note to one a few back
              if (i >= 3) { const [qx, qy] = noteAt(ART[i - 3]); g.strokeStyle = rgba(f.HUES[b.drop.hue], 0.14 * fade); g.beginPath(); g.moveTo(qx, qy); g.lineTo(bx, by); g.stroke(); }
            }
          }
          // the mirror: a line of light down the middle, and every ring reflected in it
          if (c.sec.name === 'MIRROR') {
            const into = (c.beat - 168) / 16, a = Math.min(1, into * 6) * Math.min(1, (1 - into) * 6);
            const [x0, y0] = f.toScreen(0, -0.6), [x1, y1] = f.toScreen(0, 0.6);
            g.strokeStyle = rgba(WHITE, 0.5 * a); g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
            for (const r of f.rings) { g.strokeStyle = rgba(f.HUES[r.hue], 0.15 * a); g.lineWidth = 1.5; f.ringPath(-r.x, r.y, r.R); g.stroke(); }
          }
        },
        front(c) {
          // rainbow rays from white light that was struck
          g.globalCompositeOperation = 'lighter';
          for (let i = rays.length - 1; i >= 0; i--) {
            const r = rays[i], age = c.now - r.t;
            if (age > 0.5 || age < 0) { rays.splice(i, 1); continue; }
            const len = f.F.u * (0.15 + age * 1.2), a = 1 - age / 0.5;
            RAIN.forEach((col, k) => {
              const ang = r.a + (k * TAU) / 7;
              g.strokeStyle = rgba(col, 0.7 * a); g.lineWidth = 3 * a + 1;
              g.beginPath(); g.moveTo(r.x + Math.cos(ang) * len * 0.3, r.y + Math.sin(ang) * len * 0.3); g.lineTo(r.x + Math.cos(ang) * len, r.y + Math.sin(ang) * len); g.stroke();
            });
          }
          g.globalCompositeOperation = 'source-over';
        },
        hit(c, n, grade, x, y) {
          if (grade === 'miss') return;
          if (n.cross) { rays.push({ x, y, t: c.now, a: Math.random() * TAU }); f.flash(0.12, WHITE); }
          else if (grade === 'perfect') f.burst(x, y, RAIN[Math.floor(Math.random() * 7)], 0.35, 1.2);
        },
        reset() { rays.length = 0; beamI = 0.2; },
      };
    },
  });
