
  // =====================================================================
  //  FIELD
  //  The water surface every song plays on. rippleSong(def) turns a song
  //  description into a playable song: drops land, their ripples spread,
  //  and each note is struck when its ripple reaches it.
  //
  //  def: id, title, jp, genre, level (1-10), lede, theme, hues (4 colours),
  //    bpm, beatsPerBar, bars, sections [{ bar, name, hue }], chords,
  //    tempo [[beat, bpm, call]...] and stops [[beat, seconds]...] for a
  //    tempo that changes (rings follow it; `call` announces the change),
  //    bpmLabel for the menu,
  //    speed (ripple growth, field units per beat), ring { sides, rot }
  //    (0 sides = circles), attractFromBar,
  //    chart({ drop, skip, wave, pulse, cross, tip, B, chord, tap, dial })
  //    to place the notes
  //    (see below), song: the music (see the engine's audio; leadMidi
  //    defaults to the chord's lead tones), or audioFile { src, t0 } for a
  //    recorded song whose beat 0 is t0 seconds in; kickOn(bar, section) or
  //    pulse(beat) for the beat pulse; ring.chroma for prism fringes;
  //    scene(kit, field): { back, surface, front, post, ring, hit, reset,
  //    layout } drawing hooks.
  // =====================================================================

  // A beat pulse from a list of kick beats (for songs played from a recording).
  function kickPulse(kicks) {
    const K = [...kicks].sort((a, b) => a - b);
    return (beat) => {
      let lo = 0, hi = K.length - 1, k = -1;
      while (lo <= hi) { const m = (lo + hi) >> 1; if (K[m] <= beat) { k = m; lo = m + 1; } else hi = m - 1; }
      return k < 0 ? 0 : Math.exp(-(beat - K[k]) * 5);
    };
  }

  function rippleSong(def) {
    defineSong((kit) => {
      const { g, rgba, hex, S, TAU, DEG } = kit;
      const BPM = def.bpm, SPB = 60 / BPM, BPB = def.beatsPerBar || 4;
      // the tempo can change (def.tempo [[beat, bpm]...]) and stop (def.stops [[beat, seconds]...]); rings live
      // in beats, so they speed up, slow down and freeze with the music
      const TM = kit.tempoMap(def.tempo || [[0, BPM]], def.stops || []), { timeOf, beatOf } = TM;
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

      // ----- ripples -----
      // A drop's ring, `off` beats after it lands, has radius r0 + speed*off + accel*off²/2
      // (a negative speed makes a ring that closes in) around a centre that stays put, or moves
      // through the keyframes of opts.path. A pulse train sends `rings` rings, `gap` beats apart.
      const ringR = (d, off) => d.r0 + d.speed * off + 0.5 * d.accel * off * off;
      function ringC(d, off) {
        const P = d.path;
        if (!P) return [d.x, d.y];
        if (off <= 0) return [P[0][1], P[0][2]];
        for (let k = 1; k < P.length; k++) {
          if (off > P[k][0]) continue;
          const a = P[k - 1], b = P[k];
          if (d.ease === 'step') return [a[1], a[2]];
          let u = (off - a[0]) / Math.max(1e-6, b[0] - a[0]);
          if (d.ease !== 'linear') u = u * u * (3 - 2 * u);
          return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
        }
        const z = P[P.length - 1];
        return [z[1], z[2]];
      }
      // the point of ring `ring` of drop d along angle a, `off` beats after landing
      function ringPoint(d, off, a, ring = 0) {
        const [cx, cy] = ringC(d, off), r = ringR(d, off - ring * d.gap) * shape(a);
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      }

      // ----- chart: drops (ripple sources) and the notes their ripple reaches -----
      // Positions are in field units: the field is about ±0.8 wide and ±0.48 tall around its centre.
      const BOUND_X = 0.74, BOUND_Y = 0.42;
      const inField = (x, y) => Math.abs(x) <= BOUND_X + 1e-6 && Math.abs(y) <= BOUND_Y + 1e-6;
      const onScreen = (x, y) => Math.abs(x) < 0.95 && Math.abs(y) < 0.62;
      const DROPS = [];
      let jackId = 0;
      function newDrop(beat, x, y, hue, o) {
        const d = {
          beat, x, y, hue, notes: [],
          speed: o.speed ?? def.speed ?? 0.11, r0: o.r0 ?? 0, accel: o.accel ?? 0, rings: o.rings ?? 1, gap: o.gap ?? 1,
          dark: !!o.dark, reveal: !!o.reveal,
        };
        if (o.path) { d.path = [[0, x, y], ...o.path]; d.ease = o.ease || 'smooth'; }
        if (o.dial) d.dial = { v: o.dial.v ?? 0.12, dir: o.dial.dir ?? 1 };
        // opts.show: its notes appear only that many beats before the drop lands (keeps busy screens clear)
        if (o.show !== undefined) d.showBeat = beat - o.show;
        DROPS.push(d);
        return d;
      }
      // drop(beat, [x, y], hue, pattern, opts): a drop lands at `beat` and its ripple spreads.
      // Pattern steps are 8th notes (opts.step changes that): 'o' tap, 'H' hold that rides the ripple,
      // 'S' hold that also circles round the drop by opts.spin degrees, '-' continues a hold, '.' rests.
      // The first note sits at angle opts.a; each next one turns about opts.turn degrees per beat
      // around the drop (scaled so that notes far out do not fly apart); a note that would leave the
      // field turns the least it must, either way, to fit. opts.angs gives every note's angle instead.
      // Ring options: speed, r0, accel, path [[beat, x, y]...] + ease ('smooth' | 'linear' | 'step'),
      // dark (notes hidden until a reveal ring passes them).
      function drop(beat, [x, y], hue, pattern, o = {}) {
        const step = o.step ?? 0.5, turn = o.turn ?? 70, spin = (o.spin ?? 120) * DEG;
        const d = newDrop(beat, x, y, hue, o);
        // problems are kept on the drop (d.warn) and printed unless opts.quiet (a chart trying layouts)
        d.warn = [];
        const warn = (msg) => { d.warn.push(msg); if (!o.quiet) console.warn(msg); };
        const seq = pattern.replace(/[|\s]/g, '');
        let ang = (o.a ?? -90) * DEG, prevOff = null, prev = null, ni = 0;
        for (let i = 0; i < seq.length; i++) {
          const c = seq[i];
          if (c !== 'o' && c !== 'H' && c !== 'S') continue;
          let len = 0;
          if (c !== 'o') { let j = i + 1; while (j < seq.length && seq[j] === '-') j++; len = j - i; }
          const off = i * step, offEnd = (i + len) * step, sp = c === 'S' ? spin : 0;
          const at = (a, u) => ringPoint(d, off + (offEnd - off) * u, a + sp * u);
          if (ringR(d, off) <= 0 || ringR(d, offEnd) <= 0) warn(`${def.id}: drop at beat ${beat}: note ${off} comes after its ring has closed`);
          const fits = (a) => {
            // keep clear of the note before, so two notes never sit on top of each other
            if (prev) { const [px, py] = at(a, 0); if (Math.hypot(px - prev[0], py - prev[1]) < 0.1) return false; }
            for (let k = 0; k <= 8; k++) { const [px, py] = at(a, k / 8); if (!inField(px, py)) return false; }
            return true;
          };
          let a;
          if (o.angs) {
            a = o.angs[ni] * DEG;
            if (!fits(a)) warn(`${def.id}: drop at beat ${beat}: note ${off} at angle ${o.angs[ni]} does not fit`);
          } else {
            if (prevOff !== null) ang += turn * DEG * (off - prevOff) * (0.3 / Math.max(Math.abs(ringR(d, off)), 0.15));
            a = ang;
            for (let k = 1; k <= 24 && !fits(a); k++) a = ang + Math.ceil(k / 2) * (k % 2 ? 1 : -1) * 15 * DEG;
            if (!fits(a)) warn(`${def.id}: drop at beat ${beat}: note ${off} does not fit`);
          }
          if (!d.path && inField(x, y) && d.speed > 0 && ringR(d, offEnd) > 0.62) warn(`${def.id}: drop at beat ${beat}: note ${off} is ${ringR(d, offEnd).toFixed(2)} out; split the drop`);
          d.notes.push({ off, offEnd, ang: a, spin: sp, midi: o.midi ? o.midi[ni] : undefined });
          prev = at(a, 1);
          ang = a + sp;
          prevOff = offEnd;
          ni++;
        }
        return d;
      }
      // wave(beat, [x, y], hue, opts): a ring with no notes of its own (a sonar sweep, a shock wave);
      // with opts.reveal it uncovers dark notes as it passes them.
      const wave = (beat, p, hue, o = {}) => drop(beat, p, hue, '', o);
      // pulse(beat, [x, y], hue, opts): rapid hits, opts.n of them, opts.gap beats apart; the first ring reaches
      // its spot (angle opts.a from the drop) at opts.off beats. They alternate between two spots side by side,
      // right then left on a phone held upright (the field's y runs across its screen), one for each thumb:
      // two pulse trains a beat-gap apart, each from its own drop, opts.spread field units apart, either side of
      // [x, y] (or, with opts.keep, the first spot stays at [x, y] and the second goes beside it).
      let altId = 0;
      function pulse(beat, [x, y], hue, o = {}) {
        const n = o.n ?? 3, gap = o.gap ?? 0.5, off = o.off ?? 1, a = (o.a ?? -90) * DEG, w = (o.spread ?? 0.24) / 2;
        const alt = ++altId, drops = [];
        // the pair keeps inside the field: near an edge both spots move in together
        const py0 = y + Math.sin(a) * (o.r0 ?? 0) + Math.sin(a) * (o.speed ?? def.speed ?? 0.11) * off;
        let sides = [-w, w];
        if (o.keep) sides = py0 + 3 * w <= BOUND_Y ? [0, 2 * w] : [0, -2 * w];
        const lo = py0 + Math.min(...sides), hi = py0 + Math.max(...sides);
        const shift = Math.min(0, BOUND_Y - hi) + Math.max(0, -BOUND_Y - lo);
        sides.map((v) => v + shift).forEach((dy, side) => {
          const cnt = Math.ceil((n - side) / 2);
          if (cnt <= 0) return;
          const d = newDrop(beat + side * gap, x, y + dy, hue, { ...o, rings: cnt, gap: gap * 2 });
          const id = ++jackId;
          for (let k = 0; k < cnt; k++) {
            const q = side + k * 2, mid = Array.isArray(o.midi) ? o.midi[q % o.midi.length] : o.midi;
            d.notes.push({ off: off + k * gap * 2, offEnd: off + k * gap * 2, ang: a, spin: 0, ring: k, jack: { id, k, n: cnt, alt }, midi: mid });
          }
          const [px, py] = ringPoint(d, off, a);
          if (!inField(px, py)) console.warn(`${def.id}: pulse at beat ${beat} strikes outside the field`);
          drops.push(d);
        });
        // the drop that strikes last (to carry on from), knowing the other
        const last = drops[(n - 1) % 2] || drops[0];
        last.mate = drops.find((d) => d !== last);
        return last;
      }
      // cross(beat, dropA, dropB): two notes at the two points where the rings cross at `beat`,
      // struck together (a crossing pair). Returns both points.
      let pairId = 0;
      function cross(beat, A, B) {
        const oa = beat - A.beat, ob = beat - B.beat;
        const [ax, ay] = ringC(A, oa), [bx, by] = ringC(B, ob), ra = ringR(A, oa), rb = ringR(B, ob);
        const dx = bx - ax, dy = by - ay, dd = Math.hypot(dx, dy);
        if (SIDES || !dd || dd > ra + rb || dd < Math.abs(ra - rb)) { console.warn(`${def.id}: rings do not cross at beat ${beat}`); return null; }
        const l = (ra * ra - rb * rb + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, ra * ra - l * l));
        const mx = ax + (dx * l) / dd, my = ay + (dy * l) / dd;
        const P = [[mx - (dy * h) / dd, my + (dx * h) / dd], [mx + (dy * h) / dd, my - (dx * h) / dd]];
        const id = ++pairId;
        for (const p of P) {
          if (!inField(...p)) console.warn(`${def.id}: crossing at beat ${beat} is outside the field`);
          A.notes.push({ off: oa, offEnd: oa, ang: Math.atan2(p[1] - ay, p[0] - ax), spin: 0, cross: B, pair: id });
        }
        if (Math.hypot(P[0][0] - P[1][0], P[0][1] - P[1][1]) < 0.2) console.warn(`${def.id}: the two crossings at beat ${beat} are too close together`);
        return P;
      }
      // skip(beat, from, to, hue, pattern): a stone skips across the water from `from` towards `to`,
      // landing on each 'o' (8th steps, or opts.step); each landing is a note on the spot it lands.
      // The stone flies at an even pace, so the distance between landings follows the rhythm: a skip
      // twice as long in time is twice as long on the water, and quick skips sit close together.
      function skip(beat, [x0, y0], [x1, y1], hue, pattern, o = {}) {
        const step = o.step ?? 0.5;
        const seq = pattern.replace(/[|\s]/g, '');
        const hits = [];
        for (let i = 0; i < seq.length; i++) if (seq[i] === 'o') hits.push(i * step);
        const span = hits.length > 1 ? hits[hits.length - 1] - hits[0] : 0;
        const len = Math.hypot(x1 - x0, y1 - y0) || 1;
        let prev = null;
        hits.forEach((off) => {
          const u = span ? (off - hits[0]) / span : 0;
          const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
          if (!inField(x, y)) console.warn(`${def.id}: skip at beat ${beat + off} lands outside the field`);
          // the first skip comes in from outside along the same line, at the same pace
          const pre = Math.max(1, step * 2), lead = span ? Math.min(0.45, (len / span) * pre) / len : 0.25;
          const from = prev || { x: x - (x1 - x0) * lead, y: y - (y1 - y0) * lead, beat: beat + off - pre };
          const d = newDrop(beat + off, x, y, hue, { speed: 0.08, dark: o.dark });
          d.small = true; d.stone = from;
          d.notes.push({ off: 0, offEnd: 0, ang: 0, spin: 0, skip: true, midi: o.midi ? o.midi[hits.indexOf(off)] : undefined });
          prev = { x, y, beat: beat + off };
        });
      }
      // chord(beat, drop, angles, opts): notes at several angles on one ring, all reached at `beat` and struck
      // together (fingers; or with the mouse on one of them, one more button per extra note). Returns the points.
      function chord(beat, d, angs, o = {}) {
        const off = beat - d.beat, id = ++pairId;
        const P = angs.map((deg, k) => {
          const a = deg * DEG, p = ringPoint(d, off, a);
          if (!inField(...p)) console.warn(`${def.id}: chord at beat ${beat}: angle ${deg} is outside the field`);
          d.notes.push({ off, offEnd: off, ang: a, spin: 0, pair: id, chord: true, midi: o.midi ? o.midi[k % o.midi.length] : undefined });
          return p;
        });
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) < 0.2) console.warn(`${def.id}: chord at beat ${beat}: notes too close together`);
        return P;
      }
      // tap(drop, beat, angle, opts): one note on a drop's ring at `beat` (opts.len beats long makes it a hold,
      // opts.spin degrees round the ring while held)
      function tap(d, beat, deg, o = {}) {
        const off = beat - d.beat, len = o.len || 0, a = deg * DEG;
        const p = ringPoint(d, off, a);
        if (!inField(...p)) console.warn(`${def.id}: note at beat ${beat}: angle ${deg} is outside the field`);
        d.notes.push({ off, offEnd: off + len, ang: a, spin: (o.spin || 0) * DEG, midi: o.midi });
        return p;
      }
      // dial(beat, [x, y], hue, R, opts): a ring that stands still (the line to strike on) from `beat` on;
      // its notes come to it instead: out from the centre (opts.dir 1) or in from outside (-1), opts.v field
      // units per beat, so they rush in faster as the tempo rises. Notes go on with tap() and chord().
      const dial = (beat, p, hue, R, o = {}) => newDrop(beat, p[0], p[1], hue, { ...o, speed: 0, r0: R, dial: { v: o.v, dir: o.dir } });
      const B = (bar, beat = 0) => bar * BPB + beat;
      // where note i of drop d sits, and when: for chaining a new drop onto a note
      const tip = (d, i) => { const n = d.notes[i < 0 ? d.notes.length + i : i]; return { beat: d.beat + n.offEnd, p: ringPoint(d, n.offEnd, n.ang + n.spin, n.ring || 0) }; };
      def.chart({ drop, skip, wave, pulse, cross, tip, B, chord, tap, dial, timeOf });

      const CHART = [];
      for (const d of DROPS) {
        d.t = timeOf(d.beat);
        if (d.stone) d.stone.t = timeOf(d.stone.beat);
        d.notes.forEach((n, i) => {
          const beat = d.beat + n.off, t = timeOf(beat);
          CHART.push({ beat, t, dur: timeOf(d.beat + n.offEnd) - t, len: n.offEnd - n.off, drop: d, ang: n.ang, spin: n.spin, ring: n.ring || 0, idx: i, skip: !!n.skip, pair: n.pair, cross: n.cross, chord: !!n.chord, jack: n.jack, dark: d.dark, midi: n.midi });
        });
        d.last = timeOf(d.beat + Math.max(0, ...d.notes.map((n) => n.offEnd)));
        // a ring that closes in vanishes at its centre
        if (d.speed < 0) { let off = 0; while (ringR(d, off) > 0 && off < 64) off += 0.02; d.closeOff = off; d.closeT = timeOf(d.beat + off); }
      }
      DROPS.sort((a, b) => a.t - b.t);
      kit.sortChart(CHART);
      // the order to strike them in, counted afresh each bar; the two points of a crossing share a number
      {
        let bar = -1, k = 0, lastT = -1;
        for (const c of CHART) {
          const b = Math.floor(c.beat / BPB + 1e-6);
          if (b !== bar) { bar = b; k = 0; lastT = -1; }
          if (Math.abs(c.t - lastT) > 0.002) k++;
          c.order = k; c.bar = b; lastT = c.t;
        }
      }

      // where a note sits (field units), or for a hold, where the ripple front is along it at time t
      function fieldPos(n, t) {
        if (!(n.dur > 0)) return ringPoint(n.drop, n.beat - n.drop.beat, n.ang, n.ring);
        const b = Math.min(n.beat + n.len, Math.max(n.beat, beatOf(Math.min(n.t + n.dur, Math.max(n.t, t))))), u = (b - n.beat) / n.len;
        return ringPoint(n.drop, b - n.drop.beat, n.ang + n.spin * u, n.ring);
      }
      // dark notes show themselves when the last reveal ring before them sweeps past (at least a beat ahead)
      const REVEALERS = DROPS.filter((d) => d.reveal);
      for (const c of CHART) {
        if (!c.dark) continue;
        const [px, py] = fieldPos(c, c.t);
        let best = null;
        for (const r of REVEALERS) {
          if (r.t >= c.t) continue;
          for (let off = 0; off < 48; off += 0.04) {
            const [cx, cy] = ringC(r, off);
            if (ringR(r, off) < Math.hypot(px - cx, py - cy)) continue;
            const t = timeOf(r.beat + off);
            if (r.beat + off <= c.beat - 1 && (best === null || t > best)) best = t;
            break;
          }
        }
        c.revealT = best ?? timeOf(c.beat - 1.5);
      }
      // chart checks: every note must be reachable from the one before, and no two may wait on one spot
      const mates = (c) => (c.pair ? CHART.filter((x) => x.pair === c.pair && x.drop === c.drop) : [c]);
      for (let i = 1; i < CHART.length; i++) {
        const a = CHART[i - 1], b = CHART[i];
        if (a.pair && a.pair === b.pair && a.drop === b.drop) continue;
        // from either note of a pair before, to the nearer note of a pair after
        const gap = b.t - (a.t + a.dur);
        let dist = Infinity;
        for (const x of mates(a)) for (const y of mates(b)) { const pa = fieldPos(x, x.t + x.dur), pb = fieldPos(y, y.t); dist = Math.min(dist, Math.hypot(pb[0] - pa[0], pb[1] - pa[1])); }
        // (16ths at the fastest tempos come 60 ms apart: fine for a jack on one spot, a trill between two
        // close spots, or a run whose notes stay close)
        // the two spots of rapid hits take a thumb each, so going from one to the other is no reach
        if (a.jack && b.jack && a.jack.alt === b.jack.alt) continue;
        if (gap < 0.055 || (gap < 0.1 && !(a.jack && b.jack && a.jack.id === b.jack.id) && dist > 0.2) || dist / Math.max(gap, 0.01) > 2.2) console.warn(`${def.id}: beat ${b.beat}: ${gap.toFixed(2)} s after the last note but ${dist.toFixed(2)} away`);
      }
      for (let i = 0; i < CHART.length; i++) {
        for (let j = i + 1; j < CHART.length && CHART[j].t - CHART[i].t < 1.2; j++) {
          if (CHART[i].jack && CHART[j].jack && CHART[i].jack.alt === CHART[j].jack.alt) continue;
          // notes coming to a standing ring arrive one after another along their lane, so they never sit together
          if (CHART[i].drop.dial && CHART[j].drop.dial && CHART[j].t - CHART[i].t > 0.1) continue;
          if (CHART[j].drop.dial && CHART[j].t - (CHART[i].t + CHART[i].dur) > 0.3) continue;
          // nor do two notes that are never on the water at once
          if (CHART[j].drop.showBeat !== undefined && CHART[i].t + CHART[i].dur < timeOf(CHART[j].drop.showBeat)) continue;
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
      // how far from a note a press still counts (generous: a little over twice the note's size)
      const hitR = () => Math.max(40, noteR() * 2.7);
      const notePos = (n, t) => { const [x, y] = fieldPos(n, t); return toScreen(x, y); };
      const secAt = (beat) => SECTIONS[kit.secIndex(SECTIONS, Math.max(0, Math.floor(beat / BPB)))];

      // ----- effects -----
      const particles = [], rings = [], waves = [];
      let popups = [], shakeV = 0, flashV = 0, flashCol = PAPER, lastNow = -Infinity, nowBeat = 0;
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
        F, toScreen, noteR, HUES, INK, INK2, PAPER, MUTED, ACCENT, SPB, BPB, SECTIONS, DROPS, CHART, shape, burst, ringC, ringR, onScreen,
        timeOf, beatOf, bpmAt: TM.bpmAt, stopped: TM.stopped,
        rings: [], // the rings on the water this frame: { x, y, R, hue, d } in field units
        get W() { return W; }, get H() { return H; },
        shake(v) { if (kit.fx()) shakeV = Math.max(shakeV, v); },
        flash(v, col = PAPER) { if (!kit.fx()) return; flashV = Math.max(flashV, v); flashCol = col; },
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

      const CHROMA = !!(def.ring && def.ring.chroma), RED = [255, 70, 90], BLUE = [70, 130, 255];
      function drawRing(d, x, y, R, alpha, width) {
        if (scene.ring) { scene.ring(d, x, y, R, alpha, width); return; }
        if (CHROMA) {
          // light through a prism: red and blue fringes either side of the ring
          g.globalCompositeOperation = 'lighter';
          for (const [c, dr] of [[RED, -2.2], [BLUE, 2.2]]) { g.strokeStyle = rgba(c, alpha * 0.55); g.lineWidth = width * 0.8; field.ringPath(x, y, R + dr / F.u); g.stroke(); }
          g.globalCompositeOperation = 'source-over';
        }
        g.strokeStyle = rgba(HUES[d.hue], alpha); g.lineWidth = width;
        field.ringPath(x, y, R); g.stroke();
      }
      // a glow on the screen edge facing a centre that lies off screen
      function edgeGlow(x, y, col, a) {
        let [sx, sy] = toScreen(x, y);
        sx = Math.min(W, Math.max(0, sx)); sy = Math.min(H, Math.max(0, sy));
        const r = F.u * 0.45, gl = g.createRadialGradient(sx, sy, 0, sx, sy, r);
        gl.addColorStop(0, rgba(col, 0.45 * a)); gl.addColorStop(1, rgba(col, 0));
        g.fillStyle = gl; g.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
      // The rings that still have notes to strike are the lines to watch: they are drawn bold and bright,
      // and every other line (echoes, rings already done, sonar sweeps, stone splashes) stays faint.
      const live = new Map();
      function findLive(now) {
        live.clear();
        const mark = (d, k) => { if (!live.has(d)) live.set(d, new Set()); live.get(d).add(k); };
        for (let i = S.cursor; i < S.notes.length; i++) {
          const n = S.notes[i];
          if (n.t - now > VIEW + 2) break;
          if (n.head && n.holding === null) continue;
          if (n.skip) continue; // a stone's note sits on its landing spot, not on a ring
          mark(n.drop, n.ring || 0);
          if (n.cross) mark(n.cross, 0);
        }
      }
      function drawRipples(now) {
        field.rings.length = 0;
        findLive(now);
        const view = Math.hypot(W, H) / F.u;
        for (const d of DROPS) {
          const lead = d.t - now;
          if (lead > 0.8) break;
          const col = HUES[d.hue], off = nowBeat - d.beat;
          const [cx, cy] = ringC(d, Math.max(0, off)), inside = onScreen(cx, cy);
          if (lead > 0) {
            if (d.stone) continue; // a skipping stone shows itself in flight (drawStones)
            const k = lead / 0.8;
            if (d.path) {
              // where a moving source will travel: a dotted line through its keyframes
              g.setLineDash([3, 8]); g.strokeStyle = rgba(col, 0.4 * (1 - k)); g.lineWidth = 1.5;
              g.beginPath(); d.path.forEach(([, px, py], q) => { const [sx, sy] = toScreen(px, py); if (q) g.lineTo(sx, sy); else g.moveTo(sx, sy); }); g.stroke();
              g.setLineDash([]);
            }
            if (!inside) { edgeGlow(cx, cy, col, 1 - k); continue; }
            const [sx, sy] = toScreen(cx, cy);
            if (d.speed < 0 || d.dial) {
              // a ring that will close in (or stand still): its outline gathers first
              g.setLineDash([4, 6]); g.strokeStyle = rgba(col, 0.5 * (1 - k)); g.lineWidth = 1.5;
              field.ringPath(cx, cy, d.r0); g.stroke(); g.setLineDash([]);
              continue;
            }
            // the drop falling: a ring closing onto the spot
            g.strokeStyle = rgba(col, 0.6 * (1 - k)); g.lineWidth = 2;
            g.beginPath(); g.arc(sx, sy, 6 + k * F.u * 0.12, 0, TAU); g.stroke();
            g.fillStyle = rgba(col, 0.8 * (1 - k));
            g.beginPath(); g.arc(sx, sy, 3 + 3 * (1 - k), 0, TAU); g.fill();
            continue;
          }
          const fade = !d.notes.length || now < d.last ? 1 : Math.max(0, 1 - (now - d.last) / (d.small ? 1.1 : 1.6));
          if (fade <= 0) continue;
          if (!inside && off < 1.5) edgeGlow(cx, cy, col, 1 - off / 1.5);
          const reach = Math.hypot(cx, cy) + view;
          let any = false;
          for (let k = 0; k < d.rings; k++) {
            const ok = off - k * d.gap;
            if (ok < 0) continue;
            const R = ringR(d, ok);
            if (R <= 0 || R > reach) continue;
            any = true;
            const appear = d.speed < 0 || d.r0 > 0 ? Math.min(1, ok / 0.4) : 1;
            const judging = live.has(d) && live.get(d).has(k);
            for (let e = 2; e >= 1; e--) {
              // echoes: where the ring (and a moving centre) was a moment ago; always faint
              const oe = ok - e * 0.3;
              if (oe < 0) continue;
              const Re = ringR(d, oe);
              if (Re <= 0) continue;
              const [ex, ey] = ringC(d, off - e * 0.3);
              drawRing(d, ex, ey, Re, (0.12 / e) * fade * appear, 1);
            }
            if (!inside && judging) {
              // a giant ring from off screen trails a soft wake
              for (let e = 1; e <= 4; e++) { g.strokeStyle = rgba(col, 0.04 * fade * appear); g.lineWidth = 6; field.ringPath(cx, cy, R - e * 0.025 * Math.sign(d.speed || 1)); g.stroke(); }
            }
            if (judging) {
              // the line to watch: a soft glow under a bold, bright ring
              g.strokeStyle = rgba(col, 0.18 * appear); g.lineWidth = 9;
              field.ringPath(cx, cy, R); g.stroke();
              drawRing(d, cx, cy, R, 0.95 * appear, 3.5);
            } else drawRing(d, cx, cy, R, 0.26 * fade * appear * (d.small ? 0.7 : 1), 1.3);
            field.rings.push({ x: cx, y: cy, R, hue: d.hue, d });
          }
          if (!inside || !any) continue;
          const [sx, sy] = toScreen(cx, cy);
          if (d.path) {
            // a moving source glows as it travels
            const gl = g.createRadialGradient(sx, sy, 0, sx, sy, noteR() * 1.4);
            gl.addColorStop(0, rgba(PAPER, 0.8 * fade)); gl.addColorStop(0.3, rgba(col, 0.5 * fade)); gl.addColorStop(1, rgba(col, 0));
            g.fillStyle = gl; g.fillRect(sx - noteR() * 1.4, sy - noteR() * 1.4, noteR() * 2.8, noteR() * 2.8);
          } else {
            g.fillStyle = rgba(col, 0.5 * fade);
            g.beginPath(); g.arc(sx, sy, 3, 0, TAU); g.fill();
          }
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

      // a note coming to a standing ring (dial): where it is now, in field units, or null while it is unseen
      function approach(n) {
        const d = n.drop, D = d.dial, R = ringR(d, 0), r = R - D.dir * D.v * (n.beat - nowBeat);
        if (D.dir > 0 ? r < 0 : r > R + 0.9) return null;
        const [cx, cy] = ringC(d, n.beat - d.beat), sh = shape(n.ang);
        return { p: [cx + Math.cos(n.ang) * r * sh, cy + Math.sin(n.ang) * r * sh], r, a: D.dir > 0 ? Math.min(1, r / 0.06) : Math.min(1, (R + 0.9 - r) / 0.25) };
      }
      // where a waiting note is drawn on screen
      const shownPos = (n) => { const ap = n.drop.dial && !n.head ? approach(n) : null; return ap ? toScreen(...ap.p) : notePos(n, n.t); };

      function drawNotes(now) {
        const r = noteR();
        g.lineCap = 'round';
        let next = null;
        const front = new Map(); // the first note still waiting in each pulse train
        for (let i = S.cursor; i < S.notes.length; i++) {
          const n = S.notes[i];
          if (n.head) continue;
          if (!next) next = n;
          if (n.jack && !front.has(n.jack.id)) front.set(n.jack.id, n);
          if (n.t - now > VIEW) break;
        }
        for (let i = S.notes.length - 1; i >= S.cursor; i--) {
          const n = S.notes[i];
          const D = n.drop.dial, ap = D && !n.head ? approach(n) : null;
          if (D ? !n.head && !ap : n.t - now > VIEW) continue;
          if (n.end < now - 0.05) continue;
          const shown = n.drop.showBeat === undefined ? 1 : Math.min(1, (nowBeat - n.drop.showBeat) / 0.5);
          if (shown <= 0) continue;
          if (n.jack && !n.head && front.get(n.jack.id) !== n) continue;
          if (n.revealT !== undefined && now < n.revealT) continue;
          const col = HUES[n.drop.hue];
          const appear = shown * (ap ? ap.a : D ? 1 : Math.min(1, (VIEW - (n.t - now)) / 0.3) * (n.revealT !== undefined ? Math.min(1, (now - n.revealT) / 0.15) : 1));
          if (D && n.dur > 0 && n.tail === null && n.head !== 'miss') {
            // a hold coming to a standing ring trails its body back along the way it comes
            const R = ringR(n.drop, 0), [cx, cy] = ringC(n.drop, n.beat - n.drop.beat), a = n.ang + n.spin, sh = shape(a);
            const clampR = (v) => (D.dir > 0 ? Math.max(0, Math.min(R, v)) : Math.max(R, Math.min(R + 0.9, v)));
            const rh = clampR(ap ? ap.r : R), rt = clampR(R - D.dir * D.v * (n.beat + n.len - nowBeat));
            if (Math.abs(rh - rt) > 0.003) {
              const [hx, hy] = toScreen(cx + Math.cos(a) * rh * sh, cy + Math.sin(a) * rh * sh), [tx, ty] = toScreen(cx + Math.cos(a) * rt * sh, cy + Math.sin(a) * rt * sh);
              g.globalAlpha = appear; g.lineCap = 'round';
              g.strokeStyle = rgba(col, 0.3); g.lineWidth = r * 1.3; g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke();
              g.strokeStyle = rgba(col, 0.85); g.lineWidth = 2; g.stroke();
              g.globalAlpha = 1;
            }
          }
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
          const [x, y] = ap ? toScreen(...ap.p) : notePos(n, n.t);
          // fills from the centre as its ripple (or stone) closes in
          const k = Math.max(0, Math.min(1, 1 - (n.t - now) / VIEW));
          g.globalAlpha = appear;
          if (D) {
            // a note on its way to a standing ring runs along a lane from the centre to its spot on the ring
            const [cx, cy] = toScreen(...ringC(n.drop, n.beat - n.drop.beat)), [ex, ey] = notePos(n, n.t);
            g.strokeStyle = rgba(col, 0.28); g.lineWidth = 1.5;
            g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke();
            g.beginPath(); g.arc(ex, ey, r * 1.05, 0, TAU); g.stroke();
          } else if (!n.skip) {
            // faint thread back to the drop that will reach it, so you know which ring to watch
            g.setLineDash([2, 7]); g.lineWidth = 1.2;
            for (const d of n.cross ? [n.drop, n.cross] : [n.drop]) {
              const [fx, fy] = ringC(d, Math.max(0, nowBeat - d.beat));
              if (!onScreen(fx, fy)) continue;
              const [sx, sy] = toScreen(fx, fy);
              g.strokeStyle = rgba(HUES[d.hue], 0.22);
              g.beginPath(); g.moveTo(sx, sy); g.lineTo(x, y); g.stroke();
            }
            g.setLineDash([]);
          }
          g.fillStyle = rgba(INK, 0.75);
          g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
          g.fillStyle = rgba(col, 0.25 + 0.35 * k);
          g.beginPath(); g.arc(x, y, r * k, 0, TAU); g.fill();
          g.strokeStyle = rgba(col, 1); g.lineWidth = 3;
          g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
          if (n.partner && !n.partner.head && n.ang < n.partner.ang) {
            // the two points of a crossing pair, joined: strike both at once
            const [qx, qy] = notePos(n.partner, n.partner.t);
            g.strokeStyle = rgba(PAPER, 0.3 + 0.4 * k); g.lineWidth = 2; g.setLineDash([6, 6]);
            g.beginPath(); g.moveTo(x, y); g.lineTo(qx, qy); g.stroke();
            g.setLineDash([]);
          }
          if (n.chord && n.group.find((m) => !m.head) === n) {
            // a chord: its notes joined round the ring, struck all at once
            const pts = n.group.filter((m) => !m.head).sort((p, q) => p.ang - q.ang).map(shownPos);
            g.strokeStyle = rgba(PAPER, 0.35 + 0.45 * k); g.lineWidth = 2.5; g.setLineDash([7, 5]);
            g.beginPath(); pts.forEach(([px, py], q) => (q ? g.lineTo(px, py) : g.moveTo(px, py)));
            if (pts.length > 2) g.closePath();
            g.stroke(); g.setLineDash([]);
          }
          if (n.chord) {
            // and each wears a second ring
            g.strokeStyle = rgba(PAPER, 0.85); g.lineWidth = 2;
            g.beginPath(); g.arc(x, y, r * 1.25, 0, TAU); g.stroke();
          }
          const num = kit.order() && n.order;
          if (n.cross) {
            // a crossing: the other ring's colour outside, and a star of white light
            g.strokeStyle = rgba(HUES[n.cross.hue], 1); g.lineWidth = 3;
            g.beginPath(); g.arc(x, y, r * 1.28, 0, TAU); g.stroke();
            g.fillStyle = rgba(PAPER, num ? 0.3 : 0.95);
            g.beginPath();
            for (let q = 0; q < 8; q++) { const a = (q * TAU) / 8, rr = q % 2 ? r * 0.16 : r * (num ? 0.85 : 0.5 + 0.2 * k); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
            g.fill();
          } else if (n.jack) {
            // a pulse train: how many rings are still to come (pips round the rim when the order number is inside)
            const left = n.jack.n - n.jack.k;
            if (num) {
              g.fillStyle = rgba(PAPER, 0.95);
              for (let q = 0; q < left; q++) { const a = -TAU / 4 + (q * TAU) / Math.max(left, 6); g.beginPath(); g.arc(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3, Math.max(2, r * 0.13), 0, TAU); g.fill(); }
            } else {
              g.fillStyle = rgba(PAPER, 0.95); g.textAlign = 'center'; g.textBaseline = 'middle';
              g.font = `${Math.round(r * 0.8)}px "Dela Gothic One", sans-serif`;
              g.fillText(String(left), x, y + 1);
            }
          } else if (n.skip) {
            // a landing mark: four ticks around the ring
            g.lineWidth = 2;
            for (let q = 0; q < 4; q++) {
              const a = q * (TAU / 4) + TAU / 8;
              g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15); g.lineTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5); g.stroke();
            }
          } else if (n.dur > 0 && !(D && !n.spin)) {
            // a hold's head shows which way the light will travel (on the rim when the order number is inside)
            const [qx, qy] = notePos(n, timeOf(n.beat + Math.min(n.len, 0.25))), a = Math.atan2(qy - y, qx - x);
            const c0 = num ? r * 1.25 : 0, s0 = num ? 1.15 : 1;
            const ox = x + Math.cos(a) * c0, oy = y + Math.sin(a) * c0;
            g.fillStyle = rgba(PAPER, 0.9);
            g.beginPath(); g.moveTo(ox + Math.cos(a) * r * 0.55 * s0, oy + Math.sin(a) * r * 0.55 * s0);
            g.lineTo(ox + Math.cos(a + 2.4) * r * 0.4 * s0, oy + Math.sin(a + 2.4) * r * 0.4 * s0); g.lineTo(ox + Math.cos(a - 2.4) * r * 0.4 * s0, oy + Math.sin(a - 2.4) * r * 0.4 * s0);
            g.fill();
          }
          if (num) {
            // the order to strike in, counted afresh each bar; the next bar's numbers wait a little dimmer
            const later = next && n.bar !== next.bar;
            g.fillStyle = rgba(PAPER, later ? 0.55 : 1); g.textAlign = 'center'; g.textBaseline = 'middle';
            g.font = `${Math.round(r * (num > 9 ? 0.85 : 1.05))}px "Dela Gothic One", sans-serif`;
            g.lineWidth = 3; g.strokeStyle = rgba(INK, 0.6); g.lineJoin = 'round';
            g.strokeText(String(num), x, y + 1); g.fillText(String(num), x, y + 1);
          } else if ((n.dur === 0 || n.skip) && !n.cross && !n.jack) {
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

      // autoplay shows a fingertip gliding to the next note it will strike
      function drawAim(now, dt) {
        if (!S.auto) return;
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
        const r = noteR();
        g.fillStyle = rgba(PAPER, 0.18);
        g.beginPath(); g.arc(autoAim.x, autoAim.y, r * 0.9, 0, TAU); g.fill();
        g.strokeStyle = rgba(PAPER, 0.6); g.lineWidth = 1.5;
        g.beginPath(); g.arc(autoAim.x, autoAim.y, r * 0.9, 0, TAU); g.stroke();
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

      // a change of tempo is called out a moment before it comes, so the rings' new speed is no surprise
      // (drawn under the rings and notes, so it never hides one)
      function drawTempoCalls(now) {
        if (!def.tempo) return;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let i = 1; i < def.tempo.length; i++) {
          const [b, bpm, call] = def.tempo[i];
          if (!call) continue;
          const dt = now - timeOf(b + 1e-6);
          if (dt < -0.9 || dt > 0.9) continue;
          const up = bpm > def.tempo[i - 1][1], u = (dt + 0.9) / 1.8;
          g.globalAlpha = Math.min(1, Math.sin(Math.PI * u) * 1.6) * 0.85;
          g.fillStyle = rgba(up ? ACCENT : HUES[0], 1);
          g.font = `${Math.round(Math.min(30, W * 0.06))}px "Dela Gothic One", sans-serif`;
          g.fillText(`${up ? '▲' : '▼'} BPM ${typeof call === 'string' ? call : bpm}`, F.cx, F.cy + (F.portrait ? 0.8 : 0.48) * F.u * 0.86);
          g.globalAlpha = 1;
        }
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

      const leadMidi = def.audioFile ? null : def.song.leadMidi || ((n) => { const ch = CHORDS[Math.floor(n.beat / BPB) % CHORDS.length]; return ch.lead[n.idx % ch.lead.length]; });

      return {
        id: def.id, title: def.title, jp: def.jp, genre: def.genre, level: def.level, lede: def.lede, hues: def.hues,
        theme, attractFromBar: def.attractFromBar ?? 8, beatsPerBar: BPB, audioFile: def.audioFile,
        info: def.info, bpm: BPM, bpmLabel: def.bpmLabel, timeOf, beatOf, bpmAt: TM.bpmAt, varies: TM.varies, bars: def.bars, sections: SECTIONS, chords: CHORDS, chart: CHART,
        hitDist(n, x, y) { const [nx, ny] = notePos(n, n.t), d = Math.hypot(nx - x, ny - y); return d <= hitR() ? d : -1; },
        followPos: notePos,
        followReach: () => Math.max(48, noteR() * 3.4),
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
          const beat = beatOf(now), bar = Math.floor(beat / BPB), sec = secAt(beat);
          nowBeat = beat;
          ctx.now = now; ctx.beat = beat; ctx.bar = bar; ctx.sec = sec; ctx.dt = dt;
          ctx.pulse = def.pulse ? def.pulse(beat) : kit.pulse(beat, def.kickOn ? def.kickOn(bar, sec.name) : true);
          if (now - lastNow < 0.25) {
            for (const d of DROPS) {
              if (d.t > now && !(d.closeT > lastNow)) { if (d.t > now + 40) break; continue; }
              // drops landing this frame splash; rings that close in burst at their centre
              if (d.t > lastNow && d.t <= now && d.speed > 0 && onScreen(d.x, d.y)) { const [sx, sy] = toScreen(d.x, d.y); burst(sx, sy, HUES[d.hue], d.small ? 0.35 : 0.5, 0.6); }
              if (d.closeT > lastNow && d.closeT <= now) { const [sx, sy] = toScreen(...ringC(d, d.closeOff)); burst(sx, sy, HUES[d.hue], 0.8, 0.9); }
            }
            // dark notes found by a reveal ring flash once
            for (let i = S.cursor; i < S.notes.length; i++) {
              const n = S.notes[i];
              if (n.t - now > 8) break;
              if (n.revealT > lastNow && n.revealT <= now) { const [sx, sy] = notePos(n, n.t); rings.push({ x: sx, y: sy, col: HUES[n.drop.hue], life: 0, max: 0.4, size: 0.6 }); }
            }
          }
          lastNow = now;
          g.save();
          if (shakeV > 0) g.translate((Math.random() - 0.5) * shakeV, (Math.random() - 0.5) * shakeV);
          // with the background scenery switched off, only the water, its rings and the notes are drawn
          const decor = kit.decor();
          drawBase(beat, ctx.pulse);
          if (decor && scene.back) scene.back(ctx);
          drawTempoCalls(now);
          drawRipples(now);
          if (decor && scene.surface) scene.surface(ctx);
          drawStones(now);
          drawNotes(now);
          drawEffects(dt);
          if (decor && scene.front) scene.front(ctx);
          drawAim(now, dt);
          drawBanners(now, beat);
          if (kit.playing()) drawPopups(now);
          g.restore();
          if (decor && scene.post) scene.post(ctx);
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
        debug: { notePos: (c, t) => notePos(kit.runOf(c) || c, t), fieldPos },
        onNewRun() {
          particles.length = 0; rings.length = 0; waves.length = 0; popups = [];
          autoAim.x = F.cx; autoAim.y = F.cy; lastNow = -Infinity; shakeV = 0; flashV = 0;
          if (scene.reset) scene.reset();
        },
      };
    });
  }
