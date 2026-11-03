"""TOKEI 狂い時計 — composes and renders the music for MINAMO's ninth song.

A hardcore track whose tempo will not hold still: a music box winds up at 126, the clock runs away
at 210, time stops dead, a dial ticks at 168 and 252, the water sinks to 84 and rewinds, the clock
revs back up to 240, grinds, freezes, tears loose at 252 (with runs of 16ths), climbs a step every beat
to an overclocked 320, and strikes midnight at 63. D minor.

The notes of the chart are the song's own notes: songs/tokei-notes.json (written from the chart by
songs/dump-chart.js) gives every note's beat, length, pitch and instrument, and this program plays
each of them on that instrument, then writes the rest of the band around them (drums, bass, chords,
pads, counter-lines, clocks and effects) on the same tempo map, so every note in the game is a sound
you hear at that moment.

Run (from the repo root, needs numpy + scipy + ffmpeg):
  python3 -m http.server 8765 &   node songs/dump-chart.js tokei > songs/tokei-notes.json
  python3 songs/tokei-compose.py
Writes audio/tokei.mp3 (beat 0 at t = 2 s, after the key winds the clock) and src/94-tokei-score.js (the kick beats, for the
water's pulse).
"""
import json
import os
import subprocess
import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
D = json.load(open(os.path.join(HERE, 'tokei-notes.json')))
SR = 44100
T0 = D['t0']
rng = np.random.default_rng(1909)

# ---------------------------------------------------------------- the tempo map (same as the game's)
def build_tempo(tempo, stops):
    ev = [(b, 'bpm', bpm) for b, bpm, *_ in tempo[1:]] + [(b, 'stop', s) for b, s in stops]
    ev.sort(key=lambda e: (e[0], 0 if e[1] == 'stop' else 1))
    b, t, spb = 0.0, 0.0, 60 / tempo[0][1]
    P = [dict(b=0.0, t=0.0, spb=spb, stop=False)]
    for eb, kind, v in ev:
        t += (eb - b) * spb; b = eb
        if kind == 'stop':
            P.append(dict(b=b, t=t + v, spb=spb, stop=True, frm=t)); t += v
        else:
            spb = 60 / v; P.append(dict(b=b, t=t, spb=spb, stop=False))
    return P
PIECES = build_tempo(D['tempo'], D['stops'])
def song_time(beat):
    p = PIECES[0]
    for q in PIECES:
        if (q['b'] < beat) if q['stop'] else (q['b'] <= beat): p = q
        else: break
    return p['t'] + (beat - p['b']) * p['spb']
def bt(b): return T0 + song_time(b)                     # beat -> seconds in the file
def blen(b, n): return bt(b + n) - bt(b)                # seconds of n beats from beat b
def bpm_at(b):
    p = PIECES[0]
    for q in PIECES:
        if (q['b'] < b) if q['stop'] else (q['b'] <= b): p = q
        else: break
    return 60 / p['spb']
END_BEAT = 296
MID = 288                   # midnight: the first bell
N = int((bt(END_BEAT) + 7.0) * SR)

def mtof(m): return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)

# ---------------------------------------------------------------- buses
class Bus:
    def __init__(self):
        self.L = np.zeros(N, np.float32); self.R = np.zeros(N, np.float32)
    def add(self, t, sig, gain=1.0, pan=0.0):
        """mono signal, or a (2, n) stereo one"""
        i = int(round(t * SR))
        if i >= N or sig.shape[-1] == 0: return
        if i < 0: sig = sig[..., -i:]; i = 0
        n = min(sig.shape[-1], N - i)
        if sig.ndim == 1:
            l = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); r = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
            self.L[i:i + n] += (sig[:n] * l).astype(np.float32); self.R[i:i + n] += (sig[:n] * r).astype(np.float32)
        else:
            self.L[i:i + n] += (sig[0, :n] * gain).astype(np.float32); self.R[i:i + n] += (sig[1, :n] * gain).astype(np.float32)
    def stereo(self): return np.vstack([self.L, self.R])

drums, bass, pads, lead, keys, bells, fxb, ticks = (Bus() for _ in range(8))

