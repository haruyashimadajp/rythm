
  // =====================================================================
  //  FIELD
  //  The water surface every song plays on. rippleSong(def) turns a song
  //  description into a playable song: drops land, their ripples spread,
  //  and each note is struck when its ripple reaches it.
  //
  //  def: id, title, jp, genre, level (1-10), lede, theme, hues (4 colours),
  //    bpm, beatsPerBar, bars, sections [{ bar, name, hue }], chords,
  //    speed (ripple growth, field units per beat), ring { sides, rot }
  //    (0 sides = circles), attractFromBar,
  //    chart({ drop, skip, B }) to place the notes (see drop / skip below),
  //    song: the music (see the engine's audio; leadMidi defaults to the
  //    chord's lead tones), kickOn(bar, section) for the beat pulse,
  //    scene(kit, field): { back, surface, front, hit, reset } drawing hooks.
  // =====================================================================
  function rippleSong(def) {
    defineSong((kit) => {
      const { g, rgba, hex, S, TAU, DEG } = kit;
      const BPM = def.bpm, SPB = 60 / BPM, BPB = def.beatsPerBar || 4;
      const theme = def.theme;
      const INK = hex(theme.ink), INK2 = hex(theme.ink2), PAPER = hex(theme.paper), MUTED = hex(theme.muted), ACCENT = hex(theme.accent);
      const HUES = def.hues.map(hex);
      const SECTIONS = def.sections;
      const SIDES = (def.ring && def.ring.sides) || 0, RING_ROT = ((def.ring && def.ring.rot) || 0) * DEG;
      // A ripple of circumradius R reaches R * shape(a) along angle a (always R for a circle).
      const shape = (a) => {
        if (!SIDES) return 1;
        const seg = TAU / SIDES;
        let x = (a - RING_ROT) % seg;
        if (x < 0) x += seg;
        return Math.cos(Math.PI / SIDES) / Math.cos(x - Math.PI / SIDES);
      };

      // ----- chart: drops (ripple sources) and the notes their ripple reaches -----
      // Positions are in field units: the field is about ±0.8 wide and ±0.48 tall around its centre.
      const BOUND_X = 0.74, BOUND_Y = 0.42;
      const inField = (x, y) => Math.abs(x) <= BOUND_X + 1e-6 && Math.abs(y) <= BOUND_Y + 1e-6;
      const DROPS = [];
      // drop(beat, [x, y], hue, pattern, opts): a drop lands at `beat` and its ripple spreads at `speed`.
      // Pattern steps are 8th notes (opts.step changes that): 'o' tap, 'H' hold that rides the ripple outward,
      // 'S' hold that also circles round the drop by opts.spin degrees, '-' continues a hold, '.' rests.
      // The first note sits at angle opts.a; each next one turns about opts.turn degrees per beat
      // around the drop (scaled so that notes far out do not fly apart); a note that would leave the
      // field turns the least it must, either way, to fit.
      function drop(beat, [x, y], hue, pattern, o = {}) {
        const speed = o.speed ?? def.speed ?? 0.11, step = o.step ?? 0.5, turn = o.turn ?? 70, spin = (o.spin ?? 120) * DEG;
        const d = { beat, x, y, hue, speed, notes: [] };
        const seq = pattern.replace(/[|\s]/g, '');
        let ang = (o.a ?? -90) * DEG, prevOff = null, prev = null;
        for (let i = 0; i < seq.length; i++) {
          const c = seq[i];
          if (c !== 'o' && c !== 'H' && c !== 'S') continue;
          let len = 0;
          if (c !== 'o') { let j = i + 1; while (j < seq.length && seq[j] === '-') j++; len = j - i; }
          const off = i * step, offEnd = (i + len) * step, sp = c === 'S' ? spin : 0;
          const R0 = speed * off, R1 = speed * offEnd;
          const fits = (a) => {
            // keep clear of the note before, so two notes never sit on top of each other
            if (prev && Math.hypot(x + Math.cos(a) * R0 * shape(a) - prev[0], y + Math.sin(a) * R0 * shape(a) - prev[1]) < 0.1) return false;
            for (let k = 0; k <= 8; k++) {
              const u = k / 8, aa = a + sp * u, r = (R0 + (R1 - R0) * u) * shape(aa);
              if (!inField(x + Math.cos(aa) * r, y + Math.sin(aa) * r)) return false;
            }
            return true;
          };
          if (prevOff !== null) ang += turn * DEG * (off - prevOff) * (0.3 / Math.max(R0, 0.15));
          let a = ang;
          for (let k = 1; k <= 24 && !fits(a); k++) a = ang + Math.ceil(k / 2) * (k % 2 ? 1 : -1) * 15 * DEG;
          if (!fits(a)) console.warn(`${def.id}: drop at beat ${beat}: note ${off} does not fit`);
          if (R1 > 0.62) console.warn(`${def.id}: drop at beat ${beat}: note ${off} is ${R1.toFixed(2)} out; split the drop`);
          d.notes.push({ off, offEnd, ang: a, spin: sp, R0, R1 });
          const ae = a + sp;
          prev = [x + Math.cos(ae) * R1 * shape(ae), y + Math.sin(ae) * R1 * shape(ae)];
          ang = ae;
          prevOff = offEnd;
        }
        DROPS.push(d);
        return d;
      }
      // skip(beat, from, to, hue, pattern): a stone skips across the water from `from` towards `to`,
      // landing on each 'o' (8th steps, or opts.step); each landing is a note on the spot it lands.
      // The skips shorten as the stone slows (opts.decay).
      function skip(beat, [x0, y0], [x1, y1], hue, pattern, o = {}) {
        const step = o.step ?? 0.5, decay = o.decay ?? 0.85;
        const seq = pattern.replace(/[|\s]/g, '');
        const hits = [];
        for (let i = 0; i < seq.length; i++) if (seq[i] === 'o') hits.push(i * step);
        const gaps = [];
        let sum = 0;
        for (let k = 0; k < hits.length - 1; k++) { gaps.push(Math.pow(decay, k)); sum += gaps[k]; }
        let acc = 0, prev = null;
        hits.forEach((off, k) => {
          const u = sum ? acc / sum : 0;
          if (k < gaps.length) acc += gaps[k];
          const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
          if (!inField(x, y)) console.warn(`${def.id}: skip at beat ${beat + off} lands outside the field`);
          // the first skip comes in from outside along the same line
          const lead = sum ? (gaps[0] / sum) * 1.3 : 0.25;
          const from = prev || { x: x - (x1 - x0) * lead, y: y - (y1 - y0) * lead, beat: beat + off - Math.max(1, step * 2) };
          const d = { beat: beat + off, x, y, hue, speed: 0.08, small: true, stone: from, notes: [{ off: 0, offEnd: 0, ang: 0, spin: 0, R0: 0, R1: 0, skip: true }] };
          DROPS.push(d);
          prev = { x, y, beat: beat + off };
        });
      }
      const B = (bar, beat = 0) => bar * BPB + beat;
      def.chart({ drop, skip, B });

      const CHART = [];
      for (const d of DROPS) {
        d.t = d.beat * SPB;
        if (d.stone) d.stone.t = d.stone.beat * SPB;
        d.notes.forEach((n, i) => {
          const beat = d.beat + n.off;
          CHART.push({ beat, t: beat * SPB, dur: (n.offEnd - n.off) * SPB, drop: d, ang: n.ang, spin: n.spin, R0: n.R0, R1: n.R1, idx: i, skip: !!n.skip });
        });
        d.last = d.t + Math.max(0, ...d.notes.map((n) => n.offEnd)) * SPB;
      }
      DROPS.sort((a, b) => a.t - b.t);
      kit.sortChart(CHART);

      // where a note sits (field units), or for a hold, where the ripple front is along it at time t
      function fieldPos(n, t) {
        const u = n.dur > 0 ? Math.min(1, Math.max(0, (t - n.t) / n.dur)) : 0;
        const a = n.ang + n.spin * u, r = (n.R0 + (n.R1 - n.R0) * u) * shape(a);
        return [n.drop.x + Math.cos(a) * r, n.drop.y + Math.sin(a) * r];
      }
      // chart checks: every note must be reachable from the one before, and no two may wait on one spot
      for (let i = 1; i < CHART.length; i++) {
        const a = CHART[i - 1], b = CHART[i];
        const gap = b.t - (a.t + a.dur), pa = fieldPos(a, a.t + a.dur), pb = fieldPos(b, b.t);
        const dist = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
        if (gap < 0.1 || dist / Math.max(gap, 0.01) > 2.2) console.warn(`${def.id}: beat ${b.beat}: ${gap.toFixed(2)} s after the last note but ${dist.toFixed(2)} away`);
      }
      for (let i = 0; i < CHART.length; i++) {
        for (let j = i + 1; j < CHART.length && CHART[j].t - CHART[i].t < 1.2; j++) {
          const a = fieldPos(CHART[i], CHART[i].t), b = fieldPos(CHART[j], CHART[j].t);
          if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.07) console.warn(`${def.id}: beats ${CHART[i].beat} and ${CHART[j].beat} share a spot`);
        }
      }
      const CHORDS = def.chords;

      // ----- layout -----
      let W = 0, H = 0, VIEW = 1.8;
      const F = { cx: 0, cy: 0, u: 1, portrait: false }, FG = { cx: 0, cy: 0, u: 1 };
      // field units -> screen; on tall screens the field turns a quarter
      const toScreen = (x, y) => (F.portrait ? [F.cx - y * F.u, F.cy + x * F.u] : [F.cx + x * F.u, F.cy + y * F.u]);
      const noteR = () => Math.max(15, F.u * 0.045);
      const notePos = (n, t) => { const [x, y] = fieldPos(n, t); return toScreen(x, y); };
      const secAt = (beat) => SECTIONS[kit.secIndex(SECTIONS, Math.max(0, Math.floor(beat / BPB)))];

      // ----- effects -----
      const particles = [], rings = [], waves = [];
      let popups = [], shakeV = 0, flashV = 0, flashCol = PAPER, lastNow = -Infinity;
      const autoAim = { x: 0, y: 0 };
      function burst(x, y, col, power, spread = 1) {
        rings.push({ x, y, col, life: 0, max: 0.5, size: spread });
        const n = kit.reduceMotion ? 4 : Math.round(14 * power);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * TAU, v = (80 + Math.random() * 220) * power * spread;
          particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 0.35 + Math.random() * 0.4, col, size: 1.3 + Math.random() * 2.2 });
        }
      }
      // what a song's scene gets to draw with
      const field = {
        F, toScreen, noteR, HUES, INK, INK2, PAPER, MUTED, ACCENT, SPB, BPB, SECTIONS, DROPS, CHART, shape, burst,
        get W() { return W; }, get H() { return H; },
        shake(v) { if (!kit.reduceMotion) shakeV = Math.max(shakeV, v); },
        flash(v, col = PAPER) { flashV = Math.max(flashV, kit.reduceMotion ? v * 0.3 : v); flashCol = col; },
        // a ring path in field units (follows the song's ripple shape)
        ringPath(x, y, R) {
          g.beginPath();
          if (!SIDES) { const [sx, sy] = toScreen(x, y); g.arc(sx, sy, Math.max(0, R * F.u), 0, TAU); return; }
          for (let k = 0; k <= SIDES; k++) {
            const a = RING_ROT + (k * TAU) / SIDES, [sx, sy] = toScreen(x + Math.cos(a) * R, y + Math.sin(a) * R);
            if (k) g.lineTo(sx, sy); else g.moveTo(sx, sy);
          }
          g.closePath();
        },
      };
      const scene = def.scene ? def.scene(kit, field) : {};
      const ctx = { now: 0, beat: 0, bar: 0, sec: SECTIONS[0], pulse: 0, dt: 0 };

      function drawEffects(dt) {
        g.globalCompositeOperation = 'lighter';
        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i]; r.life += dt;
          if (r.life > r.max) { rings.splice(i, 1); continue; }
          const u = r.life / r.max;
          for (let k = 0; k < 2; k++) {
            g.strokeStyle = rgba(r.col, 0.7 * (1 - u) * (k ? 0.5 : 1));
            g.lineWidth = 2.5 * (1 - u) + 0.8;
            g.beginPath(); g.arc(r.x, r.y, noteR() * (1 + u * (2.6 - k) * r.size), 0, TAU); g.stroke();
          }
        }
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]; p.life += dt;
          if (p.life > p.max) { particles.splice(i, 1); continue; }
          p.vx *= 1 - dt * 3; p.vy *= 1 - dt * 3;
          p.x += p.vx * dt; p.y += p.vy * dt;
          g.fillStyle = rgba(p.col, 1 - p.life / p.max);
          g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fill();
        }
        // combo milestones send one big ring across the whole surface
        for (let i = waves.length - 1; i >= 0; i--) {
          const w = waves[i]; w.life += dt;
          if (w.life > 1.4) { waves.splice(i, 1); continue; }
          const u = w.life / 1.4, R = u * Math.hypot(W, H);
          g.strokeStyle = rgba(w.col, 0.5 * (1 - u)); g.lineWidth = 6 * (1 - u) + 1;
          g.beginPath(); g.arc(w.x, w.y, R, 0, TAU); g.stroke();
          g.fillStyle = rgba(w.col, 0.9 * (1 - u));
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.font = `${Math.round(Math.min(40, F.u * 0.07))}px "Dela Gothic One", sans-serif`;
          if (u < 0.6) g.fillText(`${w.combo} COMBO`, F.cx, F.cy - F.u * 0.02 - u * 30);
        }
        g.globalCompositeOperation = 'source-over';
      }

      function drawBase(beat, pulse) {
        const bg = g.createRadialGradient(F.cx, F.cy, 0, F.cx, F.cy, Math.max(W, H) * 0.8);
        bg.addColorStop(0, rgba(INK2, 1)); bg.addColorStop(1, rgba(INK, 1));
        g.fillStyle = bg; g.fillRect(-20, -20, W + 40, H + 40);
        const hue = HUES[secAt(beat).hue];
        const glow = g.createRadialGradient(F.cx, F.cy, 0, F.cx, F.cy, F.u * 0.9);
        glow.addColorStop(0, rgba(hue, 0.06 + 0.06 * pulse)); glow.addColorStop(1, rgba(hue, 0));
        g.fillStyle = glow; g.fillRect(0, 0, W, H);
      }

      function drawRipples(now) {
        const maxR = Math.hypot(W, H) / F.u;
        for (const d of DROPS) {
          const lead = d.t - now;
          if (lead > 0.8) break;
          const col = HUES[d.hue], [sx, sy] = toScreen(d.x, d.y);
          if (lead > 0) {
            if (d.stone) continue; // a skipping stone shows itself in flight (drawStones)
            // the drop falling: a ring closing onto the spot
            const k = lead / 0.8;
            g.strokeStyle = rgba(col, 0.6 * (1 - k)); g.lineWidth = 2;
            g.beginPath(); g.arc(sx, sy, 6 + k * F.u * 0.12, 0, TAU); g.stroke();
            g.fillStyle = rgba(col, 0.8 * (1 - k));
            g.beginPath(); g.arc(sx, sy, 3 + 3 * (1 - k), 0, TAU); g.fill();
            continue;
          }
          const R = ((now - d.t) / SPB) * d.speed;
          const life = d.small ? 1.1 : 1.6;
          const fade = now < d.last ? 1 : Math.max(0, 1 - (now - d.last) / life);
          if (fade <= 0 || R > maxR) continue;
          for (let k = 0; k < 3; k++) {
            const rr = R - k * 0.035;
            if (rr <= 0) continue;
            g.strokeStyle = rgba(col, (k === 0 ? 0.75 : 0.22 / k) * fade * (d.small ? 0.7 : 1));
            g.lineWidth = k === 0 ? 2.5 : 1.5;
            field.ringPath(d.x, d.y, rr); g.stroke();
          }
          g.fillStyle = rgba(col, 0.5 * fade);
          g.beginPath(); g.arc(sx, sy, 3, 0, TAU); g.fill();
        }
      }

      // stones in flight: a shadow on the water and the stone arcing above it
      function drawStones(now) {
        for (const d of DROPS) {
          if (!d.stone) continue;
          if (d.stone.t > now + 0.6) break;
          if (now > d.t || now < d.stone.t - 0.6) continue;
          const u = Math.max(0, (now - d.stone.t) / (d.t - d.stone.t));
          const [ax, ay] = toScreen(d.stone.x, d.stone.y), [bx, by] = toScreen(d.x, d.y);
          const x = ax + (bx - ax) * u, y = ay + (by - ay) * u, hgt = Math.sin(Math.PI * u) * F.u * 0.06 * Math.min(1, (d.t - d.stone.t) / 0.5);
          const appear = Math.min(1, (now - (d.stone.t - 0.6)) / 0.4);
          g.globalAlpha = appear;
          g.fillStyle = rgba(INK, 0.55);
          g.beginPath(); g.ellipse(x, y, 7, 4, 0, 0, TAU); g.fill();
          g.fillStyle = rgba(mixCol(PAPER, HUES[d.hue], 0.3), 1);
          g.beginPath(); g.ellipse(x, y - hgt, 6, 4, -0.3, 0, TAU); g.fill();
          g.globalAlpha = 1;
        }
      }
      const mixCol = (a, b, k) => kit.mix(a, b, k);

      function drawNotes(now) {
        const r = noteR();
        g.lineCap = 'round';
        let next = null;
        for (let i = S.cursor; i < S.notes.length; i++) if (!S.notes[i].head) { next = S.notes[i]; break; }
        for (let i = S.notes.length - 1; i >= S.cursor; i--) {
          const n = S.notes[i];
          if (n.t - now > VIEW || n.end < now - 0.05) continue;
          const col = HUES[n.drop.hue];
          const appear = Math.min(1, (VIEW - (n.t - now)) / 0.3);
          if (n.dur > 0 && n.tail === null && n.head !== 'miss') {
            // hold: a channel along the path the ripple front will take; the light rides the front
            g.globalAlpha = appear;
            g.beginPath();
            for (let k = 0; k <= 24; k++) { const [px, py] = notePos(n, n.t + (n.dur * k) / 24); if (k) g.lineTo(px, py); else g.moveTo(px, py); }
            g.strokeStyle = rgba(col, 0.22); g.lineWidth = r * 1.6; g.stroke();
            g.strokeStyle = rgba(col, 0.7); g.lineWidth = 1.5; g.stroke();
            const b = notePos(n, n.end), f = notePos(n, now);
            g.beginPath(); g.arc(b[0], b[1], r * 0.5, 0, TAU); g.stroke();
            if (kit.holding(n)) {
              g.globalCompositeOperation = 'lighter';
              g.fillStyle = rgba(col, 0.45);
              g.beginPath(); g.arc(f[0], f[1], r * 1.5, 0, TAU); g.fill();
              g.globalCompositeOperation = 'source-over';
              g.fillStyle = rgba(PAPER, 0.95);
              g.beginPath(); g.arc(f[0], f[1], r * 0.45, 0, TAU); g.fill();
            }
            g.globalAlpha = 1;
          }
          if (n.head) continue;
          const [x, y] = notePos(n, n.t);
          // fills from the centre as its ripple (or stone) closes in
          const k = Math.max(0, Math.min(1, 1 - (n.t - now) / VIEW));
          g.globalAlpha = appear;
          if (!n.skip) {
            // faint thread back to the drop that will reach it, so you know which ring to watch
            const [sx, sy] = toScreen(n.drop.x, n.drop.y);
            g.setLineDash([2, 7]);
            g.strokeStyle = rgba(col, 0.22); g.lineWidth = 1.2;
            g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, y); g.stroke();
            g.setLineDash([]);
          }
          g.fillStyle = rgba(INK, 0.75);
          g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
          g.fillStyle = rgba(col, 0.25 + 0.35 * k);
          g.beginPath(); g.arc(x, y, r * k, 0, TAU); g.fill();
          g.strokeStyle = rgba(col, 1); g.lineWidth = 3;
          g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
          if (n.skip) {
            // a landing mark: four ticks around the ring
            g.lineWidth = 2;
            for (let q = 0; q < 4; q++) {
              const a = q * (TAU / 4) + TAU / 8;
              g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15); g.lineTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5); g.stroke();
            }
          } else if (n.dur > 0) {
            // a hold's head shows which way the light will travel
            const [qx, qy] = notePos(n, n.t + Math.min(n.dur, SPB * 0.25)), a = Math.atan2(qy - y, qx - x);
            g.fillStyle = rgba(PAPER, 0.9);
            g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55);
            g.lineTo(x + Math.cos(a + 2.4) * r * 0.4, y + Math.sin(a + 2.4) * r * 0.4); g.lineTo(x + Math.cos(a - 2.4) * r * 0.4, y + Math.sin(a - 2.4) * r * 0.4);
            g.fill();
          }
          if (n.dur === 0 || n.skip) {
            g.fillStyle = rgba(PAPER, 0.9);
            g.beginPath(); g.arc(x, y, r * 0.18, 0, TAU); g.fill();
          }
          if (n === next && kit.playing()) {
            // the next note to strike wears a thin white halo
            g.strokeStyle = rgba(PAPER, 0.35 + 0.35 * k); g.lineWidth = 1.5;
            g.beginPath(); g.arc(x, y, r * 1.35, 0, TAU); g.stroke();
          }
          g.globalAlpha = 1;
        }
      }

      function drawAim(now, dt) {
        let p = null;
        if (S.auto) {
          // autoplay glides toward the next note it will strike
          let target = null;
          for (let i = S.cursor; i < S.notes.length; i++) {
            const n = S.notes[i];
            if (kit.holding(n)) { target = notePos(n, now); break; }
            if (!n.head) { target = notePos(n, n.t); break; }
          }
          if (target) {
            const k = Math.min(1, dt * 10);
            autoAim.x += (target[0] - autoAim.x) * k; autoAim.y += (target[1] - autoAim.y) * k;
          }
          p = autoAim;
        } else if (kit.playing() && !S.touch) p = S.aim;
        if (!p) return;
        const r = noteR();
        g.strokeStyle = rgba(PAPER, 0.9); g.lineWidth = 2;
        g.beginPath(); g.arc(p.x, p.y, r * 0.7, 0, TAU); g.stroke();
        g.fillStyle = rgba(PAPER, 0.9);
        g.beginPath(); g.arc(p.x, p.y, 2.5, 0, TAU); g.fill();
        g.strokeStyle = rgba(PAPER, 0.25); g.lineWidth = 1;
        g.beginPath(); g.arc(p.x, p.y, r * 1.8, 0, TAU); g.stroke();
      }

      const GRADE_COLOR = { perfect: PAPER, great: ACCENT, good: HUES[0], miss: MUTED };
      function drawPopups(now) {
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '14px "Dela Gothic One", sans-serif';
        popups = popups.filter((p) => now - p.t < 0.5);
        for (const p of popups) {
          const age = now - p.t;
          g.globalAlpha = Math.min(1, (0.5 - age) * 5);
          g.fillStyle = rgba(GRADE_COLOR[p.grade], 1);
          g.fillText(p.grade.toUpperCase(), p.x, p.y - noteR() * 1.7 - age * 24);
        }
        g.globalAlpha = 1;
      }

      // the song's name as it starts, and each new section's name as it arrives
      function drawBanners(now, beat) {
        g.textAlign = 'center'; g.textBaseline = 'middle';
        if (kit.playing() && now < 1.6) {
          const a = Math.min(1, (now + 2.2) / 0.5) * Math.min(1, (1.6 - now) / 0.6);
          g.globalAlpha = Math.max(0, a);
          const size = Math.round(Math.min(64, W * 0.11));
          g.font = `${size}px "Dela Gothic One", sans-serif`;
          const chars = [...def.title], widths = chars.map((c) => g.measureText(c).width), total = widths.reduce((s, w) => s + w, 0);
          let x = W / 2 - total / 2;
          chars.forEach((c, i) => { g.fillStyle = rgba(HUES[i % HUES.length], 1); g.textAlign = 'left'; g.fillText(c, x, H / 2 - size * 0.3); x += widths[i]; });
          g.textAlign = 'center';
          g.fillStyle = rgba(PAPER, 0.85);
          g.font = '700 14px "Zen Kaku Gothic New", sans-serif';
          g.fillText(`${def.jp} ・ ${def.genre}`, W / 2, H / 2 + size * 0.55);
          g.globalAlpha = 1;
          return;
        }
        const sec = secAt(beat), into = beat - sec.bar * BPB;
        if (sec.bar === 0 || into < 0 || into > BPB * 1.5) return;
        const u = into / (BPB * 1.5), halfH = (F.portrait ? 0.8 : 0.48) * F.u;
        g.globalAlpha = Math.sin(Math.PI * u) * 0.24;
        g.fillStyle = rgba(HUES[sec.hue], 1);
        g.font = `${Math.round(Math.min(36, W * 0.07))}px "Dela Gothic One", sans-serif`;
        if (g.letterSpacing !== undefined) g.letterSpacing = `${Math.round(6 + u * 12)}px`;
        g.fillText(sec.name, F.cx, F.cy - halfH * 0.9);
        if (g.letterSpacing !== undefined) g.letterSpacing = '0px';
        g.globalAlpha = 1;
      }

      const leadMidi = def.song.leadMidi || ((n) => { const ch = CHORDS[Math.floor(n.beat / BPB) % CHORDS.length]; return ch.lead[n.idx % ch.lead.length]; });

      return {
        id: def.id, title: def.title, jp: def.jp, genre: def.genre, level: def.level, lede: def.lede, hues: def.hues,
        theme, attractFromBar: def.attractFromBar ?? 8, beatsPerBar: BPB,
        bpm: BPM, bars: def.bars, sections: SECTIONS, chords: CHORDS, chart: CHART,
        hitTest(n, x, y) { const [nx, ny] = notePos(n, n.t); return Math.hypot(nx - x, ny - y) <= noteR() * 1.8; },
        followPos: notePos,
        followReach: () => noteR() * 2.6,
        progressColor: (beat) => rgba(HUES[secAt(beat).hue], 0.9),
        song: { ...def.song, leadMidi },
        onAudioStart(A, at) { if (def.song.start) def.song.start(A, at); },
        onAudioStop() { if (def.song.stop) def.song.stop(); },
        layout(w, h, snap) {
          W = w; H = h;
          const top = Math.max(70, H * 0.09), bottom = Math.max(30, H * 0.04);
          let x0 = 24;
          const x1 = W - 24;
          if (kit.wide()) x0 = Math.max(W * 0.42, 560);
          const aw = x1 - x0, ah = H - top - bottom;
          F.portrait = ah > aw * 1.2;
          FG.u = F.portrait ? Math.min(aw / 2 / 0.48, ah / 2 / 0.8) : Math.min(aw / 2 / 0.8, ah / 2 / 0.48);
          FG.cx = x0 + aw / 2; FG.cy = top + ah / 2;
          if (snap) Object.assign(F, FG);
          if (scene.layout) scene.layout();
        },
        update(now, dt) {
          VIEW = kit.view(1.8);
          const k = Math.min(1, dt * 4);
          for (const key of ['cx', 'cy', 'u']) F[key] += (FG[key] - F[key]) * k;
          shakeV = Math.max(0, shakeV - dt * 40);
          flashV = Math.max(0, flashV - dt * 2.5);
        },
        draw(now, dt) {
          const beat = now / SPB, bar = Math.floor(beat / BPB), sec = secAt(beat);
          ctx.now = now; ctx.beat = beat; ctx.bar = bar; ctx.sec = sec; ctx.dt = dt;
          ctx.pulse = kit.pulse(beat, def.kickOn ? def.kickOn(bar, sec.name) : true);
          // drops landing this frame splash
          if (now - lastNow < 0.25) {
            for (const d of DROPS) {
              if (d.t > now) break;
              if (d.t > lastNow) { const [sx, sy] = toScreen(d.x, d.y); burst(sx, sy, HUES[d.hue], d.small ? 0.35 : 0.5, 0.6); }
            }
          }
          lastNow = now;
          g.save();
          if (shakeV > 0) g.translate((Math.random() - 0.5) * shakeV, (Math.random() - 0.5) * shakeV);
          drawBase(beat, ctx.pulse);
          if (scene.back) scene.back(ctx);
          drawRipples(now);
          if (scene.surface) scene.surface(ctx);
          drawStones(now);
          drawNotes(now);
          drawEffects(dt);
          if (scene.front) scene.front(ctx);
          drawAim(now, dt);
          drawBanners(now, beat);
          if (kit.playing()) drawPopups(now);
          g.restore();
          if (flashV > 0) { g.fillStyle = rgba(flashCol, Math.min(0.6, flashV)); g.fillRect(0, 0, W, H); }
        },
        onJudge(n, grade, now) {
          const [x, y] = notePos(n, now);
          popups.push({ grade, t: now, x, y });
          if (popups.length > 6) popups.shift();
          if (grade !== 'miss') burst(x, y, HUES[n.drop.hue], grade === 'perfect' ? 1 : 0.6);
          if (grade !== 'miss' && S.combo > 0 && S.combo % 50 === 0) waves.push({ x, y, col: HUES[n.drop.hue], combo: S.combo, life: 0 });
          if (scene.hit) scene.hit(ctx, n, grade, x, y);
        },
        debug: { notePos: (c, t) => notePos(kit.runOf(c) || c, t) },
        onNewRun() {
          particles.length = 0; rings.length = 0; waves.length = 0; popups = [];
          autoAim.x = F.cx; autoAim.y = F.cy; lastNow = -Infinity; shakeV = 0; flashV = 0;
          if (scene.reset) scene.reset();
        },
      };
    });
  }
