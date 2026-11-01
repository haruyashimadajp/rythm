
  // ---------------------------------------------------------------------
  //  07 ABYSS: a dive into the deep sea. The deep-sea ambient song from
  //  the dodge game (90 BPM), played from its recording.
  //  Chart: drops sink as they ripple; an anglerfish's lure drifts and
  //  rings trail from it; jellyfish pulse out and draw back in (rings
  //  that close inward, holds that ride them to the centre); in the dark
  //  water the notes are hidden until a sonar sweep finds them, and its
  //  echo strikes one spot again and again; in the end the abyss pulls
  //  every ring inward while a whale passes and its song is a long ride.
  //  Scene: the water darkens with depth, plankton lights up wherever a
  //  ripple passes, marine snow, jellyfish, the lure, the whale, a depth gauge.
  // ---------------------------------------------------------------------
  // the song's own score (beats), written out by the composing program of the dodge game
  const SCORE_ABYSS = {
    kick: [16,20,24,28,32,36,40,44,48,50.5,52,54.5,56,58.5,60,62.5,64,66.5,68,70.5,72,74.5,76,78.5,80,82.5,84,86.5,88,90.5,92,94.5,96,98.5,100,102.5,104,106.5,108,110.5,112,114.5,116,118.5,120,122.5,124,126.5,128,130.5,132,134.5,136,138.5,140,142.5,144,146.5,148,150.5,152,154.5,156,158.5],
    ping: [0,8,16,24,32,40,48,56,64,72,80,82,86,88,90,94,96,98,102,104,106,110,112,120,128,136,144,152,160],
    whale: [[8,6],[36,6],[68,6],[92,6],[108,6],[132,6],[148,6],[160,8]],
    melA: [16,16.5,17,17.5,18,18.5,19,19.5,20,20.5,21,21.5,22,22.5,23,23.5,24,24.5,25,25.5,26,26.5,27,27.5,28,28.5,29,29.5,30,30.5,31,31.5,32,32.5,33,33.5,34,34.5,35,35.5,36,36.5,37,37.5,38,38.5,39,39.5,40,40.5,41,41.5,42,42.5,43,43.5,44,44.5,45,45.5,46,46.5,47,47.5],
    melB: [[48,1],[49,1],[50,1],[51,1],[52,2],[54,0.5],[54.5,0.5],[55,1],[56,1],[57,1],[58,1],[59,1],[60,2],[64,1],[65,1],[66,1],[67,1],[68,2],[70,0.5],[70.5,0.5],[71,1],[72,1],[73,1],[74,1],[75,1],[76,2]],
    melC: [[120,1],[121,0.5],[121.5,0.5],[122,1],[123,0.5],[123.5,0.5],[124,1],[125,0.5],[125.5,0.5],[126,1],[127,0.5],[127.5,0.5],[128,1],[129,0.5],[129.5,0.5],[130,1],[131,0.5],[131.5,0.5],[132,1],[133,0.5],[133.5,0.5],[134,1],[135,0.5],[135.5,0.5],[136,1],[137,0.5],[137.5,0.5],[138,1],[139,0.5],[139.5,0.5],[140,1],[141,0.5],[141.5,0.5],[142,1],[143,0.5],[143.5,0.5],[144,1],[145,0.5],[145.5,0.5],[146,1],[147,0.5],[147.5,0.5],[148,1],[149,1],[150,2],[152,1],[153,0.5],[153.5,0.5],[154,1],[155,0.5],[155.5,0.5],[156,1],[157,0.5],[157.5,0.5],[158,1],[159,0.5],[159.5,0.5]],
  };
  const ABYSS_JELLY = []; // jellyfish: { from, to, x, y, hue } in beats and field units, filled in by the chart
  const ABYSS_SONAR = [[-0.98, 0.12], [0.98, -0.12]];
  const abyssLure = (beat) => [0.45 * Math.sin(beat * 0.11 + 1), 0.22 * Math.sin(beat * 0.23)];
  rippleSong({
    id: 'abyss', title: 'ABYSS', jp: '深淵', genre: 'Deep Sea Ambient', level: 7,
    lede: '深海へ潜っていく曲。雫は沈みながら波紋を広げ、クラゲは広がっては<strong>縮む波紋</strong>で脈打ちます。暗い海では<strong>ソナーが届くまでノーツが見えません</strong>。最後は深淵がすべての波紋を引き込み、クジラの歌に乗って長く漂います。',
    theme: { ink: '#01060d', ink2: '#05203a', panel: 'rgba(1, 6, 13, 0.88)', paper: '#e2f6ff', muted: '#7fa3b8', accent: '#ffcf6b' },
    hues: ['#3ee6ff', '#8a7bff', '#4dffb8', '#ffcf6b'],
    bpm: 90, bars: 42, speed: 0.09, attractFromBar: 20,
    audioFile: { src: 'audio/abyss.mp3', t0: 0.5 },
    pulse: kickPulse(SCORE_ABYSS.kick),
    sections: [
      { bar: 0, name: 'SURFACE', hue: 0 }, { bar: 4, name: 'DESCENT', hue: 2 }, { bar: 12, name: 'JELLYFISH', hue: 1 },
      { bar: 20, name: 'DARK WATER', hue: 0 }, { bar: 28, name: 'RISING', hue: 2 }, { bar: 30, name: 'LEVIATHAN', hue: 1 },
      { bar: 40, name: 'ABYSS', hue: 3 },
    ],
    chords: [{}],
    chart({ drop, skip, wave, pulse, tip }) {
      const CY = 0, VI = 1, AQ = 2, GO = 3;
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
      // a sonar ping from the submarine at the edge; it uncovers dark notes as it passes
      const ping = (beat, side) => wave(beat, ABYSS_SONAR[side], CY, { speed: 0.55, r0: 0.05, reveal: true });

      // SURFACE: drops that sink as they ripple
      ping(0, 0); ping(8, 1);
      drop(1, [-0.3, -0.3], CY, pat(1, [2, 3, 4]), { path: [[4, -0.3, 0.05]], ease: 'linear', a: 30, turn: 60 });
      drop(5, [0.3, -0.3], AQ, pat(5, [6, 7, 8]), { path: [[4, 0.3, 0.05]], ease: 'linear', a: 150, turn: -60 });
      drop(9, [-0.05, -0.32], VI, pat(9, [10, 11, [12, 2]]), { path: [[5, -0.05, 0.1]], ease: 'linear', a: 90, turn: 60 });
      // DESCENT: a sinking drop on each heartbeat over the kalimba; then the anglerfish's lure drifts and sheds rings
      for (let k = 0; k < 8; k++) {
        const land = 16 + k * 4, notes = k % 2 ? [land + 1, land + 1.5, land + 2, land + 3, land + 3.5] : [land + 1, land + 2, land + 2.5, land + 3, land + 3.5];
        if (k < 4) {
          const x = [-0.4, 0.35, -0.2, 0.45][k];
          drop(land, [x, -0.25], [CY, AQ][k % 2], pat(land, notes), { path: [[4, x, 0.0]], ease: 'linear', a: x < 0 ? 20 : 160, turn: x < 0 ? 50 : -50 });
        } else {
          const path = [1, 2, 3, 4].map((o) => [o, ...abyssLure(land + o)]);
          drop(land, abyssLure(land), GO, pat(land, notes), { path, ease: 'linear', a: toward(abyssLure(land), 40), turn: 80 });
        }
      }
      ping(16, 0); ping(32, 1); ping(40, 0);
      // JELLYFISH: each one pulses out (notes on the spreading ring), then draws in (a ring that closes; a hold rides it home)
      const jelly = (p, hue, outLand, outNotes, inLand, inNotes, r0 = 0.34, inSpeed = -0.11) => {
        const out = drop(outLand, p, hue, pat(outLand, outNotes), { a: toward(p, 30), turn: 55 });
        const inn = drop(inLand, p, hue, pat(inLand, inNotes), { speed: inSpeed, r0, a: toward(p, -60), turn: 60 });
        ABYSS_JELLY.push({ from: outLand - 1, to: inLand + (inNotes.length ? 4 : 0), x: p[0], y: p[1], hue });
        return [out, inn];
      };
      jelly([-0.35, -0.08], VI, 47, [48, 49, 50, 51], 51, [[52, 1.5]]);
      jelly([-0.05, 0.12], AQ, 53, [54, 54.5, 55, 56], 56, [57, 58, 59]);
      jelly([0.38, -0.05], VI, 59, [[60, 1.5]], 62, []);
      jelly([0.3, 0.15], CY, 63, [64, 65, 66, 67], 67, [[68, 1.5]]);
      jelly([0, -0.12], AQ, 69, [70, 70.5, 71, 72], 72, [73, 74, 75]);
      jelly([-0.38, 0.05], VI, 75, [[76, 1.5]], 78, []);
      // DARK WATER: the notes are hidden until the sonar finds them; a ping's echo strikes one spot over and over
      const PINGS = [80, 82, 86, 88, 90, 94, 96, 98, 102, 104, 106, 110];
      PINGS.forEach((b) => ping(b, b < 96 ? 0 : 1));
      const DK = [[-0.1, -0.15], [0.3, 0.12], [-0.35, 0.12], [0.35, -0.12], [0.05, 0.18], [-0.3, -0.15], [0.25, 0], [-0.1, 0.1]];
      DK.forEach((p, k) => {
        const land = 81 + k * 4;
        if (k % 4 === 3) pulse(land, p, CY, { a: toward(p, 0), off: 1, n: 3, gap: 0.5, dark: true });
        else drop(land, p, [CY, AQ, VI][k % 3], pat(land, k % 2 ? [land + 1, land + 1.5, land + 2.5, land + 3] : [land + 1, land + 2, land + 2.5, land + 3]), { a: toward(p, 40), turn: 60, dark: true });
      });
      // RISING: bubbles skip up towards the light
      skip(112, [-0.5, 0.38], [-0.1, -0.35], AQ, 'o.o.o.o.');
      skip(116, [0.5, 0.38], [0.1, -0.35], AQ, 'o.o.oooo');
      // LEVIATHAN: the abyss pulls every ring inward; the whale's song is a long ride along its giant ring
      const C3 = SCORE_ABYSS.melC;
      const pull = (land, p, hue, notes) => drop(land, p, hue, pat(land, notes), { speed: -0.1, r0: 0.5, a: toward(p, 40), turn: 45 });
      const PL = [[-0.3, -0.1], [0.3, 0.1], [0.25, -0.12], [-0.25, 0.12], [0, -0.05], [-0.35, 0], [0.35, 0], [0, 0.1], [-0.2, -0.12], [0.2, 0.12]];
      let k = 0;
      for (let b = 120; b < 160; b += 4) {
        if ((b >= 132 && b < 138) || (b >= 148 && b < 154)) continue;
        const ns = C3.filter(([x]) => x >= b && x < b + 4 && !(x >= 131.5 && x < 138) && !(x >= 147.5 && x < 154)).map(([x]) => x);
        if (ns.length) pull(b - 1, PL[k % PL.length], [VI, CY, AQ][k % 3], ns);
        k++;
      }
      // whale song: a slow ring from far off screen; ride it along as it passes
      drop(131, [-1.5, 0.1], GO, pat(131, [[132, 5, 'S']]), { speed: 0.06, r0: 1.0, a: -8, spin: 26 });
      drop(147, [1.5, -0.1], GO, pat(147, [[148, 5, 'S']]), { speed: 0.06, r0: 1.0, a: 188, spin: -26 });
      // ABYSS: the last whale call, one long circling ride down into the dark
      drop(159, [0, 0], GO, pat(159, [[160, 6, 'S']]), { speed: 0.05, a: -90, spin: 300 });
    },
    song: { arrange() {} },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const SURF = hex('#0b5a7a'), DEEP = hex('#010409'), SNOW = hex('#cfe8f0'), WHALE = hex('#0b1a2a'), LURE = hex('#ffcf6b');
      const PLANK = Array.from({ length: 160 }, (_, i) => ({ x: (hash(i * 3 + 1) * 2 - 1) * 0.95, y: (hash(i * 3 + 2) * 2 - 1) * 0.6, p: hash(i * 3 + 3) * TAU, lit: 0, hue: 0 }));
      const WHALES = SCORE_ABYSS.whale;
      const END = 168;
      function drawWhale(cx, cy, s, dir, a, beat) {
        // a whale seen from above-ish: a long body, a fluke that beats, two long flippers
        g.save(); g.translate(cx, cy); g.scale(dir * s, s);
        const sw = Math.sin(beat * 1.2) * 0.12;
        g.fillStyle = rgba(WHALE, 0.85 * a); g.strokeStyle = rgba(hex('#3ee6ff'), 0.18 * a); g.lineWidth = 2 / s;
        g.beginPath();
        g.moveTo(1, 0);
        g.bezierCurveTo(0.9, -0.22, 0.2, -0.28, -0.6, -0.12);
        g.quadraticCurveTo(-0.9, -0.05 + sw, -1.05, -0.2 + sw);
        g.lineTo(-1.0, 0 + sw); g.lineTo(-1.05, 0.2 + sw);
        g.quadraticCurveTo(-0.9, 0.05 + sw, -0.6, 0.12);
        g.bezierCurveTo(0.2, 0.28, 0.9, 0.22, 1, 0);
        g.fill(); g.stroke();
        for (const side of [-1, 1]) { g.beginPath(); g.moveTo(0.35, 0.18 * side); g.quadraticCurveTo(0.1, 0.5 * side, -0.05, 0.55 * side); g.quadraticCurveTo(0.15, 0.3 * side, 0.2, 0.2 * side); g.fill(); }
        g.restore();
      }
      return {
        back(c) {
          const { W, H, F } = f;
          const depth = Math.max(0, Math.min(1, c.beat / 150));
          // the water darkens as we go down; light from the surface fades
          const top = kit.mix(SURF, DEEP, Math.min(1, depth * 1.6)), bot = kit.mix(hex('#03263b'), DEEP, Math.min(1, depth * 1.2 + 0.3));
          const gr = g.createLinearGradient(0, 0, 0, H);
          gr.addColorStop(0, rgba(top, 1)); gr.addColorStop(1, rgba(bot, 1));
          g.fillStyle = gr; g.fillRect(-20, -20, W + 40, H + 40);
          if (depth < 0.45) {
            g.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 6; i++) {
              const x = W * (0.1 + i * 0.17) + Math.sin(c.now * 0.3 + i) * 30, a = (0.06 - depth * 0.13) * (0.6 + 0.4 * Math.sin(c.now * 0.5 + i * 2));
              if (a <= 0) continue;
              const rg = g.createLinearGradient(0, 0, 0, H * 0.9);
              rg.addColorStop(0, rgba(SNOW, a)); rg.addColorStop(1, rgba(SNOW, 0));
              g.fillStyle = rg;
              g.beginPath(); g.moveTo(x - 20, 0); g.lineTo(x + 20, 0); g.lineTo(x + 90 + i * 10, H * 0.9); g.lineTo(x - 40, H * 0.9); g.closePath(); g.fill();
            }
            g.globalCompositeOperation = 'source-over';
          }
          // the whales, far below, passing while they sing
          for (const [b, len] of WHALES) {
            const u = (c.beat - (b - 2)) / (len + 6);
            if (u < 0 || u > 1) continue;
            const big = b >= 120, dir = WHALES.indexOf(WHALES.find((w) => w[0] === b)) % 2 ? -1 : 1;
            const x = dir > 0 ? -0.4 * W + u * W * 1.8 : W * 1.4 - u * W * 1.8, y = H * (big ? 0.55 : 0.7) + Math.sin(u * 3) * H * 0.05;
            drawWhale(x, y, F.u * (big ? 0.7 : 0.35), dir, Math.sin(Math.PI * u) * (big ? 0.9 : 0.5), c.beat);
          }
          // plankton that lights up wherever a ripple passes
          g.globalCompositeOperation = 'lighter';
          for (const p of PLANK) {
            for (const r of f.rings) {
              const d = Math.hypot(p.x - r.x, p.y - r.y);
              if (Math.abs(d - r.R) < 0.035) { p.lit = 1; p.hue = r.hue; }
            }
            p.lit = Math.max(0, p.lit - c.dt * 1.2);
            const [sx, sy] = f.toScreen(p.x + Math.sin(c.now * 0.2 + p.p) * 0.02, p.y + Math.cos(c.now * 0.17 + p.p) * 0.02);
            const base = 0.05 + depth * 0.05;
            g.fillStyle = rgba(f.HUES[p.hue], base + p.lit * 0.8);
            g.beginPath(); g.arc(sx, sy, 1.2 + p.lit * 2.2, 0, TAU); g.fill();
          }
          g.globalCompositeOperation = 'source-over';
          // the submarine's lamp, blinking on each ping
          for (const [i, [sxF, syF]] of ABYSS_SONAR.entries()) {
            let lastPing = -99;
            for (const d of f.DROPS) { if (d.reveal && d.x === sxF && d.beat <= c.beat) lastPing = d.beat; }
            const a = Math.exp(-(c.beat - lastPing) * 2);
            let [sx, sy] = f.toScreen(sxF, syF); sx = Math.min(W - 4, Math.max(4, sx)); sy = Math.min(H - 4, Math.max(4, sy));
            const gl = g.createRadialGradient(sx, sy, 0, sx, sy, F.u * 0.25);
            gl.addColorStop(0, rgba(f.HUES[0], 0.15 + 0.5 * a)); gl.addColorStop(1, rgba(f.HUES[0], 0));
            g.fillStyle = gl; g.fillRect(sx - F.u * 0.25, sy - F.u * 0.25, F.u * 0.5, F.u * 0.5);
            void i;
          }
        },
        surface(c) {
          const { F } = f;
          // jellyfish: the bell swells with its ring and shrinks as the ring draws in
          for (const j of ABYSS_JELLY) {
            if (c.beat < j.from - 1 || c.beat > j.to + 1) continue;
            const a = Math.min(1, (c.beat - j.from + 1)) * Math.min(1, j.to + 1 - c.beat);
            const [sx, sy] = f.toScreen(j.x, j.y), col = f.HUES[j.hue];
            const beat = c.beat, swell = 0.75 + 0.25 * Math.sin(beat * Math.PI) + 0.3 * c.pulse;
            const R = F.u * 0.06 * swell;
            g.globalCompositeOperation = 'lighter';
            const gl = g.createRadialGradient(sx, sy, 0, sx, sy, R * 2.5);
            gl.addColorStop(0, rgba(col, 0.25 * a)); gl.addColorStop(1, rgba(col, 0));
            g.fillStyle = gl; g.fillRect(sx - R * 2.5, sy - R * 2.5, R * 5, R * 5);
            g.globalCompositeOperation = 'source-over';
            g.strokeStyle = rgba(col, 0.5 * a); g.lineWidth = 1.2;
            for (let t = 0; t < 7; t++) {
              const tx = sx + (t - 3) * R * 0.28;
              g.beginPath(); g.moveTo(tx, sy);
              for (let k = 1; k <= 8; k++) g.lineTo(tx + Math.sin(c.now * 3 + t + k * 0.8) * R * 0.15, sy + k * R * 0.32);
              g.stroke();
            }
            g.fillStyle = rgba(col, 0.35 * a); g.strokeStyle = rgba(col, 0.85 * a); g.lineWidth = 1.5;
            g.beginPath(); g.ellipse(sx, sy, R, R * 0.75, 0, Math.PI, TAU); g.closePath(); g.fill(); g.stroke();
          }
          // the anglerfish's lure, glowing on its stalk while it drifts
          if (c.beat > 30 && c.beat < 50) {
            const a = Math.min(1, (c.beat - 30) / 2) * Math.min(1, (50 - c.beat) / 2);
            const [lx, ly] = f.toScreen(...abyssLure(c.beat));
            g.strokeStyle = rgba(LURE, 0.3 * a); g.lineWidth = 1.5;
            g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx + F.u * 0.12, ly - F.u * 0.15, lx + F.u * 0.22, ly + F.u * 0.02); g.stroke();
            const gl = g.createRadialGradient(lx, ly, 0, lx, ly, F.u * 0.08);
            gl.addColorStop(0, rgba(hex('#fffbe0'), 0.9 * a)); gl.addColorStop(0.3, rgba(LURE, 0.5 * a)); gl.addColorStop(1, rgba(LURE, 0));
            g.fillStyle = gl; g.fillRect(lx - F.u * 0.08, ly - F.u * 0.08, F.u * 0.16, F.u * 0.16);
          }
        },
        front(c) {
          const { W, H } = f;
          // marine snow drifting down
          if (!kit.reduceMotion) {
            g.fillStyle = rgba(SNOW, 0.35);
            for (let i = 0; i < 70; i++) {
              const sp = 8 + hash(i * 7 + 1) * 14, y = ((c.now * sp + hash(i * 7 + 2) * H) % H), x = hash(i * 7 + 3) * W + Math.sin(c.now * 0.4 + i) * 10;
              g.fillRect(x, y, 1.4, 1.4);
            }
          }
          // the heartbeat closes the dark in at the edges
          const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
          v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.35 + 0.25 * c.pulse})`);
          g.fillStyle = v; g.fillRect(0, 0, W, H);
          // the depth gauge
          const depthM = Math.round(Math.max(0, Math.min(END, c.beat)) / END * 3800);
          g.fillStyle = rgba(f.MUTED, 0.8); g.font = '700 12px "Zen Kaku Gothic New", sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom';
          g.fillText(`深度 ${depthM.toLocaleString()} m`, W - 18, H - 14);
        },
        hit(c, n, grade, x, y) { if (grade === 'perfect') f.burst(x, y, f.HUES[n.drop.hue], 0.3, 1.6); },
        reset() { for (const p of PLANK) p.lit = 0; },
      };
    },
  });