# ---------------------------------------------------------------- oscillators and filters
def tvec(d): return np.arange(max(1, int(d * SR))) / SR
def noise(d): return rng.standard_normal(max(1, int(d * SR)))
def lp(x, fc, o=2):
    if np.ndim(fc): return sweep_lp(x, fc)          # a cutoff that moves (one value per sample)
    return signal.sosfilt(signal.butter(o, min(fc, SR * 0.45), 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'), x)
def polyblep(ph, dt):
    out = np.zeros_like(ph)
    m = ph < dt; x = ph[m] / dt[m]; out[m] = x + x - x * x - 1
    m = ph > 1 - dt; x = (ph[m] - 1) / dt[m]; out[m] = x * x + x + x + 1
    return out
def _freq(f, n): return np.broadcast_to(np.asarray(f, float), (n,)).copy() if np.ndim(f) else np.full(n, float(f))
def saw(f, dur):
    n = max(1, int(dur * SR)); f = _freq(f, n); dt = f / SR
    ph = (np.cumsum(dt) + rng.random()) % 1.0
    return (2 * ph - 1) - polyblep(ph, dt)
def square(f, dur, pw=0.5):
    n = max(1, int(dur * SR)); f = _freq(f, n); dt = f / SR
    ph = (np.cumsum(dt) + rng.random()) % 1.0
    s = np.where(ph < pw, 1.0, -1.0)
    s += polyblep(ph, dt) - polyblep((ph + 1 - pw) % 1.0, dt)
    return s
def sine(f, dur, ph0=0.0):
    n = max(1, int(dur * SR)); f = _freq(f, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR + ph0)
def env(dur, a=0.004, r=0.04):
    tt = tvec(dur)
    return np.minimum(1, tt / max(a, 1e-4)) * np.clip((dur - tt) / max(r, 1e-4), 0, 1)
def sweep_lp(x, fc):
    out = np.zeros_like(x); zi = None; blk = 256
    for i in range(0, len(x), blk):
        sos = signal.butter(2, float(np.clip(fc[min(i, len(fc) - 1)], 40, SR * 0.45)), 'low', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        out[i:i + blk], zi = signal.sosfilt(sos, x[i:i + blk], zi=zi)
    return out
def pad_to(x, n): return np.pad(x, (0, max(0, n - len(x))))[:n]

# ---------------------------------------------------------------- instruments
def music_box(m, ring=1.6):
    """a comb tine: the fundamental rings, the bar's inharmonic partials die fast, a tiny pluck on top"""
    f = float(mtof(m)); d = ring * (1.3 if m < 72 else 1.0)
    tt = tvec(d)
    s = np.sin(2 * np.pi * f * tt) * np.exp(-tt / (d * 0.32))
    s += 0.28 * np.sin(2 * np.pi * f * 2.756 * tt) * np.exp(-tt / 0.18)
    s += 0.09 * np.sin(2 * np.pi * f * 5.404 * tt) * np.exp(-tt / 0.05)
    s += 0.05 * np.sin(2 * np.pi * f * 8.9 * tt) * np.exp(-tt / 0.025)
    s[:int(0.003 * SR)] += hp(noise(0.003), 4000) * 0.3
    return s * np.minimum(1, tt / 0.001)

def chime(m, dur=0.0):
    """a clock chime: an FM bell, bright at the strike and mellowing as it rings"""
    f = float(mtof(m)); d = max(1.4, dur + 0.9); tt = tvec(d)
    idx = 3.2 * np.exp(-tt / 0.25) + 0.25
    s = np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * f * 3.5 * tt))
    s += 0.35 * np.sin(2 * np.pi * f * 2.0 * tt) * np.exp(-tt / 0.4)
    return s * np.exp(-tt / (0.55 + dur * 0.6)) * np.minimum(1, tt / 0.002)

def piano(m, dur, vel=0.8):
    """two strings per note, stretched partials, a hammer knock; the damper falls after `dur`"""
    f = float(mtof(m)); d = dur + 1.2; tt = tvec(d); B = 0.0004
    s = np.zeros_like(tt)
    for k in range(1, 11):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > SR * 0.42: break
        a = (1 / k ** 1.15) * (0.5 + 0.5 * vel) ** (k * 0.35)
        tau = (3.2 if m < 60 else 2.2) / (1 + 0.35 * k)
        for det in (-0.09, 0.09):
            s += 0.5 * a * np.sin(2 * np.pi * (fk + det) * tt + rng.random() * 6.28) * np.exp(-tt / tau)
    s[:int(0.012 * SR)] += lp(noise(0.012), 1800) * 0.25 * vel
    damp = np.where(tt < dur, 1.0, np.exp(-(tt - dur) / 0.25))
    return s * damp * np.minimum(1, tt / 0.002) * 0.45

def supersaw(m, dur, voices=7, spread=0.2, cut=(10000, 4500), drive=1.6, rel=0.06):
    """the lead: seven saws spread across the stereo field, a filter that closes after the attack"""
    tt = tvec(dur + rel); f = float(mtof(m))
    L = np.zeros_like(tt); R = np.zeros_like(tt)
    for i in range(voices):
        det = (i - (voices - 1) / 2) / ((voices - 1) / 2) * spread
        v = saw(f * 2 ** (det / 12), dur + rel)
        if i % 2: L += v
        else: R += v
        if i == voices // 2: L += v * 0.5; R += v * 0.5
    fc = cut[1] + (cut[0] - cut[1]) * np.exp(-tt / 0.09)
    e = env(dur + rel, 0.003, rel)
    out = [np.tanh(sweep_lp(x / voices * 2, fc) * drive) * e for x in (L, R)]
    sub = square(f / 2, dur + rel) * e * 0.12
    return np.vstack([out[0] + sub, out[1] + sub])

def hoover(m, dur, rel=0.08, bright=4800):
    """the hoover: detuned saws and a pulse that swoop down into the note, an octave of growl below"""
    tt = tvec(dur + rel)
    bend = 4 * np.exp(-tt / 0.035)
    f = mtof(m + bend)
    s = sum(saw(f * 2 ** (d / 12), dur + rel) for d in (-0.32, 0, 0.32)) / 3
    s += 0.6 * square(f / 2, dur + rel, 0.3 + 0.15 * np.sin(2 * np.pi * 3 * tt[0]))
    s = np.tanh(lp(s, bright, 2) * 2.4)
    s = s * env(dur + rel, 0.003, rel)
    return np.vstack([s, np.roll(s, int(0.011 * SR))])

def bell(m, ring=6.0):
    """a tower bell: hum, prime, minor-third tierce, quint, nominal and the shimmer above"""
    f = float(mtof(m)); tt = tvec(ring)
    parts = [(0.5, 0.35, 1.0), (1.0, 1.0, 0.7), (1.19, 0.45, 0.5), (1.5, 0.25, 0.42), (2.0, 0.55, 0.38), (2.52, 0.2, 0.25), (3.01, 0.14, 0.18), (4.17, 0.1, 0.1)]
    s = sum(a * np.sin(2 * np.pi * f * r * tt + rng.random() * 6.28) * np.exp(-tt / (ring * dk)) for r, a, dk in parts)
    s[:int(0.006 * SR)] += hp(noise(0.006), 2500) * 0.6
    return s * np.minimum(1, tt / 0.001) * 0.35

def gong(ring=7.0):
    tt = tvec(ring)
    s = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in [(55, 0.6, 4), (55 * 2.76, 0.25, 2.5), (55 * 5.4, 0.1, 1.2), (55 * 1.52, 0.2, 3)])
    swell = np.minimum(1, tt / 0.08) * (1 + 0.3 * np.exp(-((tt - 0.6) / 0.4) ** 2))
    return s * swell * 0.6

