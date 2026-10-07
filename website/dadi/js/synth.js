/* Dadi sound engine: a small formant synthesizer written for this project (CC0).
   It turns an IPA string into audio samples with no network, no installed voices and no browser speech service.
   Model: a glottal pulse source and noise source, three or four resonators (formants), a nasal zero, and a separate
   frication path. Parameters follow textbook acoustic phonetics (formant values, burst and frication ranges).
   LIMITS (also shown to users): sounds are approximations made by rule. They are good for hearing the difference
   between sounds, not a recording of a speaker. The core is pure maths (no Web Audio), so it is testable in Node. */
(function (root) {
  'use strict';
  const IPA = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./ipa-data.js') : root.DadiIPA;
  let SR = 22050; /* sample rate of the current render; audio.js passes the device's own rate so the browser never has to resample (resampling was a source of hiss) */

  /* ---------- parsing ---------- */
  const LIGATURES = { 'ʧ': 'tʃ', 'ʤ': 'dʒ', 'ʦ': 'ts', 'ʣ': 'dz', 'ʨ': 'tɕ', 'ʥ': 'dʑ' };
  const AFFRICATES = ['ts', 'dz', 'tʃ', 'dʒ', 'tɕ', 'dʑ', 'ʈʂ', 'ɖʐ'];
  const COMBINING = { '̃': 'nasal', '̤': 'breathy', '̥': 'voiceless', '̩': 'syllabic', '̯': 'nonsyl', '̪': 'dental', '͡': 'tie', '͜': 'tie' };

  function parse(input) {
    let s = String(input || '').normalize('NFD');
    for (const k of Object.keys(LIGATURES)) s = s.split(k).join(LIGATURES[k]);
    s = s.replace(/[\/\[\]()]/g, ' ').replace(/:/g, 'ː').replace(/ɡ/g, 'ɡ').replace(/g/g, 'ɡ').replace(/'/g, 'ˈ');
    const out = [], unsupported = [], approximated = [];
    const chars = Array.from(s);
    let stress = 0;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (/\s/.test(ch)) { if (out.length && out[out.length - 1].type !== 'space') out.push({ type: 'space' }); continue; }
      if (ch === 'ˈ') { stress = 2; continue; }
      if (ch === 'ˌ') { stress = 1; continue; }
      if (ch === '.' || ch === '|') { out.push({ type: 'break', long: false }); continue; }
      if (ch === '‖') { out.push({ type: 'break', long: true }); continue; }
      if (ch === '‿') continue;
      const last = out[out.length - 1];
      if (ch === 'ː' || ch === 'ˑ') { if (last && last.sym) last.len = ch === 'ː' ? 2 : 1; continue; }
      if (ch === 'ʰ') { if (last && last.sym) last.asp = true; continue; }
      if (ch === 'ʱ') { if (last && last.sym) { last.breathy = true; } continue; }
      if (ch === 'ʲ') { if (last && last.sym) last.pal = true; continue; }
      if (ch === 'ʷ') { if (last && last.sym) last.lab = true; continue; }
      if (ch === 'ʼ') { if (last && last.sym) last.ejective = true; continue; }
      if (COMBINING[ch]) {
        const m = COMBINING[ch];
        if (m === 'tie') { if (last && last.sym) last.tieNext = true; continue; }
        if (last && last.sym) last[m] = true;
        continue;
      }
      let sym = ch;
      if (IPA.APPROX[sym]) { approximated.push(sym + '→' + IPA.APPROX[sym]); sym = IPA.APPROX[sym]; }
      const isV = !!IPA.VOWELS[sym], isC = !!IPA.CONSONANTS[sym];
      if (!isV && !isC) { if (!/[̀-ͯ]/.test(ch)) unsupported.push(ch); continue; }
      const seg = { type: isV ? 'v' : 'c', sym, len: 0, stress };
      stress = 0;
      /* A tie bar after the previous symbol, or a listed pair, joins into one affricate. */
      if (!isV && last && last.type === 'c' && !last.affr) {
        const pair = last.sym + sym;
        if (last.tieNext || AFFRICATES.includes(pair)) {
          const st = IPA.CONSONANTS[last.sym], fr = IPA.CONSONANTS[sym];
          if (st && fr && st.t === 'stop' && fr.t === 'fric') { last.affr = sym; last.tieNext = false; continue; }
        }
      }
      out.push(seg);
    }
    return { segs: out, unsupported, approximated };
  }

  /* ---------- acoustic tables ---------- */
  /* Per place: stop burst (centre Hz, bandwidth, gain) and formant locus (F2, F3) the neighbouring vowel moves toward. */
  const PLACE = {
    lab: { burst: [900, 1800, 0.55], locus: [800, 2100] }, ldt: { burst: [1200, 2000, 0.4], locus: [900, 2200] },
    den: { burst: [4500, 3000, 0.5], locus: [1600, 2600] }, alv: { burst: [4300, 2600, 0.7], locus: [1700, 2600] },
    pla: { burst: [3300, 1800, 0.6], locus: [1900, 2500] }, ret: { burst: [2700, 1500, 0.7], locus: [1450, 1850] },
    alp: { burst: [4000, 2000, 0.6], locus: [2100, 2800] }, pal: { burst: [3400, 1800, 0.65], locus: [2200, 3000] },
    vel: { burst: [2000, 1400, 0.75], locus: [1900, 2300] }, uvu: { burst: [1200, 1200, 0.7], locus: [1000, 2200] },
    pha: { burst: [1000, 1000, 0.5], locus: [1200, 2300] }, glo: { burst: [1500, 2000, 0.0], locus: [1400, 2500] },
    lpa: { burst: [1500, 1500, 0.4], locus: [1500, 2200] }
  };
  /* Frication spectrum per fricative: centre, bandwidth, gain. */
  const FRIC = {
    'ɸ': [1600, 3200, 0.30], 'β': [1600, 3200, 0.30], 'f': [5500, 5000, 0.30], 'v': [5500, 5000, 0.30], 'θ': [6000, 5000, 0.26], 'ð': [6000, 5000, 0.26],
    's': [7200, 2600, 0.95], 'z': [7200, 2600, 0.95], 'ʃ': [3300, 1800, 2.0], 'ʒ': [3300, 1800, 2.0], 'ʂ': [2600, 1500, 2.0], 'ʐ': [2600, 1500, 2.0],
    'ɕ': [5000, 2200, 1.5], 'ʑ': [5000, 2200, 1.5], 'ç': [3800, 3000, 1.1], 'ʝ': [3800, 3000, 1.1], 'x': [1800, 1500, 1.5], 'ɣ': [1800, 1500, 1.5],
    'χ': [1100, 1300, 1.5], 'ʁ': [1100, 1300, 1.5], 'ħ': [1000, 900, 1.2], 'ʕ': [1000, 900, 1.2], 'ɬ': [3000, 2500, 1.2], 'ɮ': [3000, 2500, 1.2]
  };
  const GLIDE = { j: [270, 2200, 3000], w: [300, 700, 2200], 'ɥ': [270, 1800, 2100], 'ʋ': [350, 1000, 2300], 'ɹ': [380, 1300, 1650], 'ɻ': [400, 1300, 1500],
    'ɰ': [320, 1300, 2300], 'l': [380, 1250, 2800], 'ɭ': [400, 1300, 2300], 'ʎ': [300, 2000, 2800], 'ʟ': [350, 1100, 2400], 'ɫ': [400, 900, 2500], 'ʍ': [300, 700, 2200] };
  const NASAL_ZERO = { lab: 900, ldt: 1000, alv: 1500, ret: 1300, pal: 2000, vel: 2400, uvu: 2600 };
  const TRILL_F = { lab: [350, 800, 2200], alv: [450, 1400, 2500], uvu: [500, 1100, 2400] };
  const A_VOWEL = IPA.VOWELS['a'].f;
  const BW = [70, 100, 140];
  const FRG = 0.035;

  /* ---------- planning: segments to blocks ---------- */
  function block(d, o) {
    return Object.assign({ d, av: 0, ah: 0, af: 0, ffc: 3000, fbw: 2000, F1: 500, F2: 1500, F3: 2500, B1: BW[0], B2: BW[1], B3: BW[2], an: 0, nz: 0, f0m: 1, am: 0, lv: 1 }, o);
  }
  function fOf(f, o) { return Object.assign({ F1: f[0], F2: f[1], F3: f[2] }, o || {}); }
  function nextVowelF(segs, i) {
    for (let j = i + 1; j < segs.length && j <= i + 2; j++) {
      if (segs[j].type === 'space') break;
      if (segs[j].type === 'v') return IPA.VOWELS[segs[j].sym].f;
    }
    return null;
  }
  function prevVowelF(segs, i) {
    for (let j = i - 1; j >= 0 && j >= i - 2; j--) {
      if (segs[j].type === 'space') break;
      if (segs[j].type === 'v') return IPA.VOWELS[segs[j].sym].f;
    }
    return null;
  }

  function plan(segs, opts) {
    const blocks = [];
    const slow = opts.speed || 1;
    const D = (ms) => ms / slow;
    for (let i = 0; i < segs.length; i++) {
      const g = segs[i];
      if (g.type === 'space') { blocks.push(block(D(130), {})); continue; }
      if (g.type === 'break') { blocks.push(block(D(g.long ? 260 : 45), {})); continue; }
      const stressMul = g.stress === 2 ? 1.12 : g.stress === 1 ? 1.05 : 1;
      const lenMul = g.len === 2 ? 1.75 : g.len === 1 ? 1.3 : 1;
      if (g.type === 'v') {
        const f = IPA.VOWELS[g.sym].f;
        const durMs = 120 * lenMul * (g.stress ? 1.15 : 1);
        const o = fOf(f, { av: 1, ah: 0.03, f0m: stressMul });
        if (g.breathy) { o.av = 0.7; o.ah = 0.1; o.B1 = 130; }
        if (g.voiceless) { o.av = 0; o.ah = 0.2; }
        if (g.nasal) { o.an = 0.9; o.nz = 950; o.B1 = 160; }
        blocks.push(block(D(durMs), o));
        continue;
      }
      const c = IPA.CONSONANTS[g.sym];
      const pl = PLACE[c.p] || PLACE.alv;
      const nf = nextVowelF(segs, i), pf = prevVowelF(segs, i);
      const vf = nf || pf || A_VOWEL;
      const locus = [vf[0] * 0.7, pl.locus[0], pl.locus[1]];
      const voiced = g.voiceless ? 0 : c.v;
      const asp = g.asp || g.breathy;
      const ctx = { F1: locus[0], F2: locus[1], F3: locus[2] };
      const syl = g.syllabic ? 1.6 : 1;
      if (c.t === 'stop') {
        const closure = block(D(c.p === 'glo' ? 60 : 62 * lenMul), Object.assign({ av: voiced ? 0.22 : 0 }, ctx, voiced ? { F1: 200 } : {}));
        blocks.push(closure);
        if (c.p !== 'glo') {
          const bg = pl.burst[2] * (voiced ? 0.6 : 1) * (g.ejective ? 1.5 : 1);
          if (g.affr) {
            blocks.push(block(D(7), Object.assign({ af: bg, ffc: pl.burst[0], fbw: pl.burst[1], ah: 0.2, av: voiced ? 0.3 : 0 }, ctx)));
            const fr = FRIC[g.affr] || FRIC.s;
            blocks.push(block(D(75), Object.assign({ af: fr[2] * (voiced ? 0.7 : 1), ffc: fr[0], fbw: fr[1], av: voiced ? 0.4 : 0, ah: 0.05 }, fOf(vf))));
          } else {
            blocks.push(block(D(10), Object.assign({ af: bg, ffc: pl.burst[0], fbw: pl.burst[1], ah: 0.25, av: voiced ? 0.35 : 0 }, ctx)));
            if (nf || asp) {
              if (asp && !voiced) blocks.push(block(D(65), Object.assign({ ah: 0.2, af: 0.06, ffc: 2500, fbw: 2500 }, fOf(vf))));
              else if (asp && voiced) blocks.push(block(D(70), Object.assign({ av: 0.5, ah: 0.15 }, fOf(vf), { B1: 140 })));
              else blocks.push(block(D(voiced ? 4 : 16), Object.assign({ ah: voiced ? 0.1 : 0.3, av: voiced ? 0.6 : 0 }, fOf(vf))));
            }
          }
        }
        if (g.pal) blocks.push(block(D(30), Object.assign({ av: 0.8 }, fOf(GLIDE.j))));
        if (g.lab) blocks.push(block(D(30), Object.assign({ av: 0.8 }, fOf(GLIDE.w))));
        continue;
      }
      if (c.t === 'fric') {
        if (c.p === 'glo') {
          blocks.push(block(D(95 * lenMul), Object.assign({ av: c.v || g.breathy ? 0.35 : 0, ah: 0.2 }, fOf(vf), { f0m: stressMul })));
        } else {
          const fr = FRIC[g.sym];
          const o = Object.assign({ af: fr[2] * (voiced ? 0.7 : 1), ffc: fr[0], fbw: fr[1], av: voiced ? 0.42 : 0, ah: 0.04, f0m: stressMul }, ctx);
          if (c.p === 'pha') Object.assign(o, fOf([750, 1150, 2400]));
          blocks.push(block(D(115 * lenMul), o));
        }
        if (asp && !voiced) blocks.push(block(D(45), Object.assign({ ah: 0.18 }, fOf(vf))));
        if (g.pal) blocks.push(block(D(30), Object.assign({ av: 0.8 }, fOf(GLIDE.j))));
        if (g.lab) blocks.push(block(D(30), Object.assign({ av: 0.8 }, fOf(GLIDE.w))));
        continue;
      }
      if (c.t === 'latfric') {
        const fr = FRIC[g.sym];
        blocks.push(block(D(110 * lenMul), Object.assign({ af: fr[2] * (voiced ? 0.7 : 1), ffc: fr[0], fbw: fr[1], av: voiced ? 0.42 : 0, ah: 0.04 }, fOf([380, 1250, 2700]))));
        continue;
      }
      if (c.t === 'nasal') {
        const o = Object.assign({ av: 0.75, an: 1, nz: NASAL_ZERO[c.p] || 1500, B1: 90, B2: 160, B3: 220, f0m: stressMul }, fOf([260, pl.locus[0] + 200, 2300]));
        blocks.push(block(D(88 * lenMul * syl), o));
        if (g.pal) blocks.push(block(D(30), Object.assign({ av: 0.8 }, fOf(GLIDE.j))));
        continue;
      }
      if (c.t === 'trill') {
        const f = TRILL_F[c.p] || TRILL_F.alv;
        blocks.push(block(D(130 * lenMul), Object.assign({ av: 0.85, am: 0.75, f0m: stressMul }, fOf(f))));
        continue;
      }
      if (c.t === 'tap') {
        const f = c.p === 'ret' ? [420, 1350, 1800] : c.p === 'ldt' ? [350, 1000, 2300] : [450, 1500, 2500];
        blocks.push(block(D(14), Object.assign({ av: 0.9 }, fOf(f))));
        blocks.push(block(D(13), Object.assign({ av: 0.12 }, fOf(f))));
        blocks.push(block(D(14), Object.assign({ av: 0.9 }, fOf(f))));
        continue;
      }
      if (c.t === 'appr' || c.t === 'lat') {
        const f = GLIDE[g.sym] || GLIDE.j;
        const voiceless = g.sym === 'ʍ' || g.voiceless;
        blocks.push(block(D(78 * lenMul * syl), Object.assign({ av: voiceless ? 0 : 0.85, ah: voiceless ? 0.2 : 0.03, f0m: stressMul }, fOf(f))));
        continue;
      }
    }
    return blocks;
  }

  /* ---------- rendering ---------- */
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return (s / 4294967296) * 2 - 1; }; }

  function res(f, bw) {
    const T = 1 / SR; f = Math.min(f, SR * 0.45);
    const c = -Math.exp(-2 * Math.PI * bw * T), b = 2 * Math.exp(-Math.PI * bw * T) * Math.cos(2 * Math.PI * f * T);
    return { a: 1 - b - c, b, c };
  }

  function render(blocks, opts) {
    const f0base = opts.f0 || 150;
    const n = blocks.length;
    const starts = [0]; let total = 0;
    for (const b of blocks) { total += b.d * SR / 1000; starts.push(total); }
    const lead = Math.round(0.03 * SR), tail = Math.round(0.06 * SR);
    const N = Math.round(total) + lead + tail;
    const out = new Float32Array(N);
    const noise = rng(opts.seed || 12345);
    const keys = ['av', 'ah', 'af', 'F1', 'F2', 'F3', 'B1', 'B2', 'B3', 'ffc', 'fbw', 'an', 'nz', 'f0m', 'am', 'lv'];
    const rampMs = { av: 3, ah: 4, af: 2, an: 8, am: 8, f0m: 40, lv: 10 };
    const val = (k, t) => {
      /* t in samples within block timeline */
      let i = 0; while (i < n - 1 && t >= starts[i + 1]) i++;
      const v = blocks[i][k];
      const ramp = Math.min(((rampMs[k] || 26) * SR / 1000), (blocks[i].d * SR / 1000) * 0.9);
      if (i + 1 < n) {
        const r2 = Math.min(ramp, blocks[i + 1].d * SR / 1000 * 0.9);
        const edge = starts[i + 1] - r2 / 2;
        if (t > edge) return v + (blocks[i + 1][k] - v) * Math.min(1, (t - edge) / r2);
      }
      if (i > 0) {
        const r1 = Math.min(ramp, blocks[i - 1].d * SR / 1000 * 0.9);
        const edge = starts[i] + r1 / 2;
        if (t < edge) { const w = 0.5 + (t - starts[i]) / r1; return blocks[i - 1][k] + (v - blocks[i - 1][k]) * Math.max(0, w); }
      }
      return v;
    };
    let phase = 0, g1 = 0, nzl = 0, lp1 = 0, lp2 = 0;
    const lpa = 1 - Math.exp(-2 * Math.PI * 5200 / SR); /* gentle 2-pole low-pass keeps the top end smooth */
    const st = { y: [[0, 0], [0, 0], [0, 0], [0, 0]], fr: [0, 0], nas: [0, 0], x: [0, 0], zx: [0, 0], zy: [0, 0] };
    let coef = null, p = null;
    for (let s = 0; s < N; s++) {
      const t = s - lead;
      if (s % 2 === 0 || !p) {
        const tt = Math.max(0, Math.min(t, total - 1));
        p = {}; for (const k of keys) p[k] = val(k, tt);
        const prog = total > 0 ? Math.min(1, Math.max(0, t / total)) : 0;
        p.f0 = f0base * (1.07 - 0.2 * prog) * p.f0m;
        coef = [res(p.F1, p.B1), res(p.F2, p.B2), res(p.F3, p.B3), res(3500, 220)];
        coef.fr = res(p.ffc, p.fbw);
        coef.nas = res(270, 110);
        /* nasal anti-resonance as a notch: zeros on the unit circle at nz, poles just inside (stable, no big gain) */
        if (p.nz > 0) { const w0 = 2 * Math.PI * Math.max(200, p.nz) / SR, r = Math.exp(-Math.PI * 180 / SR), c0 = Math.cos(w0);
          const norm = (1 - 2 * r * c0 + r * r) / (2 - 2 * c0); coef.zero = { n0: norm, n1: -2 * c0 * norm, n2: norm, d1: 2 * r * c0, d2: -r * r }; } else coef.zero = null;
      }
      const inside = t >= 0 && t < total;
      /* source */
      phase += p.f0 / SR; /* no random pitch wobble: it made a hiss */
      if (phase >= 1) phase -= 1;
      const oq = 0.62; let gl;
      if (phase < oq) gl = 0.5 * (1 - Math.cos(Math.PI * phase / oq)); else gl = Math.cos(Math.PI / 2 * (phase - oq) / (1 - oq));
      const dg = gl - g1; g1 = gl;
      let av = p.av; if (p.am > 0) av *= 1 - p.am * (0.5 + 0.5 * Math.sin(2 * Math.PI * 26 * Math.max(0, t) / SR));
      const nzr = noise(); nzl += 0.35 * (nzr - nzl); const nz = nzl * 1.6; /* aspiration noise, softened */
      let src = (inside ? av : 0) * dg * 14 + (inside ? p.ah : 0) * nz * 0.45;
      /* vocal tract */
      let y = src;
      for (let k = 0; k < 4; k++) {
        const c = coef[k], q = st.y[k];
        const o = c.a * y + c.b * q[0] + c.c * q[1]; q[1] = q[0]; q[0] = o; y = o;
      }
      { const yin = y, z = coef.zero;
        if (z) { y = z.n0 * yin + z.n1 * st.zx[0] + z.n2 * st.zx[1] + z.d1 * st.zy[0] + z.d2 * st.zy[1]; } else y = yin;
        st.zx[1] = st.zx[0]; st.zx[0] = yin; st.zy[1] = st.zy[0]; st.zy[0] = y; /* history always updated, so switching on never clicks */ }
      /* nasal murmur, parallel */
      let nasal = 0;
      if (p.an > 0.01) { const c = coef.nas, q = st.nas; const o = c.a * src + c.b * q[0] + c.c * q[1]; q[1] = q[0]; q[0] = o; nasal = o * p.an * 1.4; }
      /* frication */
      let fric = 0;
      if (inside && p.af > 0.001) { const c = coef.fr, q = st.fr; const o = c.a * noise() * 0.8 + c.b * q[0] + c.c * q[1]; q[1] = q[0]; q[0] = o; fric = o * p.af * FRG; }
      const mix = (y * 0.22 + nasal * 0.12) * p.lv + fric;
      lp1 += lpa * (mix - lp1); lp2 += lpa * (lp1 - lp2); out[s] = lp2;
    }
    /* normalize, fade */
    let pk = 0; for (let s = 0; s < N; s++) pk = Math.max(pk, Math.abs(out[s]));
    const gain = pk > 0 ? 0.85 / pk : 1;
    const fade = Math.round(0.012 * SR);
    for (let s = 0; s < N; s++) {
      let m = gain; if (s < fade) m *= s / fade; if (N - 1 - s < fade) m *= (N - 1 - s) / fade;
      out[s] *= m;
    }
    return out;
  }

  /* Public: ipa string -> samples. opts: { f0, speed, seed } */
  function synthesize(ipa, opts) {
    opts = opts || {};
    SR = Math.max(16000, Math.min(48000, Math.round(opts.sr || 22050)));
    const parsed = parse(ipa);
    const blocks = plan(parsed.segs, opts);
    if (!blocks.length) return { samples: new Float32Array(0), sampleRate: SR, unsupported: parsed.unsupported, approximated: parsed.approximated, segments: 0 };
    return { samples: render(blocks, opts), sampleRate: SR, unsupported: parsed.unsupported, approximated: parsed.approximated, segments: parsed.segs.length };
  }

  /* One key press: vowels alone; consonants between two /a/ (the usual way sound charts present consonants). */
  function previewSymbol(sym, opts) {
    const base = String(sym || '').normalize('NFD')[0];
    if (IPA.VOWELS[base] || (IPA.APPROX[base] && IPA.VOWELS[IPA.APPROX[base]])) return synthesize(sym, opts);
    if (IPA.CONSONANTS[base] || IPA.APPROX[base]) return synthesize('a' + sym + 'a', opts);
    return synthesize(sym, opts);
  }

  function toWav(samples, rate) {
    const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
    return new Uint8Array(buf);
  }

  const api = { get SR() { return SR; }, parse, plan, synthesize, previewSymbol, toWav };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DadiSynth = api;
})(typeof self !== 'undefined' ? self : this);
