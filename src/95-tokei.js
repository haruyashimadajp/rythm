  // ---------------------------------------------------------------------
  //  09 TOKEI: a clock tower gone mad, reflected in black water.
  //  Hardcore whose tempo will not hold still: a music box winds up at
  //  126, runs away at 210, stops dead, ticks on a dial at 168 and 252,
  //  sinks to 84, rewinds, revs back up to 240 and 252, and strikes
  //  midnight at 63. Every ring lives in beats, so the rings speed up,
  //  slow down and freeze with the music (soflan).
  //  Chart rules, so every pattern can be read:
  //   - where it runs, a giant ring from off the field sweeps across it
  //     like a judgement line, and the melody sits along it like keys on
  //     a keyboard: the further right, the higher; the kick's chord stab
  //     is a row of three or four on the line
  //   - where it is quiet, a melody fans out from its drop like a polar
  //     score: the further out, the later; the further clockwise, the
  //     higher the pitch
  //   - other chord stabs are chords on one ring: 2, 3 or 4 notes it
  //     reaches at once (triangles and squares come from the augmented
  //     and diminished chords, which are symmetric themselves)
  //   - a drum roll is a jack on one spot; a hoover trill alternates
  //     two spots
  //   - on the dial, each pitch has its own hour (D at twelve, E at two,
  //     F at three ... C sharp at eleven), so a chromatic run goes once
  //     round the clock
  //  Scene: a giant clock face under the water whose hands and gears run
  //  on the beat (so they race, crawl, freeze and turn back with the
  //  tempo), a pendulum, cracks in the glass, and a grey world while time
  //  stands still.
  // ---------------------------------------------------------------------
  const TOKEI_TEMPO = [
    [0, 126],
    // the wind-up: a step faster every beat
    [32, 138], [33, 150], [34, 162], [35, 174], [36, 186], [37, 198], [38, 210, true],
    [104, 168, true], [120, 252, true], [136, 84, true],
    // the restart: revving back up
    [160, 105], [162, 140], [164, 180], [166, 210], [168, 240, true],
    // the gears grind, nearly stop, then tear loose
    [216, 120, true], [220, 160], [221, 200], [222, 252, true],
    [256, 63, true],
  ];
  const TOKEI_STOPS = [[104, 1.6], [222, 0.9]];
  const TOKEI_TM = tempoMap(TOKEI_TEMPO, TOKEI_STOPS);
  const tkLen = (b, beats) => TOKEI_TM.timeOf(b + beats) - TOKEI_TM.timeOf(b);
  // the clock's hands turn on the beat, but run backwards while the water rewinds (beats 152-160)
  const tkHands = (beat) => (beat < 152 ? beat : beat < 160 ? 152 - (beat - 152) * 2 : beat - 24);
  // chords, bar by bar
  const TK_CH = {
    Dm: { pad: [62, 65, 69, 74], bass: 38 }, Bb: { pad: [62, 65, 70, 74], bass: 34 }, C: { pad: [64, 67, 72, 76], bass: 36 },
    A: { pad: [61, 64, 69, 73], bass: 33 }, Gm: { pad: [62, 67, 70, 74], bass: 31 }, Daug: { pad: [62, 66, 70, 74], bass: 38 },
    Gaug: { pad: [63, 67, 71, 75], bass: 31 }, dim: { pad: [62, 65, 68, 71], bass: 38 }, dim2: { pad: [61, 64, 67, 70], bass: 37 },
  };
  const TK_CYCLE = ['Dm', 'Bb', 'C', 'A'];
  const TK_BARS = (() => {
    const B = [];
    for (let bar = 0; bar < 66; bar++) {
      let c;
      if (bar < 8) c = TK_CYCLE[bar % 4];
      else if (bar < 10) c = bar === 8 ? 'Dm' : 'A';
      else if (bar < 26) c = TK_CYCLE[(bar - 10) % 4];
      else if (bar < 34) c = ['Dm', 'Dm', 'A', 'Dm', 'Daug', 'Gaug', 'dim', 'dim2'][bar - 26];
      else if (bar < 40) c = ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'A'][bar - 34];
      else if (bar < 42) c = bar === 40 ? 'Dm' : 'A';
      else if (bar < 54) c = TK_CYCLE[(bar - 42) % 4];
      else if (bar < 56) c = bar === 54 ? 'Bb' : 'A';
      else if (bar < 64) c = TK_CYCLE[(bar - 56) % 4];
      else c = 'Dm';
      B.push(TK_CH[c]);
    }
    return B;
  })();
  // the theme, bar by bar: [8th step in the bar, midi, hold steps]
  const TK_A = [
    [[0, 69], [1, 74], [2, 77], [3, 76], [4, 74], [6, 69]],
    [[0, 70], [1, 74], [2, 79], [3, 77], [4, 76], [6, 74]],
    [[0, 72], [1, 76], [2, 79], [3, 77], [4, 76], [5, 74], [6, 72], [7, 76]],
    [[0, 73], [2, 76], [4, 81, 3]],
  ];
  const TK_B = [
    [[0, 74], [1, 77], [2, 81], [3, 79], [4, 77], [6, 76]],
    [[0, 74], [1, 77], [2, 82], [3, 81], [4, 79], [6, 77]],
    [[0, 76], [1, 79], [2, 84], [3, 82], [4, 81], [5, 79], [6, 77], [7, 76]],
    [[0, 76], [2, 73], [4, 69, 3]],
  ];
  // the dial: each pitch has its own hour (D at twelve)
  const tkHour = (midi) => ((midi - 62) % 12 + 12) % 12;
  // (the phone shows the field turned a quarter: field angle a appears at screen angle a + 90, so twelve
  // o'clock on screen is field angle -180)
  const tkHourAng = (h) => -180 + 30 * h;
  const TK_BELLS = new Set(); // beats of the midnight bells (the scene lights a numeral for each)
  const TK_GHOST = []; // melody notes the chart leaves to the music: [beat, midi, voice]

  rippleSong({
    id: 'tokei', title: 'TOKEI', jp: '狂い時計', genre: 'Hardcore（変速）', level: 10, bpmLabel: '63–252',
    lede: '狂った時計塔の<strong>ハードコア</strong>。テンポが何度も変わり、波紋は曲と一緒に<strong>速くなり、遅くなり、止まります</strong>（ソフラン）。メロディは音が高いほど時計回りに広がり、和音は<strong>3点・4点の同時押し</strong>、ドラムロールは<strong>連打</strong>。文字盤では<strong>判定の輪が止まり、ノーツが向かってきます</strong>。',
    theme: { ink: '#060509', ink2: '#1d1420', panel: 'rgba(6, 5, 9, 0.86)', paper: '#fff3df', muted: '#b9a68c', accent: '#ffc94d' },
    hues: ['#ffc94d', '#5ad8ff', '#ff4d6a', '#c08cff'],
    bpm: 126, tempo: TOKEI_TEMPO, stops: TOKEI_STOPS, bars: 66, speed: 0.1, attractFromBar: 10,
    // the music is a recording made by songs/tokei-compose.py from this very chart (beat 0 is 2 s in, after the key winds the clock)
    audioFile: { src: 'audio/tokei.mp3', t0: 2.0 },
    pulse: kickPulse(typeof TOKEI_KICKS === 'undefined' ? [] : TOKEI_KICKS),
    sections: [
      { bar: 0, name: 'WIND-UP', hue: 0 }, { bar: 8, name: 'ACCEL', hue: 1 }, { bar: 10, name: 'RUNAWAY', hue: 2 },
      { bar: 26, name: 'DIAL', hue: 1 }, { bar: 34, name: 'STILL WATER', hue: 3 }, { bar: 40, name: 'RESTART', hue: 0 },
      { bar: 42, name: 'LIMIT', hue: 2 }, { bar: 54, name: 'GRIND', hue: 3 }, { bar: 56, name: 'RUNAWAY II', hue: 2 },
      { bar: 64, name: 'MIDNIGHT', hue: 0 },
    ],
    chords: TK_BARS.slice(0, 4).map((c) => ({ ...c, lead: [74] })),
    kickOn: (bar, name) => !((name === 'WIND-UP' && bar < 4) || name === 'STILL WATER' || name === 'MIDNIGHT'),
    chart({ drop, skip, pulse, cross, B, chord, tap, dial }) {
      // ----- layouts -----
      // fan: a bar of melody spread from its drop like a polar score. Further out is later; further clockwise
      // is higher (the fan spans `span` degrees clockwise from angle `from`, the lowest note).
      // notes: [8th step, midi, hold steps]; the drop lands `lead` beats before the bar.
      function fan(beat, p, hue, notes, o = {}) {
        const step = o.step ?? 0.5, lead = o.lead ?? 1, lo = Math.min(...notes.map((n) => n[1])), hi = Math.max(...notes.map((n) => n[1]));
        const deg = hi > lo ? (o.span ?? 140) / (hi - lo) : 0, from = o.from ?? -160;
        const pre = Math.round(lead / step), end = Math.max(...notes.map(([q, , h]) => q + (h || 1)));
        const pat = Array(pre + end).fill('.');
        for (const [q, , h] of notes) { pat[pre + q] = h ? (o.spin ? 'S' : 'H') : 'o'; for (let k = 1; k < (h || 0); k++) pat[pre + q + k] = '-'; }
        return drop(beat - lead, p, hue, pat.join(''), { ...o, step, angs: notes.map(([, m]) => from + (m - lo) * deg), midi: notes.map(([, m]) => m) });
      }
      // sweep: a giant ring from far off the field crosses it like a judgement line, and the notes sit along
      // it like keys on a keyboard: higher to the right (or, on a sideways sweep, higher up).
      // notes: [8th step, midi, hold steps] or [8th step, [x...], ...] for a chord row at those places.
      const FAR = 3;
      function sweep(beat, dir, hue, notes, o = {}) {
        const v = o.v ?? 0.2, lead = o.lead ?? 0.5, vert = dir === 'up' || dir === 'down', edge = vert ? 0.44 : 0.78, sx = o.sx ?? (vert ? 0.05 : 0.034);
        // the line coming down sits a little to the left of the one going up, so where they turn their notes stay apart
        const xo = o.x ?? (dir === 'down' ? -0.1 : dir === 'up' ? 0.1 : 0);
        const C = { up: [xo, edge + FAR], down: [xo, -edge - FAR], right: [-edge - FAR, o.y ?? 0], left: [edge + FAR, o.y ?? 0] }[dir];
        const d = drop(beat - lead, C, hue, '', { speed: v, r0: FAR, show: 0.75 });
        const at = (b, across) => {
          // the angle from the centre to the point on the ring `across` from its middle
          const r = FAR + v * (b - beat + lead), k = Math.asin(Math.max(-1, Math.min(1, across / r)));
          return ({ up: -90 + k / DEG, down: 90 - k / DEG, right: -k / DEG, left: 180 + k / DEG })[dir];
        };
        for (const [q, m, h] of notes) {
          const b = beat + q * 0.5;
          if (Array.isArray(m)) { chord(b, d, m.map((x) => at(b, x - (vert ? xo : 0))), { midi: o.chordMidi || [62, 65, 69, 74].slice(0, m.length) }); continue; }
          // across the line: higher is further toward field -x, which the phone shows as further up
          tap(d, b, at(b, -(m - (o.mid ?? 77)) * sx), { midi: m, len: h ? h * 0.5 : 0 });
        }
        return d;
      }
      const ROW3 = [-0.45, 0, 0.45], ROW4 = [-0.5, -0.2, 0.2, 0.5];
      // a run of straight 8ths leaves its last 8th to the music, so the hand is free for the chord row that follows
      const free = (bar, beat) => bar.filter(([q, m]) => (q === 7 ? (TK_GHOST.push([beat + 3.5, m, 'saw']), false) : true));
      const tri = (rot) => [rot - 90, rot + 30, rot + 150];
      const sq = (rot) => [rot - 45, rot + 45, rot + 135, rot + 225];
      const quarters = (bar) => bar.filter(([q]) => q % 2 === 0);

      // ===== WIND-UP (126): the music box; the chart takes the quarter notes, fans swinging left and right =====
      // (the music box plays the 8ths in between)
      [...TK_A, ...TK_B.slice(0, 3)].forEach((bar, k) => bar.forEach(([q, m]) => { if (q % 2) TK_GHOST.push([B(k) + q / 2, m, 'box']); }));
      TK_A.forEach((bar, k) => fan(B(k), [k % 2 ? 0.32 : -0.32, 0.2], k % 4, quarters(bar).map(([q, m, h]) => (h ? [q / 2, m, 1] : [q / 2, m])), { step: 1, speed: 0.1, from: k % 2 ? -170 : -140, span: 120 }));
      TK_B.slice(0, 3).forEach((bar, k) => fan(B(4 + k), [[-0.3, -0.2], [0.3, 0.2], [-0.3, 0.2]][k], (k + 1) % 4, quarters(bar).map(([q, m]) => [q / 2, m]), { step: 1, speed: 0.1, from: [10, -170, -140][k], span: 120 }));
      {
        // the wind-up's last bar: a two-note chord, then the low A held while the key turns
        const d = drop(B(7) - 1, [0.25, 0.05], 0, '', {});
        chord(B(7), d, [-120, 60], { midi: [76, 73] });
        tap(d, B(7, 2), 160, { len: 1.5, midi: 69 });
      }

      // ===== ACCEL (138 -> 210): twelve notes round the clock, a step faster every beat =====
      {
        const d = drop(B(8) - 1, [0, 0.03], 1, '', { speed: 0.022, r0: 0.17 });
        const at = [0, 1, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5];
        at.forEach((b, h) => tap(d, B(8) + b, tkHourAng(h), { midi: 74 + h }));
      }

      // ===== RUNAWAY (210): four blocks of four bars; the line runs up, down, up, then a fill =====
      const block = (bar, k, theme) => {
        // bar 1: the stab on the kick is a row of three, then the melody; the line goes one way, back, and again
        sweep(B(bar), 'up', k % 4, [[0, ROW3], ...theme[0].slice(1)], { chordMidi: [62, 65, 69] });
        sweep(B(bar + 1), 'down', (k + 1) % 4, theme[1]);
        sweep(B(bar + 2), 'up', (k + 2) % 4, free(theme[2], B(bar + 2)));
        const b4 = B(bar + 3), h = (k + 3) % 4;
        if (k === 0) sweep(b4, 'down', h, theme[3].map(([q, m, hh]) => (hh ? [q, m, 1] : [q, m])));
        else if (k === 1) {
          // a hoover trill: two spots in turn, 16ths, then the chord they were trilling
          pulse(b4 - 1, [-0.25, -0.12], h, { n: 4, gap: 0.5, off: 1, a: -90, speed: 0.15, midi: 76 });
          pulse(b4 - 0.75, [-0.1, -0.12], (h + 1) % 4, { n: 4, gap: 0.5, off: 1, a: -90, speed: 0.15, midi: 73 });
          const d = drop(b4 + 1.5, [-0.15, 0.05], h, '', { speed: 0.13 });
          chord(b4 + 2.5, d, tri(0), { midi: [69, 73, 76] });
        } else if (k === 2) {
          // a snare roll: six 16ths on one spot, then two rings crossing
          pulse(b4 - 1, [-0.15, -0.15], h, { n: 6, gap: 0.25, off: 1, a: -90, speed: 0.12, midi: 0 });
          const A = drop(b4 + 0.5, [-0.28, -0.15], (h + 1) % 4, '', { speed: 0.12 }), C = drop(b4 + 0.5, [0.28, -0.15], (h + 2) % 4, '', { speed: 0.12 });
          cross(b4 + 3, A, C);
        } else {
          // a diminished stab (a square), then a 16th run round the same ring, and a breath before time stops
          const d = drop(b4 - 1.5, [0.4, 0], h, '', { speed: 0.1 });
          chord(b4, d, sq(45), { midi: [61, 64, 67, 70] });
          [0, 1, 2, 3, 4, 5].forEach((q) => tap(d, b4 + 1 + q * 0.25, -60 + q * 24, { midi: [73, 74, 76, 77, 79, 81][q] }));
        }
      };
      block(10, 0, TK_A); block(14, 1, TK_B); block(18, 2, TK_A); block(22, 3, TK_B);
      {
        // the last hit before time stops: a D minor square
        const d = drop(B(26) - 1, [0, 0.02], 2, '', { speed: 0.3 });
        chord(B(26), d, sq(0), { midi: [62, 69, 74, 77] });
      }

      // ===== DIAL (168, then 252): the ring stands still and the notes come to it =====
      {
        const D1 = dial(B(25, 3), [0, 0.02], 1, 0.32, { v: 0.32 / 3, dir: 1 });
        const on = (d, beat, midi, o) => tap(d, beat, tkHourAng(tkHour(midi)), { ...o, midi });
        const ch = (d, beat, midis) => chord(beat, d, midis.map((m) => tkHourAng(tkHour(m))), { midi: midis });
        [[106, 74], [106.5, 76], [107, 77], [107.5, 76]].forEach(([b, m]) => on(D1, b, m));
        ch(D1, 108, [74, 77, 81]);
        [[109, 72], [109.5, 74], [110, 76], [111, 77], [111.5, 79]].forEach(([b, m]) => on(D1, b, m));
        ch(D1, 112, [69, 73, 76]);
        [[113, 81], [113.5, 79], [114, 77], [114.5, 76], [115, 74], [115.5, 73]].forEach(([b, m]) => on(D1, b, m));
        // the hand sweeps from twelve to three
        on(D1, 116, 74, { len: 2, spin: 90 });
        [[118.5, 79], [119, 81], [119.5, 82]].forEach(([b, m]) => on(D1, b, m));
        // 252: now they rush in from outside. Augmented triads are triangles, diminished sevenths squares,
        // and a chromatic run goes once round the clock
        const D2 = dial(B(29, 2), [0, 0.02], 3, 0.32, { v: 0.3, dir: -1 });
        ch(D2, 120, [74, 78, 82]);
        [75, 76, 77, 78, 79, 80].forEach((m, q) => on(D2, 121 + q * 0.5, m));
        ch(D2, 124, [79, 83, 87]);
        [80, 81, 82, 83, 84, 85].forEach((m, q) => on(D2, 125 + q * 0.5, m));
        ch(D2, 128, [74, 77, 80, 83]);
        [81, 82, 81, 82, 81, 82].forEach((m, q) => on(D2, 129 + q * 0.5, m));
        ch(D2, 132, [73, 76, 79, 82]);
        on(D2, 133, 74, { len: 2, spin: -90 });
      }

      // ===== STILL WATER (84): slow rings, long holds; then the water rewinds =====
      fan(B(34), [-0.1, 0.2], 3, [[0, 69], [2, 74, 3], [6, 77]], { from: -150, span: 120, speed: 0.1 });
      fan(B(35), [0.3, 0.12], 0, [[0, 76], [2, 74], [4, 72, 3]], { from: -40, span: 50, speed: 0.1, spin: -140 });
      {
        // two rings, one note each, then they cross
        const A = drop(B(36) - 0.5, [-0.25, 0.05], 1, '.o', { a: -90, speed: 0.1, midi: [74] });
        const C = drop(B(36) - 0.5, [0.25, 0.05], 2, '...o', { a: -90, speed: 0.1, midi: [77] });
        cross(B(36, 2.5), A, C);
      }
      fan(B(37), [0, 0.2], 2, [[0, 77], [2, 76], [4, 74], [6, 73]], { from: -150, span: 120, speed: 0.1 });
      // rewind: rings that close in, and a hold drawn back into the centre
      drop(B(38) - 0.5, [-0.05, 0.06], 3, '.o.o.o.o', { speed: -0.09, r0: 0.4, a: 200, turn: 40, midi: [81, 77, 74, 69] });
      drop(B(39) - 0.5, [0.05, 0.04], 1, '.o.H---', { speed: -0.1, r0: 0.38, a: -20, turn: -50, midi: [73, 74] });

      // ===== RESTART (105 -> 240): one spot struck every beat while the clock revs =====
      pulse(B(40) - 1, [0, 0.03], 0, { n: 8, gap: 1, off: 1, a: -90, speed: 0.15, midi: [50, 50, 53, 53, 57, 57, 61, 62] });

      // ===== LIMIT (240): three blocks; the line runs up, across, up, then a fill =====
      const limit = (bar, j, theme) => {
        sweep(B(bar), 'up', (j + 2) % 4, [[0, ROW4], ...theme[0].slice(1)], { chordMidi: [62, 65, 68, 71] });
        sweep(B(bar + 1), 'down', (j + 3) % 4, theme[1]);
        if (j === 1) skip(B(bar + 2), [0.3, 0.38], [0.62, -0.3], j % 4, 'oooooooo', { midi: theme[2].map((n) => n[1]) });
        else sweep(B(bar + 2), 'up', j % 4, free(theme[2], B(bar + 2)));
        const b4 = B(bar + 3), h = (j + 1) % 4;
        if (j === 0) {
          // an 8th trill between two spots, then a triangle
          pulse(b4 - 1, [0.22, -0.4], h, { n: 3, gap: 1, off: 1, a: 90, speed: 0.15, midi: 76 });
          pulse(b4 - 0.5, [0.38, -0.4], (h + 1) % 4, { n: 3, gap: 1, off: 1, a: 90, speed: 0.15, midi: 73 });
          const d = drop(b4 + 2, [0.45, 0.05], h, '', { speed: 0.14 });
          chord(b4 + 3, d, tri(0), { midi: [69, 73, 76] });
        } else if (j === 1) {
          // a snare roll, then pairs
          pulse(b4 - 1, [0.57, -0.3], h, { n: 6, gap: 0.25, off: 1, a: 180, speed: 0.12, midi: 0 });
          const d = drop(b4 + 1, [0.2, -0.15], h, '', { speed: 0.15 });
          chord(b4 + 2, d, [-90, 90], { midi: [76, 69] });
          chord(b4 + 3, d, [-60, 120], { midi: [73, 69] });
        } else {
          // stomps: triangle, triangle turned over, then the square
          const d = drop(b4 - 1, [0.3, -0.03], h, '', { speed: 0.15 });
          chord(b4, d, tri(180), { midi: [69, 73, 76] });
          chord(b4 + 1, d, tri(0), { midi: [69, 73, 76] });
          chord(b4 + 2, d, sq(0), { midi: [61, 64, 67, 70] });
        }
      };
      limit(42, 0, TK_B); limit(46, 1, TK_A); limit(50, 2, TK_B);

      // ===== GRIND (120, then 160, 200, a stop, 252) =====
      drop(B(54) - 1, [0, 0.15], 3, '..o.o.o.o.', { a: -120, turn: 50, speed: 0.14, midi: [62, 61, 60, 59] });
      {
        const d = drop(B(55) - 1, [0, 0], 2, '..oooo', { a: 160, turn: 60, speed: 0.1, midi: [69, 70, 72, 73] });
        chord(B(55, 2), d, tri(0), { midi: [62, 66, 70] });
        tap(d, B(55, 2.5), 165, { midi: 74 });
        tap(d, B(55, 3), 140, { midi: 76 });
        tap(d, B(55, 3.5), 115, { midi: 77 });
      }

      // ===== RUNAWAY II (252): the whole theme, the line bouncing up and down, a chord row on every bar =====
      [...TK_A, ...TK_B].forEach((bar, k) => {
        const b = B(56 + k);
        if (k === 7) {
          // the end: A major, then turned over, then the square
          const d = drop(b - 1, [-0.25, -0.1], 0, '', { speed: 0.12 });
          chord(b, d, tri(0), { midi: [69, 73, 76] });
          chord(b + 1, d, tri(240), { midi: [69, 73, 76] });
          chord(b + 2, d, sq(0), { midi: [61, 64, 67, 70] });
          return;
        }
        const four = k % 2 === 1;
        if (k % 4 === 2) bar = free(bar, b);
        sweep(b, k % 2 ? 'down' : 'up', k % 4, [[0, four ? ROW4 : ROW3], ...bar.slice(1).map(([q, m, h]) => (h ? [q, m, 2] : [q, m]))], { chordMidi: four ? [62, 65, 68, 71] : [62, 65, 69], sx: 0.042, x: k % 2 ? -0.1 : 0.1 });
      });

      // ===== MIDNIGHT (63): twelve bells round the dial, one for every hour, then the last chord at twelve =====
      {
        const D = dial(B(63, 2), [0, 0.02], 0, 0.32, { v: 0.32 / 2, dir: 1 });
        [86, 84, 82, 81, 79, 77, 76, 74, 73, 74, 77, 81].forEach((m, i) => { tap(D, B(64) + i / 3, tkHourAng(i + 1), { midi: m }); TK_BELLS.add(B(64) + i / 3); });
        chord(B(65), D, [-90, 0, 90, 180], { midi: [62, 69, 74, 77] });
      }
    },
    song: { arrange() {} },
    // what songs/tokei-compose.py needs to write the music around the chart: every note sounds as the
    // instrument voiceOf picks, and the notes the chart leaves out (ghosts) are played too
    info: {
      tempo: TOKEI_TEMPO, stops: TOKEI_STOPS, t0: 2.0,
      bars: TK_BARS.map((c) => [c.pad, c.bass]),
      ghosts: TK_GHOST,
      voiceOf(n) {
        if (n.midi === 0) return 'roll';
        const bar = Math.floor(n.beat / 4);
        if (bar >= 64) return 'bell';
        if (bar < 10) return 'box';
        if (bar >= 34 && bar < 40) return 'piano';
        if (bar >= 26 && bar < 34) return n.chord ? 'chimestab' : 'chime';
        if (bar >= 40 && bar < 42) return 'hoov';
        return n.chord || n.jack ? 'hoov' : 'saw';
      },
    },
    scene(kit, f) {
      const { g, rgba, hex, hash, TAU } = kit;
      const BRASS = hex('#ffc94d'), STEEL = hex('#7d8aa0'), RED = hex('#ff4d6a'), PAPER = f.PAPER;
      const NUM = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
      // gears in the deep: [x, y (field units), radius, teeth, turns per bar]
      const GEARS = [[-0.78, -0.38, 0.26, 18, 0.25], [-0.42, -0.5, 0.15, 11, -0.42], [0.8, 0.36, 0.3, 20, -0.22], [0.47, 0.5, 0.14, 10, 0.47], [0.86, -0.4, 0.18, 12, 0.3], [-0.86, 0.42, 0.17, 12, -0.3]];
      let lit = new Map(), cracks = [], lastStomp = -1, lastBlock = -1;
      const gearPath = (cx, cy, R, teeth, rot) => {
        g.beginPath();
        for (let i = 0; i <= teeth * 4; i++) {
          const a = rot + (i / (teeth * 4)) * TAU, q = i % 4, r = q === 1 || q === 2 ? R * 1.12 : R;
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          if (i) g.lineTo(x, y); else g.moveTo(x, y);
        }
        g.closePath();
      };
      // the clock face the whole field sits on
      function clock(c) {
        const { F } = f, [cx, cy] = f.toScreen(0, 0.02), R = F.u * 0.62;
        const midnight = c.sec.name === 'MIDNIGHT';
        g.strokeStyle = rgba(BRASS, 0.13 + 0.06 * c.pulse); g.lineWidth = 2;
        g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();
        g.beginPath(); g.arc(cx, cy, R * 1.08, 0, TAU); g.stroke();
        for (let i = 0; i < 60; i++) {
          const a = (i / 60) * TAU, l = i % 5 ? 0.03 : 0.07;
          g.strokeStyle = rgba(BRASS, i % 5 ? 0.1 : 0.22); g.lineWidth = i % 5 ? 1 : 2.5;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a) * R * (1 - l), cy + Math.sin(a) * R * (1 - l)); g.stroke();
        }
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = `${Math.round(F.u * 0.05)}px "Dela Gothic One", serif`;
        for (let h = 0; h < 12; h++) {
          const a = -Math.PI / 2 + (h * TAU) / 12, L = lit.get(h) || 0, glow = L ? Math.max(0, 1 - (c.now - L) / 1.2) : 0;
          g.fillStyle = rgba(glow > 0 || (midnight && L) ? mixC(BRASS, PAPER, glow) : BRASS, midnight && L ? 0.55 + 0.45 * glow : 0.16);
          g.fillText(NUM[h], cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86);
        }
        // the hands run on the beat: a turn of the minute hand every four bars
        let hb = tkHands(c.beat);
        if (midnight) { const u = Math.min(1, Math.max(0, (c.beat - 256) / 4)); const tgt = Math.ceil(hb / 16) * 16; hb = hb + (tgt - hb) * u * u; }
        const minute = -Math.PI / 2 + (hb / 16) * TAU, hour = -Math.PI / 2 + (hb / 192) * TAU;
        g.lineCap = 'round';
        for (const [a, len, w, al] of [[hour, 0.55, 7, 0.32], [minute, 0.82, 4, 0.36]]) {
          g.strokeStyle = rgba(BRASS, al); g.lineWidth = w;
          g.beginPath(); g.moveTo(cx - Math.cos(a) * R * 0.1, cy - Math.sin(a) * R * 0.1); g.lineTo(cx + Math.cos(a) * R * len, cy + Math.sin(a) * R * len); g.stroke();
        }
        // a seconds hand that ticks with each beat
        const sec = -Math.PI / 2 + (Math.floor(hb) / 60 + Math.min(1, (hb % 1) * 8) / 60) * TAU;
        g.strokeStyle = rgba(RED, 0.4); g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sec) * R * 0.92, cy + Math.sin(sec) * R * 0.92); g.stroke();
        g.fillStyle = rgba(BRASS, 0.4); g.beginPath(); g.arc(cx, cy, 5, 0, TAU); g.fill();
      }
      const mixC = (a, b, k) => kit.mix(a, b, Math.max(0, Math.min(1, k)));
      return {
        back(c) {
          const { F } = f;
          const hb = tkHands(c.beat);
          // gears, meshing, all turning on the beat
          for (const [x, y, r, teeth, turns] of GEARS) {
            const [sx, sy] = f.toScreen(x, y), R = r * F.u;
            gearPath(sx, sy, R, teeth, (hb / 4) * turns * TAU);
            g.fillStyle = rgba(STEEL, 0.05); g.fill();
            g.strokeStyle = rgba(STEEL, 0.2 + 0.1 * c.pulse); g.lineWidth = 1.5; g.stroke();
            g.beginPath(); g.arc(sx, sy, R * 0.25, 0, TAU); g.stroke();
            for (let k = 0; k < 4; k++) { const a = (hb / 4) * turns * TAU + (k * TAU) / 4; g.beginPath(); g.moveTo(sx + Math.cos(a) * R * 0.25, sy + Math.sin(a) * R * 0.25); g.lineTo(sx + Math.cos(a) * R * 0.85, sy + Math.sin(a) * R * 0.85); g.stroke(); }
          }
          clock(c);
          // the pendulum swings once every two beats
          const px = F.cx, py = Math.max(10, F.cy - Math.min(f.W, f.H) * 0.62), sw = Math.sin(hb * Math.PI) * 0.4, Lp = F.u * 0.3;
          const bx = px + Math.sin(sw) * Lp, by = py + Math.cos(sw) * Lp;
          g.strokeStyle = rgba(BRASS, 0.25); g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(bx, by); g.stroke();
          g.fillStyle = rgba(BRASS, 0.22 + 0.15 * c.pulse); g.beginPath(); g.arc(bx, by, F.u * 0.035, 0, TAU); g.fill();
          // the hardest parts glow red at the edges with every kick
          if (c.sec.name === 'LIMIT' || c.sec.name === 'RUNAWAY II') {
            const v = g.createRadialGradient(F.cx, F.cy, F.u * 0.4, F.cx, F.cy, Math.hypot(f.W, f.H) * 0.6);
            v.addColorStop(0, rgba(RED, 0)); v.addColorStop(1, rgba(RED, 0.1 + 0.16 * c.pulse));
            g.fillStyle = v; g.fillRect(0, 0, f.W, f.H);
          }
        },
        front(c) {
          const { F } = f, name = c.sec.name;
          // speed lines while the tempo climbs
          const bpm = f.bpmAt(c.beat), prev = f.bpmAt(c.beat - 1.5);
          if (bpm > prev + 5 && !kit.reduceMotion) {
            const k = Math.min(1, (bpm - prev) / 40);
            g.strokeStyle = rgba(PAPER, 0.12 * k); g.lineWidth = 1.5;
            g.beginPath();
            for (let i = 0; i < 40; i++) {
              const a = hash(i) * TAU, r0 = F.u * (0.5 + ((c.now * 3 + hash(i + 50)) % 1) * 0.6);
              g.moveTo(F.cx + Math.cos(a) * r0, F.cy + Math.sin(a) * r0); g.lineTo(F.cx + Math.cos(a) * (r0 + F.u * 0.15), F.cy + Math.sin(a) * (r0 + F.u * 0.15));
            }
            g.stroke();
          }
          // cracks in the glass, one more with every block of the hardest parts
          const block = Math.floor(c.beat / 16);
          if ((name === 'LIMIT' || name === 'RUNAWAY II' || name === 'RUNAWAY') && block !== lastBlock && c.beat % 16 < 0.5) {
            lastBlock = block;
            const rnd = kit.mulberry32(block * 77 + 5), x = (rnd() - 0.5) * 1.3, y = (rnd() - 0.5) * 0.7, pts = [];
            for (let k = 0; k < 6; k++) { const a = rnd() * TAU; let px = x, py = y; const line = [[px, py]]; for (let s = 0; s < 4; s++) { px += Math.cos(a + (rnd() - 0.5)) * 0.08; py += Math.sin(a + (rnd() - 0.5)) * 0.08; line.push([px, py]); } pts.push(line); }
            cracks.push(pts);
            f.shake(10);
          }
          if (cracks.length && name !== 'STILL WATER' && name !== 'MIDNIGHT') {
            g.strokeStyle = rgba(PAPER, 0.22); g.lineWidth = 1.2;
            for (const pts of cracks) for (const line of pts) { g.beginPath(); line.forEach(([x, y], q) => { const [sx, sy] = f.toScreen(x, y); if (q) g.lineTo(sx, sy); else g.moveTo(sx, sy); }); g.stroke(); }
          }
          // the kicks shake the screen in the hardest parts
          const beat = Math.floor(c.beat);
          if ((name === 'LIMIT' || name === 'RUNAWAY II') && beat !== lastStomp && c.beat - beat < 0.08) { lastStomp = beat; f.shake(beat % 4 === 0 ? 7 : 3); }
          // time stands still
          if (f.stopped(c.now)) {
            g.fillStyle = rgba(PAPER, 0.85); g.textAlign = 'center'; g.textBaseline = 'middle';
            g.font = `${Math.round(Math.min(44, f.W * 0.08))}px "Dela Gothic One", sans-serif`;
            if (g.letterSpacing !== undefined) g.letterSpacing = '12px';
            g.fillText('時間停止', F.cx, F.cy - F.u * 0.3);
            if (g.letterSpacing !== undefined) g.letterSpacing = '0px';
          }
        },
        post(c) {
          if (!f.stopped(c.now)) return;
          // the world goes grey while the clock is stopped
          g.globalCompositeOperation = 'saturation';
          g.fillStyle = '#808080'; g.fillRect(0, 0, f.W, f.H);
          g.globalCompositeOperation = 'source-over';
          g.fillStyle = 'rgba(40, 60, 90, 0.18)'; g.fillRect(0, 0, f.W, f.H);
        },
        hit(c, n, grade, x, y) {
          if (grade === 'miss') return;
          if (TK_BELLS.has(n.beat)) { lit.set((Math.round((n.beat - 256) * 3) + 1) % 12, c.now); f.flash(0.12, BRASS); }
          if (n.chord && n.group && n.group.every((m) => m.head)) { f.flash(0.18, n.group.length >= 4 ? RED : BRASS); f.shake(n.group.length * 2); }
          if (n.beat === 260 && n.chord) { f.flash(0.6, PAPER); for (let h = 0; h < 12; h++) lit.set(h, c.now); }
        },
        reset() { lit = new Map(); cracks = []; lastStomp = -1; lastBlock = -1; },
      };
    },
  });