# drums
def hardkick(tail=0.28):
    tt = tvec(tail)
    f = 48 + 300 * np.exp(-tt / 0.016)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (tail * 0.55))
    s[:int(0.004 * SR)] += hp(noise(0.004), 3000) * 0.6
    return np.tanh(s * 6) * 0.8 * env(tail, 0.0005, 0.02)
def breakkick():
    tt = tvec(0.35)
    f = 50 + 110 * np.exp(-tt / 0.03)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.18) * 2.2)
def softkick():
    tt = tvec(0.4)
    f = 46 + 70 * np.exp(-tt / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.22)
def snare(tone=200, d=0.22):
    tt = tvec(d)
    body = np.sin(2 * np.pi * tone * tt) * np.exp(-tt / 0.035)
    return np.tanh((0.8 * body + bp(noise(d), 1500, 10000) * np.exp(-tt / 0.07)) * 1.8)
def clap():
    d = 0.3; s = np.zeros(int(d * SR)); tt = tvec(d)
    for k, a in ((0, 1.0), (0.011, 0.8), (0.022, 0.9)):
        i = int(k * SR); g = bp(noise(0.02), 900, 5000) * np.exp(-tvec(0.02) / 0.006)
        s[i:i + len(g)] += g * a
    s += bp(noise(d), 900, 4000) * np.exp(-tt / 0.08) * 0.6 * np.clip((tt - 0.025) / 0.005, 0, 1)
    return s
def hat(open_=False):
    d = 0.22 if open_ else 0.04
    return hp(noise(d), 7500) * np.exp(-tvec(d) / (0.07 if open_ else 0.012))
def ride():
    d = 0.9; tt = tvec(d)
    s = hp(noise(d), 5000) * np.exp(-tt / 0.35) * 0.5
    s += sum(np.sin(2 * np.pi * f * tt) for f in (3200, 4710, 5930)) * np.exp(-tt / 0.3) * 0.08
    return s
def crash(d=2.0): return hp(noise(d), 3500) * np.exp(-tvec(d) / 0.6)
def rev_crash(d): return (hp(noise(d), 3500) * np.exp(-tvec(d)[::-1] / (d * 0.35)))
def impact():
    tt = tvec(2.0)
    boom = np.sin(2 * np.pi * np.cumsum(32 + 90 * np.exp(-tt / 0.06)) / SR) * np.exp(-tt / 0.7)
    return np.tanh((boom + hp(noise(2.0), 300) * np.exp(-tt / 0.25) * 0.5) * 2.5)
def tick(tock=False):
    d = 0.05; tt = tvec(d); f = 1500 if tock else 2600
    s = bp(noise(d), f * 0.8, f * 1.6) * np.exp(-tt / 0.004) + 0.5 * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.012)
    return s
def ratchet(d):
    """a key winding the clock: clicks closer and closer"""
    s = np.zeros(int(d * SR)); t = 0.0; k = 0
    while t < d - 0.05:
        g = tick(k % 2 == 1) * 0.8; i = int(t * SR); s[i:i + len(g)] += g[:len(s) - i]
        t += 0.13 * (1 - 0.6 * t / d); k += 1
    return s
