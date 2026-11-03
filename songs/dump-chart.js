// Writes a song's chart as JSON for its composer: every note's beat, length, pitch and voice, plus the
// tempo map and the notes the chart leaves to the music.
// Run from the repo root with the page served (python3 -m http.server 8765), then:
//   node songs/dump-chart.js tokei > songs/tokei-notes.json
const { chromium } = require('playwright');
(async () => {
  const id = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`http://localhost:8765/index.html#${id}`);
  await p.waitForTimeout(500);
  const out = await p.evaluate((id) => {
    const m = window.__game.SONGS.find((s) => s.id === id), I = m.info;
    const notes = m.chart.map((c) => [+c.beat.toFixed(4), +(c.len || 0).toFixed(4), c.midi ?? null, I.voiceOf(c), c.chord ? 1 : 0]);
    return { id, t0: I.t0, tempo: I.tempo, stops: I.stops, bars: I.bars, ghosts: I.ghosts, sections: m.sections, notes };
  }, id);
  process.stdout.write(JSON.stringify(out));
  await b.close();
})();