def gear(d):
    """gears grinding: a ratchet of metal clicks over a low grind"""
    s = np.zeros(int(d * SR)); t = 0.0; k = 0
    while t < d - 0.02:
        g = bp(noise(0.02), 1800 + 600 * (k % 3), 4000) * np.exp(-tvec(0.02) / 0.004)
        i = int(t * SR); s[i:i + len(g)] += g[:len(s) - i] * 0.8; t += 0.034; k += 1
    tt = tvec(d)
    grind = np.tanh(lp(saw(70 - 25 * tt / d, d), 500) * 3) * 0.35
    return s + grind * env(d, 0.05, 0.1)
def riser(d, up=True):
    tt = tvec(d); u = tt / d if up else 1 - tt / d
    nz = sweep_lp(hp(noise(d), 300), 400 + 9000 * u ** 2) * 0.6
    tone = saw(mtof(48 + 36 * u ** 1.5), d) * 0.25
    return (nz + lp(tone, 4000)) * (u ** 1.5 if up else (1 - u) ** 0.5) * env(d, 0.01, 0.02)
def sub_drop():
    tt = tvec(1.4)
    return np.sin(2 * np.pi * np.cumsum(30 + 70 * np.exp(-tt / 0.35)) / SR) * np.exp(-tt / 0.6)

# bass and pads
def gabber_bass(m, dur):
    tt = tvec(dur); f = float(mtof(m))
    s = np.tanh(lp(saw(f, dur) + 0.7 * square(f, dur), 900 + 1600 * np.exp(-tt / 0.03)) * 3) * 0.6 + 0.5 * np.sin(2 * np.pi * f * tt)
    return s * env(dur, 0.002, 0.02)
def reese(m, dur):
    tt = tvec(dur); f = float(mtof(m))
    s = sweep_lp(saw(f * 1.007, dur) + saw(f * 0.993, dur), 420 + 200 * np.sin(2 * np.pi * 0.5 * tt)) * 0.7 + 0.8 * np.sin(2 * np.pi * f * tt)
    return np.tanh(s * 1.4) * env(dur, 0.01, 0.06)
def pluck_bass(m, dur):
    tt = tvec(dur + 0.3); f = float(mtof(m))
    s = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) * np.exp(-tt / 0.08)
    return s * np.exp(-tt / 0.45) * env(dur + 0.3, 0.003, 0.1)
def strings(ms, dur, cut=2200, att=0.35):
    tt = tvec(dur + 0.6)
    L = np.zeros_like(tt); R = np.zeros_like(tt)
    for m in ms:
        f = float(mtof(m))
        for i, det in enumerate((-0.12, -0.04, 0.04, 0.12)):
            v = saw(f * 2 ** (det / 12) * (1 + 0.002 * np.sin(2 * np.pi * (4.5 + i) * tt)), dur + 0.6)
            if i % 2: L += v
            else: R += v
    e = np.minimum(1, tt / att) * np.clip((dur + 0.6 - tt) / 0.6, 0, 1)
    return np.vstack([lp(L, cut) * e, lp(R, cut) * e]) / (len(ms) * 2)
def choir(ms, dur, att=0.4):
    """a vowel-only choir: saws through the formants of 'ah'"""
    tt = tvec(dur + 0.8); out = np.zeros_like(tt)
    for m in ms:
        f = float(mtof(m))
        src = sum(saw(f * 2 ** (d / 12) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt + k)), dur + 0.8) for k, d in enumerate((-0.08, 0, 0.08)))
        out += bp(src, 650, 1000) * 1.0 + bp(src, 1050, 1300) * 0.6 + bp(src, 2500, 3100) * 0.25
    e = np.minimum(1, tt / att) * np.clip((dur + 0.8 - tt) / 0.8, 0, 1)
    out = out * e / max(1, len(ms))
    return np.vstack([out, np.roll(out, int(0.017 * SR))])
def gated_saws(ms, b0, beats, step=0.25):
    """trance-gated supersaw chord: on for the first 70% of every 16th"""
    d = blen(b0, beats); tt = tvec(d)
    L = np.zeros_like(tt); R = np.zeros_like(tt)
    for m in ms:
        st = supersaw(m, d, voices=5, spread=0.15, cut=(4200, 2400), drive=1.2, rel=0.01)
        L += pad_to(st[0], len(tt)); R += pad_to(st[1], len(tt))
    gate = np.zeros_like(tt); q = 0.0
    while q < beats - 1e-6:
        a = int((bt(b0 + q) - bt(b0)) * SR); z = int((bt(b0 + q + step * 0.7) - bt(b0)) * SR)
        gate[a:z] = 1; q += step
    gate = np.convolve(gate, np.ones(64) / 64, 'same')
    return np.vstack([L * gate, R * gate]) / len(ms)

# ---------------------------------------------------------------- the chart's notes, each on its instrument
kicks = []
def K(b, kind='hard', g=1.0):
    if kind == 'hard': drums.add(bt(b), hardkick(min(0.3, blen(b, 1) * 0.95)), 0.5 * g)
    elif kind == 'break': drums.add(bt(b), breakkick(), 0.6 * g)
    else: drums.add(bt(b), softkick(), 0.5 * g)
    kicks.append(round(b, 3))
def SN(b, g=1.0, pan=0.05): drums.add(bt(b), snare(), 0.34 * g, pan)
def CL(b, g=1.0): drums.add(bt(b), clap(), 0.3 * g, -0.05)
def HH(b, g=1.0, o=False): drums.add(bt(b), hat(o), (0.22 if o else 0.19) * g, 0.35)
def CR(b, g=1.0): drums.add(bt(b), crash(), 0.24 * g, -0.25)
def RD(b, g=1.0): drums.add(bt(b), ride(), 0.12 * g, 0.4)
def TK(b, tock=False, g=1.0): ticks.add(bt(b), tick(tock), 0.22 * g, 0.5 if tock else -0.5)

def gate_for(b, ln):
    """how long a short note sounds: most of the way to the next 8th, never long"""
    return max(0.09, min(blen(b, 0.5) * 0.85, 0.2)) if ln == 0 else blen(b, ln)

for beat, ln, m, voice, is_chord in D['notes']:
    t = bt(beat)
    if voice == 'roll':
        drums.add(t, snare(tone=215, d=0.18), 0.36, 0.1); continue
    if m is None: continue
    if voice == 'box':
        keys.add(t, music_box(m), 0.36, -0.15 + 0.3 * ((m % 12) / 12))
        if ln: keys.add(t + blen(beat, ln * 0.5), music_box(m, 1.2), 0.18, 0.1)
    elif voice == 'piano':
        keys.add(t, piano(m, max(0.5, blen(beat, ln) if ln else blen(beat, 1)), 0.8), 0.85, -0.1 + 0.2 * ((m - 60) / 24))
    elif voice in ('chime', 'chimestab'):
        keys.add(t, chime(m, blen(beat, ln) if ln else 0.0), 0.3 if voice == 'chime' else 0.26, 0.25 * np.sin(m))
        if voice == 'chimestab': lead.add(t, hoover(m - 12, 0.22), 0.2)
    elif voice == 'saw':
        lead.add(t, supersaw(m, gate_for(beat, ln)), 0.42)
        lead.add(t, supersaw(m + 12, gate_for(beat, ln), voices=3, cut=(12000, 6000)), 0.1)
    elif voice == 'hoov':
        lead.add(t, hoover(m, gate_for(beat, ln) + (0.08 if is_chord else 0)), 0.26 if is_chord else 0.32)
    elif voice == 'bell':
        bells.add(t, bell(m, 7.0 if beat >= MID + 4 else 5.0), 0.5 if beat >= MID + 4 else 0.42, 0.35 * np.sin(m * 1.3))
for beat, m, voice in D['ghosts']:
    if voice == 'box': keys.add(bt(beat), music_box(m, 1.3), 0.28, 0.15)
    else: lead.add(bt(beat), supersaw(m, gate_for(beat, 0)), 0.26)

# ---------------------------------------------------------------- the band, bar by bar
BARS = D['bars']                     # [[pad midis], bass midi] for every bar
def chord(bar): return BARS[bar][0]
def root(bar): return BARS[bar][1]
SEC = {s['name']: s['bar'] for s in D['sections']}

def hardcore_bar(bar, crash_every=4, first=None, hats16=True, gate=True):
    b0 = bar * 4
    for q in range(4): K(b0 + q)
    for q in range(4): bass.add(bt(b0 + q + 0.5), gabber_bass(root(bar) + 12, min(0.16, blen(b0 + q + 0.5, 0.45))), 0.34)
    CL(b0 + 1); CL(b0 + 3); SN(b0 + 1, 0.5); SN(b0 + 3, 0.5)
    for q in range(16 if hats16 else 8):
        HH(b0 + q * (0.25 if hats16 else 0.5), 0.55 if q % 2 else 0.95, o=(hats16 and q % 4 == 2))
    if first is not None and (bar - first) % crash_every == 0: CR(b0)
    if gate: pads.add(bt(b0), gated_saws([n + 12 for n in chord(bar)[:3]], b0, 4), 0.2)

def fill16(b0, beats=1.0, g0=0.4, g1=1.0):
    n = int(beats * 4)
    for k in range(n): SN(b0 + k * 0.25, g0 + (g1 - g0) * k / max(1, n - 1))

# WIND-UP (bars 0-7, 126): the key winds, the music box plays alone, then the beat steps in
fxb.add(bt(0) - 1.7, ratchet(1.6), 0.5)
for bar in range(8):
    b0 = bar * 4
    for q in range(8): TK(b0 + q * 0.5, q % 2 == 1, 1.0 if bar < 4 else 0.7)
    c = chord(bar)
    # the music box's left hand
    keys.add(bt(b0), music_box(c[0] - 12, 2.0), 0.2, -0.3); keys.add(bt(b0 + 2), music_box(c[2] - 12, 2.0), 0.16, -0.3)
    if bar >= 4:
        K(b0, 'soft', 0.8); K(b0 + 2, 'soft', 0.7)
        drums.add(bt(b0 + 1), snare(tone=330, d=0.08) * 0.5, 0.25, 0.2); drums.add(bt(b0 + 3), snare(tone=330, d=0.08) * 0.5, 0.25, 0.2)
        bass.add(bt(b0), pluck_bass(root(bar) + 12, blen(b0, 1.5)), 0.4); bass.add(bt(b0 + 2), pluck_bass(root(bar) + 19, blen(b0 + 2, 1)), 0.3)
        pads.add(bt(b0), strings(c, blen(b0, 4), cut=1600, att=0.5), 0.25)
    if bar == 7: fxb.add(bt(b0 + 1), riser(blen(b0 + 1, 3)), 0.3)

# ACCEL (bars 8-9, 138 -> 210): the clock speeds up a step every beat
for bar in (8, 9):
    b0 = bar * 4
    for q in range(4): K(b0 + q, 'hard', 0.8)
    if bar == 8:
        for q in range(8): SN(b0 + q * 0.5, 0.25 + 0.04 * q)
    else: fill16(b0, 4, 0.5, 1.0)
    for q in range(8): TK(b0 + q * 0.5, q % 2 == 1, 0.8)
    bass.add(bt(b0), reese(root(bar), blen(b0, 4)), 0.35)
    pads.add(bt(b0), strings([n + 12 for n in chord(bar)], blen(b0, 4), cut=2600, att=0.2), 0.22)
fxb.add(bt(32), riser(blen(32, 8)), 0.4)

# RUNAWAY (bars 10-25, 210)
for bar in range(10, 26):
    hardcore_bar(bar, 4, 10)
    if (bar - 10) % 4 == 3 and bar not in (17, 21):
        fill16(bar * 4 + 3, 1, 0.3, 0.9)
fxb.add(bt(40), impact(), 0.4)
fxb.add(bt(100 + 2), riser(blen(102, 2)), 0.35)
fxb.add(bt(103), gear(blen(103, 1)), 0.4)
# the last hit before time stops
CR(104, 1.3); K(104); fxb.add(bt(104), impact(), 0.55)

# DIAL (bars 26-33): a broken beat under the chimes at 168, then gabber at 252
for bar in range(26, 34):
    b0 = bar * 4
    if bar < 30:
        for q in (0, 1.5, 2.5): K(b0 + q, 'break', 0.9)
        SN(b0 + 1); SN(b0 + 3); SN(b0 + 3.75, 0.3); SN(b0 + 2.25, 0.2)
        for q in range(8): TK(b0 + q * 0.5, q % 2 == 1, 0.7)
        for q in range(4): RD(b0 + q, 0.8)
        bass.add(bt(b0), reese(root(bar), blen(b0, 3.8)), 0.42)
        pads.add(bt(b0), strings(chord(bar), blen(b0, 4), cut=1800), 0.18)
        if bar == 29: fxb.add(bt(b0 + 2), riser(blen(b0 + 2, 2)), 0.35)
    else:
        hardcore_bar(bar, 4, 30, gate=False)
        pads.add(bt(b0), strings([n + 12 for n in chord(bar)], blen(b0, 4), cut=3000, att=0.05), 0.2)
fxb.add(bt(120), impact(), 0.35)
# the tape runs down into the still water
fxb.add(bt(134), riser(blen(134, 2), up=False), 0.3)

# STILL WATER (bars 34-39, 84): piano, strings, a quiet music box; then the water rewinds
for bar in range(34, 40):
    b0 = bar * 4; c = chord(bar)
    pads.add(bt(b0), strings(c, blen(b0, 4), cut=1800, att=0.8), 0.42)
    keys.add(bt(b0), piano(root(bar) + 12, blen(b0, 3.5), 0.6), 0.6, -0.2)
    keys.add(bt(b0 + 2), piano(c[1], blen(b0 + 2, 1.8), 0.4), 0.4, 0.1)
    if bar < 38:
        for q in range(8): keys.add(bt(b0 + q * 0.5), music_box(c[(q * 2) % 4] + (12 if q % 4 == 3 else 0) + 12, 1.2), 0.07, 0.3)
        for q in range(4): TK(b0 + q, q % 2 == 1, 0.5)
    else:
        for q in range(8): TK(b0 + q * 0.5, q % 2 == 0, 0.6)      # tock before tick: time runs backwards
        fxb.add(bt(b0), rev_crash(blen(b0, 2)), 0.25); fxb.add(bt(b0 + 2), rev_crash(blen(b0 + 2, 2)), 0.3)
fxb.add(bt(158), riser(blen(158, 2)), 0.3)

# RESTART (bars 40-41, 105 -> 240): the clock revs back up, a kick on every beat
for bar in (40, 41):
    b0 = bar * 4
    for q in range(4): K(b0 + q, 'hard', 0.85)
    for q in range(8): HH(b0 + q * 0.5, 0.6)
    if bar == 41: fill16(b0 + 2, 2, 0.4, 1.0)
    pads.add(bt(b0), strings([n + 12 for n in chord(bar)], blen(b0, 4), cut=2500, att=0.1), 0.22)
fxb.add(bt(160), riser(blen(160, 8)), 0.45)
d = blen(160, 8); tt = tvec(d)
spin = sweep_lp(saw(mtof(38 + 24 * (tt / d) ** 1.4), d) + saw(mtof(45 + 24 * (tt / d) ** 1.4), d), 300 + 3000 * (tt / d) ** 2) * env(d, 0.3, 0.05)
fxb.add(bt(160), spin, 0.18)

# LIMIT (bars 42-53, 240)
for bar in range(42, 54):
    hardcore_bar(bar, 4, 42)
    b0 = bar * 4
    if (bar - 42) % 4 == 3 and bar != 49: fill16(b0 + 3, 1, 0.4, 1.0)
    # a high music box doubling the line a long way above, like a clock in the distance
    if (bar - 42) % 4 in (0, 1):
        for q in range(4): keys.add(bt(b0 + q), music_box(chord(bar)[q % 4] + 24, 0.8), 0.06, 0.4)
fxb.add(bt(168), impact(), 0.45)
fxb.add(bt(212), riser(blen(212, 4)), 0.35)

# GRIND (bar 54 at 120, bar 55 at 160 / 200 / a stop / 252)
K(216); SN(218); K(218.5, 'hard', 0.7)
fxb.add(bt(216), gear(blen(216, 2)), 0.45); fxb.add(bt(218), gear(blen(218, 2)), 0.45)
bass.add(bt(216), reese(root(54), blen(216, 4)), 0.45)
pads.add(bt(216), strings(chord(54), blen(216, 4), cut=1500), 0.2)
fill16(220, 2, 0.4, 0.9); K(220); K(221)
K(222); CR(222, 1.2); fxb.add(bt(222), impact(), 0.45)
for b in (222.5, 223, 223.5): K(b, 'hard', 0.8)
fxb.add(bt(222) + 0.9, riser(blen(222, 2)), 0.35)

# RUNAWAY II (bars 56-63, 252): everything, and a choir over it
for bar in range(56, 64):
    hardcore_bar(bar, 2, 56)
    b0 = bar * 4
    pads.add(bt(b0), choir([n + 12 for n in chord(bar)[:3]], blen(b0, 4), att=0.1), 0.2)
    if bar == 63: fill16(b0 + 3, 1, 0.5, 1.0)
fxb.add(bt(224), impact(), 0.5)
fxb.add(bt(252), riser(blen(252, 4)), 0.4)

# OVERCLOCK (bars 64-71, 320): the clock overclocked: speedcore, a crash every two bars, the choir on top
fxb.add(bt(256), impact(), 0.55)
for bar in range(64, 72):
    hardcore_bar(bar, 2, 64, hats16=False)
    b0 = bar * 4
    pads.add(bt(b0), choir([n + 12 for n in chord(bar)[:3]], blen(b0, 4), att=0.05), 0.22)
    for q in range(4): ticks.add(bt(b0 + q + 0.5), tick(q % 2 == 1), 0.18, 0.5)
    if bar == 71: fxb.add(bt(b0), riser(blen(b0, 3)), 0.4)

# MIDNIGHT (bars 72-73, 63): the tower strikes twelve
fxb.add(bt(MID), gong(), 0.5)
pads.add(bt(MID), strings([50, 57, 62, 65], blen(MID, 4), cut=1200, att=1.0), 0.3)
pads.add(bt(MID), choir([62, 65, 69], blen(MID, 4), att=1.5), 0.15)
bass.add(bt(MID), reese(38, blen(MID, 4)), 0.35)
K(MID + 4); CR(MID + 4, 1.5); fxb.add(bt(MID + 4), impact(), 0.6); fxb.add(bt(MID + 4), gong(9.0), 0.5)
pads.add(bt(MID + 4), choir([62, 69, 74, 77], 5.5, att=0.05), 0.25)
pads.add(bt(MID + 4), strings([38, 50, 57, 62, 65, 69], 5.5, cut=2000, att=0.02), 0.32)

# the clock in the stops: only the ticks go on while time stands still
for b, s in D['stops']:
    t0 = bt(b)
    k = 0
    for x in np.arange(0.3, s - 0.1, 0.4):
        ticks.add(t0 + x, tick(k % 2 == 1), 0.3, 0.5 if k % 2 else -0.5); k += 1

# ---------------------------------------------------------------- mix
def sidechain(bus, depth, tau, beats_from=0, beats_to=END_BEAT):
    g = np.ones(N, np.float32)
    for b in kicks:
        if not beats_from <= b < beats_to: continue
        i = int(bt(b) * SR); n = int(0.25 * SR)
        if i >= N: continue
        seg = 1 - depth * np.exp(-np.arange(min(n, N - i)) / SR / tau)
        g[i:i + len(seg)] = np.minimum(g[i:i + len(seg)], seg)
    bus.L *= g; bus.R *= g
sidechain(pads, 0.75, 0.08); sidechain(bass, 0.35, 0.03); sidechain(lead, 0.25, 0.03); sidechain(keys, 0.2, 0.05, 40)

def reverb(st, mix=0.22, dur=2.4, tau=0.6, cut=6000):
    tt = np.arange(int(dur * SR)) / SR
    out = []
    for ch in range(2):
        ir = lp(rng.standard_normal(len(tt)) * np.exp(-tt / tau), cut)
        ir[:int(0.012 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        out.append(signal.fftconvolve(st[ch], ir)[:N])
    return np.vstack(out) * mix

dry = (drums.stereo() * 1.0 + bass.stereo() * 0.9 + pads.stereo() * 0.85 + lead.stereo() * 0.95
       + keys.stereo() * 1.0 + bells.stereo() * 1.0 + fxb.stereo() * 0.9 + ticks.stereo() * 0.9)
wet = (reverb(keys.stereo(), 0.35, 2.6, 0.7) + reverb(bells.stereo() + pads.stereo() * 0.4, 0.45, 6.0, 1.8, 4500)
       + reverb(lead.stereo(), 0.16, 1.6, 0.35) + reverb(drums.stereo() * 0.5 + fxb.stereo(), 0.12, 1.8, 0.4))
mix = dry + wet
mix = np.vstack([hp(mix[0], 28), hp(mix[1], 28)])

# time stops: the sound dives like a tape run out of power, then silence but for the clock
def tape_stop(st, t_from, dur):
    i0 = int(t_from * SR); n = int(dur * SR)
    rate = np.linspace(1, 0, n) ** 1.3
    pos = np.cumsum(rate)
    for ch in range(2):
        src = st[ch, i0:i0 + n].copy()
        st[ch, i0:i0 + n] = np.interp(pos, np.arange(n), src) * np.linspace(1, 0, n) ** 0.5
def silence_except_ticks(st, t_from, t_to):
    i0, i1 = int(t_from * SR), int(t_to * SR)
    tk = ticks.stereo()[:, i0:i1] * 0.9
    st[:, i0:i1] = st[:, i0:i1] * 0.0 + tk + reverb(np.pad(tk, ((0, 0), (0, N - (i1 - i0)))), 0.3, 1.5, 0.5)[:, :i1 - i0]
def freeze(st, t_from, dur, grain=0.07):
    """the second stop: the sound jams on one tiny slice, stuttering in place"""
    i0 = int(t_from * SR); g = int(grain * SR); n = int(dur * SR)
    sl = st[:, i0:i0 + g].copy() * np.hanning(g)
    out = np.zeros((2, n)); k = 0
    while k * g // 2 < n - g:
        a = k * g // 2
        out[:, a:a + g] += sl * (1 - 0.6 * a / n)
        k += 1
    st[:, i0:i0 + n] = out

s1, len1 = D['stops'][0]
t_stop1 = bt(s1)
tape_stop(mix, t_stop1 + 0.12, 0.55)
silence_except_ticks(mix, t_stop1 + 0.67, t_stop1 + len1 - 0.02)
rc = rev_crash(0.9)
mix[:, int((t_stop1 + len1 - 0.9) * SR):int((t_stop1 + len1) * SR)] += np.vstack([rc, rc])[:, :int(0.9 * SR)] * 0.25
s2, len2 = D['stops'][1]
freeze(mix, bt(s2) + 0.02, len2 - 0.04)
# out of the overclock the tape runs down in one beat, and midnight comes in slow
tape_stop(mix, bt(MID - 1), blen(MID - 1, 1))

# the rewind (bars 38-39): the runaway's sound played backwards, speeding up, under the piano
src = mix[:, int(bt(72) * SR):int(bt(80) * SR)][:, ::-1]
a, z = bt(152), bt(160)
n = int((z - a) * SR)
rate = np.linspace(0.5, 2.2, n)
pos = np.cumsum(rate); pos = pos[pos < src.shape[1] - 1]
rew = np.vstack([np.interp(pos, np.arange(src.shape[1]), src[c]) for c in range(2)])
rew = np.vstack([lp(rew[0], 3500), lp(rew[1], 3500)]) * np.linspace(0.05, 0.5, rew.shape[1])
i = int(a * SR); mix[:, i:i + rew.shape[1]] += rew[:, :min(rew.shape[1], N - i)] * 0.6

# master: glue, soft clip, normalize, fade the last bell
mix = mix - np.mean(mix, axis=1, keepdims=True)
# (as loud as the other recorded songs: about -10 dB RMS where it is loudest)
mix = mix / np.max(np.abs(mix)) * 3.0
mix = np.tanh(mix) / np.tanh(3.0)
endi = min(N, int((bt(END_BEAT) + 6.5) * SR))
fade = int(2.5 * SR)
mix[:, endi - fade:endi] *= np.linspace(1, 0, fade)
mix = mix[:, :endi]
mix *= 0.89 / np.max(np.abs(mix))     # headroom for the MP3 encoder

wav = os.path.join(HERE, 'tokei.wav')
wavfile.write(wav, SR, (mix.T * 32767).astype(np.int16))
mp3 = os.path.join(ROOT, 'audio', 'tokei.mp3')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-b:a', '192k', mp3], check=True)
os.remove(wav)
with open(os.path.join(ROOT, 'src', '94-tokei-score.js'), 'w') as fh:
    fh.write('  // written by songs/tokei-compose.py: the beats where TOKEI\'s kick drum hits (the water pulses on them)\n')
    fh.write('  const TOKEI_KICKS = ' + json.dumps(sorted(set(kicks))) + ';\n')
print('done', round(mix.shape[1] / SR, 2), 's,', len(D['notes']), 'notes')
