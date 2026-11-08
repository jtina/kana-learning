import { html, render, Component } from './vendor/htm-preact.js';
import { buildKana } from './kana-data.js';
import * as PH from './phrases-data.js';

// Settings (were design-tool props in the prototype)
const SETTINGS = { autoSpeak: true, showPhraseRomaji: true };

const KANA_FONT = "font-family:var(--kana,'Zen Maru Gothic')";
const load = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };

class App extends Component {
  state = { kana: buildKana(), ph: PH, tab: 'chart', cScript: 'h', cSet: 'basic', romaji: true, sel: null,
    mode: 'mc', qScript: 'h', qSets: { basic: true, dakuten: false, combo: false }, dir: 'k2r', qLen: 20,
    q: null, stats: load('kanapocket-stats', {}), stars: load('kanapocket-stars', {}), phRomaji: load('kanapocket-phromaji', null) ?? undefined, cat: 1 };

  componentDidMount() {
    // Voices load asynchronously on iOS/Safari
    if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }
  }
  save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  speak(t) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const m = new SpeechSynthesisUtterance(t); m.lang = 'ja-JP'; m.rate = 0.8;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.replace('_', '-').startsWith('ja')); if (v) m.voice = v;
    speechSynthesis.speak(m);
  }
  acc(id) { const s = this.state.stats[id]; return s && s.c + s.w ? s.c / (s.c + s.w) : null; }
  tries(id) { const s = this.state.stats[id]; return s ? s.c + s.w : 0; }
  isWeak(id) { const a = this.acc(id); return this.tries(id) >= 2 && a < 0.7; }
  weight(id) { const s = this.state.stats[id]; if (!s) return 1.5; return Math.max(0.3, 1 + s.w * 2 - s.c * 0.4); }
  record(id, ok) {
    const stats = { ...this.state.stats }, s = { ...(stats[id] || { c: 0, w: 0 }) };
    ok ? s.c++ : s.w++; stats[id] = s; this.save('kanapocket-stats', stats); this.setState({ stats });
  }
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  pool() {
    const { kana, qScript, qSets } = this.state;
    return kana.items.filter(it => qSets[it.set] && (qScript === 'both' || it.script === qScript));
  }
  pick(pool, n) {
    const p = pool.slice(), out = [];
    while (out.length < n && p.length) {
      const ws = p.map(it => this.weight(it.id)); let x = Math.random() * ws.reduce((a, b) => a + b, 0), i = 0;
      while (i < p.length - 1 && x > ws[i]) { x -= ws[i]; i++; }
      out.push(p.splice(i, 1)[0]);
    }
    return out;
  }
  effDir(mode = this.state.mode) { return mode === 'type' ? 'k2r' : mode === 'write' ? 'r2k' : this.state.dir; }
  makeOpts(item, dir) {
    const all = this.state.kana.items.filter(it => it.script === item.script && it.r !== item.r);
    const same = all.filter(it => it.set === item.set), src = same.length >= 3 ? same : all, seen = new Set([item.r]), pick = [];
    for (const it of this.shuffle(src)) { if (!seen.has(it.r)) { seen.add(it.r); pick.push(it); } if (pick.length === 3) break; }
    return this.shuffle([item, ...pick]).map(it => dir === 'k2r' ? it.r : it.ch);
  }
  begin(items, mode = this.state.mode) {
    if (!items.length) return;
    const dir = this.effDir(mode);
    this.strokes = []; this.redraw();
    this.setState({ tab: 'quiz', mode, q: { items, i: 0, dir, mode, ok: 0, missed: [], ans: null, typed: '', revealed: false, opts: this.makeOpts(items[0], dir) } },
      () => setTimeout(() => this.inp && this.inp.focus(), 60));
  }
  startQuiz = () => { const p = this.pool(); if (!p.length) return; const n = this.state.qLen === 'all' ? p.length : Math.min(this.state.qLen, p.length); this.begin(this.pick(p, n)); };
  answer(given) {
    const q = this.state.q; if (q.ans) return;
    const it = q.items[q.i], g = given.trim().toLowerCase();
    const ok = q.dir === 'k2r' ? (g === it.r || (this.state.kana.alts[it.r] || []).includes(g)) : given === it.ch;
    this.record(it.id, ok);
    if (SETTINGS.autoSpeak) this.speak(it.ch);
    this.setState({ q: { ...q, ans: { ok, given }, ok: q.ok + (ok ? 1 : 0), missed: ok ? q.missed : [...q.missed, it] } });
  }
  selfMark(ok) {
    const q = this.state.q, it = q.items[q.i]; this.record(it.id, ok);
    const nq = { ...q, ok: q.ok + (ok ? 1 : 0), missed: ok ? q.missed : [...q.missed, it] };
    this.setState({ q: nq }, () => this.next());
  }
  next = () => {
    const q = this.state.q, i = q.i + 1;
    this.strokes = []; this.redraw();
    if (i >= q.items.length) { this.setState({ q: { ...q, done: true } }); return; }
    this.setState({ q: { ...q, i, ans: null, typed: '', revealed: false, opts: this.makeOpts(q.items[i], q.dir) } },
      () => this.inp && this.inp.focus());
  };
  // drawing pad
  canvasRef = el => { if (el && el !== this.cv) { this.cv = el; el.width = 720; el.height = 720; this.strokes = []; } if (!el) this.cv = null; };
  inpRef = el => { this.inp = el; };
  pt(e) { const b = this.cv.getBoundingClientRect(); return [(e.clientX - b.left) * 720 / b.width, (e.clientY - b.top) * 720 / b.height, e.pointerType === 'pen' ? e.pressure : 0.5]; }
  redraw() {
    const c = this.cv; if (!c) return; const x = c.getContext('2d');
    x.clearRect(0, 0, 720, 720); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = x.fillStyle = '#3b2b30';
    for (const s of this.strokes || []) {
      if (s.length === 1) { x.beginPath(); x.arc(s[0][0], s[0][1], 11, 0, 7); x.fill(); continue; }
      for (let i = 1; i < s.length; i++) { x.lineWidth = 14 + s[i][2] * 16; x.beginPath(); x.moveTo(s[i - 1][0], s[i - 1][1]); x.lineTo(s[i][0], s[i][1]); x.stroke(); }
    }
  }
  down = e => { if (!this.cv) return; e.preventDefault(); this.drawing = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} this.strokes = this.strokes || []; this.strokes.push([this.pt(e)]); this.redraw(); };
  move = e => { if (!this.drawing) return; e.preventDefault(); this.strokes[this.strokes.length - 1].push(this.pt(e)); this.redraw(); };
  up = () => { this.drawing = false; };

  seg(opts, cur, set) {
    return opts.map(([v, label]) => { const on = v === cur; return { label, go: () => set(v), bg: on ? '#fff' : 'transparent', color: on ? '#b44d66' : '#86727a', shadow: on ? '0 1px 3px rgba(80,40,50,.12)' : 'none' }; });
  }
  dotFor(id) { const a = this.acc(id); return a === null ? 'transparent' : a < 0.5 ? '#d0647d' : a < 0.8 ? '#e0a33b' : '#4f9a68'; }
  accText(id) { const a = this.acc(id); return a === null ? 'Not quizzed yet' : `${Math.round(a * 100)}% correct · ${this.tries(id)} tries`; }

  vals() {
    const S = this.state, set = o => this.setState(o), K = S.kana;
    const tabs = [['chart', 'あ', 'Chart'], ['quiz', '問', 'Quiz'], ['phrases', '話', 'Phrases'], ['progress', '歩', 'Progress']];
    const nav = tabs.map(([t, glyph, label]) => { const on = S.tab === t; return { glyph, label, go: () => set({ tab: t }), bg: on ? '#fff' : 'transparent', color: on ? '#b44d66' : '#5e4a50', iconBg: on ? '#d0647d' : '#efe0e3', iconColor: on ? '#fff' : '#86727a' }; });
    const v = { nav, isChart: S.tab === 'chart', isPhrases: S.tab === 'phrases', isProgress: S.tab === 'progress', showRomaji: S.romaji,
      romajiLabel: S.romaji ? 'Hide romaji' : 'Show romaji', toggleRomaji: () => set({ romaji: !S.romaji }) };
    v.scriptSeg = this.seg([['h', 'ひらがな'], ['k', 'カタカナ']], S.cScript, x => set({ cScript: x, sel: null }));
    v.setSeg = this.seg([['basic', 'Basic'], ['dakuten', 'Dakuten'], ['combo', 'Combos']], S.cSet, x => set({ cSet: x, sel: null }));
    v.chartRows = [];
    let selRow = null;
    const sec = K.sections[S.cScript].find(s => s.set === S.cSet);
    for (let i = 0; i < sec.cells.length; i += sec.cols) {
      const row = sec.cells.slice(i, i + sec.cols), first = row.find(Boolean);
      if (S.sel && row.some(c => c && c.id === S.sel)) selRow = row.filter(Boolean);
      v.chartRows.push({ label: first.r === 'a' ? '·' : first.r.replace(/[aiueo]$/, ''), cells: row.map(c => c ? {
        full: true, id: c.id, ch: c.ch, r: c.r, dot: this.dotFor(c.id),
        border: S.sel === c.id ? '#d0647d' : '#eee1e3', bg: S.sel === c.id ? '#fdf1f3' : '#fff',
        go: () => { set({ sel: c.id }); this.speak(c.ch); } } : { full: false }) });
    }
    const si = S.sel && K.byId[S.sel];
    v.sel = si ? { ch: si.ch, r: si.r, acc: this.accText(si.id), strokes: si.strokes ? `${si.strokes} stroke${si.strokes > 1 ? 's' : ''}` : '',
      speak: () => this.speak(si.ch), quizRow: () => { if (selRow) this.begin(this.shuffle([...selRow, ...selRow]), 'mc'); } } : null;
    // quiz setup
    const q = S.q;
    v.isQuizSetup = S.tab === 'quiz' && !q; v.isQuizActive = S.tab === 'quiz' && !!q && !q.done; v.isQuizDone = S.tab === 'quiz' && !!q && !!q.done;
    const modes = [['mc', 'ア', 'Multiple choice', 'Pick the right answer from four options.'], ['type', 'ka', 'Type the reading', 'See a kana, type its romaji on the keyboard.'], ['write', '✎', 'Write it', 'See the romaji, draw the kana with your finger or Pencil, then check yourself.']];
    v.modeCards = modes.map(([m, glyph, title, desc]) => { const on = S.mode === m; return { glyph, title, desc, go: () => set({ mode: m }), border: on ? '#d0647d' : '#eee1e3', bg: on ? '#fdf1f3' : '#fff', iconBg: on ? '#d0647d' : '#f2e6e8', iconColor: on ? '#fff' : '#86727a', dot: on ? '#d0647d' : 'transparent' }; });
    v.qScriptSeg = this.seg([['h', 'Hiragana'], ['k', 'Katakana'], ['both', 'Both']], S.qScript, x => set({ qScript: x }));
    v.setChips = [['basic', 'Basic'], ['dakuten', 'Dakuten'], ['combo', 'Combos']].map(([k, label]) => { const on = S.qSets[k]; return { label, go: () => set({ qSets: { ...S.qSets, [k]: !on } }), border: on ? '#d0647d' : '#eee1e3', bg: on ? '#fdf1f3' : '#fff', color: on ? '#b44d66' : '#86727a' }; });
    v.dirLocked = S.mode !== 'mc';
    v.dirNote = S.mode === 'type' ? 'Kana → romaji' : 'Romaji → kana';
    v.dirSeg = this.seg([['k2r', 'Kana → romaji'], ['r2k', 'Romaji → kana']], S.dir, x => set({ dir: x }));
    v.lenSeg = this.seg([[10, '10'], [20, '20'], ['all', 'All']], S.qLen, x => set({ qLen: x }));
    const pool = this.pool(), nWeak = pool.filter(it => this.isWeak(it.id)).length;
    v.poolNote = !pool.length ? 'Choose at least one character set.' : `${pool.length} characters${nWeak ? ` · ${nWeak} weak ones come up more often` : ''}`;
    // active quiz
    if (q && !q.done) {
      const it = q.items[q.i], a = q.ans, k2r = q.dir === 'k2r', n = q.items.length;
      Object.assign(v, { quit: () => set({ q: null }), counter: `${q.i + 1} / ${n}`, pct: `${(q.i + (a ? 1 : 0)) / n * 100}%`,
        modeLabel: modes.find(m => m[0] === q.mode)[2], prompt: k2r ? it.ch : it.r, promptIsKana: k2r,
        promptHint: q.mode === 'write' ? `Write in ${it.script === 'h' ? 'hiragana' : 'katakana'}` : k2r ? 'What is the reading?' : `Which ${it.script === 'h' ? 'hiragana' : 'katakana'} is this?`,
        isMC: q.mode === 'mc', isType: q.mode === 'type', isWrite: q.mode === 'write', mcCols: 2,
        mcOpts: q.opts.map(label => { const right = label === (k2r ? it.r : it.ch), chosen = a && a.given === label;
          return { label, go: () => this.answer(label), size: k2r ? '28px' : '40px',
            bg: a && right ? '#e3f2e7' : chosen ? '#fbe5e1' : '#fff', border: a && right ? '#7fbf94' : chosen ? '#e3917f' : '#eee1e3',
            color: a && right ? '#2f7a4a' : chosen ? '#a8432f' : '#3b2b30', opacity: a && !right && !chosen ? 0.45 : 1 }; }),
        typed: q.typed, onType: e => set({ q: { ...this.state.q, typed: e.target.value } }),
        onTypeKey: e => { if (e.key !== 'Enter') return; e.preventDefault(); const cq = this.state.q; cq.ans ? this.next() : cq.typed.trim() && this.answer(cq.typed); },
        typeBorder: !a ? '#eee1e3' : a.ok ? '#7fbf94' : '#e3917f', check: () => q.typed.trim() && this.answer(q.typed),
        revealed: q.revealed, ghost: it.ch,
        undo: () => { (this.strokes || []).pop(); this.redraw(); }, clear: () => { this.strokes = []; this.redraw(); },
        answered: !!a, fbBg: a && a.ok ? '#e3f2e7' : '#fbe5e1', fbColor: a && a.ok ? '#2f7a4a' : '#a8432f',
        fbText: !a ? '' : a.ok ? 'Correct!' : `${it.ch} is read “${it.r}”`, nextLabel: q.i + 1 >= n ? 'See results' : 'Next',
        showCheck: q.mode === 'type' && !a, showReveal: q.mode === 'write' && !q.revealed, showSelfMark: q.mode === 'write' && q.revealed,
        reveal: () => { set({ q: { ...q, revealed: true } }); if (SETTINGS.autoSpeak) this.speak(it.ch); },
        markGot: () => this.selfMark(true), markMiss: () => this.selfMark(false) });
    }
    if (q && q.done) {
      const n = q.items.length, seen = new Set();
      Object.assign(v, { score: `${q.ok} / ${n}`, scorePct: `${Math.round(q.ok / n * 100)}% correct`, hasMissed: q.missed.length > 0,
        missed: q.missed.filter(m => !seen.has(m.id) && seen.add(m.id)).map(m => ({ ch: m.ch, r: m.r })),
        retryMissed: () => this.begin(this.shuffle(q.missed), q.mode),
        again: () => this.begin(this.shuffle(q.items), q.mode), toSetup: () => set({ q: null }) });
    }
    // phrases
    const P = S.ph;
    v.phraseRomaji = S.phRomaji ?? SETTINGS.showPhraseRomaji;
    v.phraseRomajiLabel = v.phraseRomaji ? 'Hide romaji' : 'Show romaji';
    v.togglePhraseRomaji = () => { const nv = !v.phraseRomaji; this.save('kanapocket-phromaji', nv); set({ phRomaji: nv }); };
    const cats = [{ cat: '★ Saved' }, ...P.PHRASES];
    v.catChips = cats.map((c, i) => ({ label: c.cat, go: () => set({ cat: i }), bg: S.cat === i ? '#d0647d' : '#f2e6e8', color: S.cat === i ? '#fff' : '#5e4a50' }));
    const list = S.cat === 0 ? P.PHRASES.flatMap(c => c.items).filter(p => S.stars[p[0]]) : P.PHRASES[S.cat - 1].items;
    v.phrases = list.map(p => { const on = !!S.stars[p[0]]; return { key: p[0], segs: P.furigana(p[0]), ro: p[1], en: p[2], heard: !!p[3],
      speak: () => this.speak(P.plain(p[0])), starGlyph: on ? '★' : '☆', starColor: on ? '#d0647d' : '#a08d93',
      star: () => { const stars = { ...this.state.stars }; on ? delete stars[p[0]] : stars[p[0]] = 1; this.save('kanapocket-stars', stars); set({ stars }); } }; });
    v.noFavs = S.cat === 0 && !v.phrases.length;
    // progress
    const tried = K.items.filter(it => this.tries(it.id)), mastered = tried.filter(it => this.tries(it.id) >= 3 && this.acc(it.id) >= 0.85);
    const tot = Object.values(S.stats).reduce((a, s) => [a[0] + s.c, a[1] + s.c + s.w], [0, 0]);
    v.tiles = [{ label: 'Characters practiced', value: `${tried.length} / ${K.items.length}` }, { label: 'Mastered', value: mastered.length }, { label: 'Overall accuracy', value: tot[1] ? `${Math.round(tot[0] / tot[1] * 100)}%` : '—' }];
    const heatBg = c => { const a = this.acc(c.id); return a === null ? '#f4ecec' : a < 0.5 ? 'oklch(0.92 0.045 5)' : a < 0.8 ? 'oklch(0.8 0.09 5)' : 'oklch(0.65 0.13 5)'; };
    v.heat = [['h', 'Hiragana'], ['k', 'Katakana']].map(([s, title]) => { const hs = K.sections[s][0], rows = [];
      for (let i = 0; i < hs.cells.length; i += 5) rows.push(hs.cells.slice(i, i + 5).map(c => c ? { ch: c.ch, bg: heatBg(c), color: (this.acc(c.id) ?? 0) >= 0.8 ? '#fff' : '#3b2b30' } : { ch: '', bg: 'transparent', color: '#3b2b30' }));
      return { title, rows }; });
    const weak = K.items.filter(it => this.isWeak(it.id)).sort((a, b) => this.acc(a.id) - this.acc(b.id));
    v.weak = weak.map(w => ({ ch: w.ch, acc: `${Math.round(this.acc(w.id) * 100)}%` }));
    v.quizWeak = () => this.begin(this.shuffle(weak).slice(0, 20));
    v.reset = () => { if (confirm('Reset all quiz history?')) { this.save('kanapocket-stats', {}); set({ stats: {} }); } };
    return v;
  }

  render() {
    const v = this.vals();
    const segBtn = (o, pad = 16) => html`<button onClick=${o.go} style=${`border:none;border-radius:10px;padding:0 ${pad}px;min-height:44px;font:inherit;font-size:15px;font-weight:700;background:${o.bg};color:${o.color};box-shadow:${o.shadow};cursor:pointer`}>${o.label}</button>`;
    const segGroup = (list, pad) => html`<div style="display:flex;padding:4px;background:#f2e6e8;border-radius:14px;gap:4px">${list.map(o => segBtn(o, pad))}</div>`;
    const card = 'background:#fff;border:1px solid #eee1e3';
    const ghostBtn = 'border:1px solid #eee1e3;background:#fff;color:#5e4a50';
    const primary = 'border:none;background:#d0647d;color:#fff';

    return html`
<div class="shell" style="display:flex;height:100dvh;overflow:hidden;background:#fbf7f6">
  <div class="sidebar" style="width:220px;flex-shrink:0;background:#f7eeef;border-right:1px solid #eee1e3;display:flex;flex-direction:column;padding:32px 14px 24px;gap:32px;box-sizing:border-box">
    <div class="brand" style="padding:0 12px;display:flex;flex-direction:column;gap:2px">
      <div style="font-size:24px;font-weight:700;color:#c25a73">Kana Pocket</div>
      <div style="font-size:13px;color:#86727a">かなポケット</div>
    </div>
    <div class="navlist" style="display:flex;flex-direction:column;gap:6px">
      ${v.nav.map(n => html`
        <button onClick=${n.go} style=${`display:flex;align-items:center;gap:14px;padding:10px 12px;border-radius:14px;border:none;background:${n.bg};color:${n.color};font:inherit;font-size:16px;font-weight:500;text-align:left;cursor:pointer;min-height:56px`}>
          <span style=${`width:36px;height:36px;border-radius:10px;background:${n.iconBg};color:${n.iconColor};display:grid;place-items:center;font-size:19px;${KANA_FONT}`}>${n.glyph}</span>
          <span>${n.label}</span>
        </button>`)}
    </div>
    <div class="foot" style="margin-top:auto;padding:0 12px;font-size:12px;color:#a08d93;line-height:1.5">Progress and saved phrases stay on this device.</div>
  </div>

  <div style="flex:1;min-width:0;overflow-y:auto;-webkit-overflow-scrolling:touch">

    ${v.isChart && html`
      <div class="page" style="padding:36px 40px 56px;display:flex;flex-direction:column;gap:24px;max-width:1120px;box-sizing:border-box">
        <div style="display:flex;flex-direction:column;gap:4px">
          <h1 style="margin:0;font-size:32px;font-weight:700">Kana Chart</h1>
          <div style="font-size:14px;color:#86727a">Tap a character to hear it. The dot in each corner shows your quiz accuracy.</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
          ${segGroup(v.scriptSeg, 18)}
          ${segGroup(v.setSeg, 16)}
          <button onClick=${v.toggleRomaji} style=${`margin-left:auto;${ghostBtn};border-radius:12px;padding:0 16px;min-height:44px;font:inherit;font-size:15px;cursor:pointer`}>${v.romajiLabel}</button>
        </div>
        <div style="display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap">
          <div style="flex:1 1 520px;min-width:0;display:flex;flex-direction:column;gap:8px">
            ${v.chartRows.map(row => html`
              <div style="display:flex;gap:8px;align-items:center">
                <div style="width:26px;flex-shrink:0;font-size:13px;color:#a08d93;text-align:center">${row.label}</div>
                ${row.cells.map(c => c.full ? html`
                  <button onClick=${c.go} style=${`flex:1 1 0;min-width:0;height:84px;border-radius:16px;border:2px solid ${c.border};background:${c.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;position:relative;padding:0;font:inherit;color:#3b2b30`}>
                    <span style=${`${KANA_FONT};font-size:34px;line-height:1.1`}>${c.ch}</span>
                    ${v.showRomaji && html`<span style="font-size:13px;color:#86727a">${c.r}</span>`}
                    <span style=${`position:absolute;top:8px;right:8px;width:8px;height:8px;border-radius:50%;background:${c.dot}`}></span>
                  </button>` : html`<div style="flex:1 1 0;min-width:0;height:84px"></div>`)}
              </div>`)}
          </div>
          <div style="flex:0 0 260px;position:sticky;top:24px;background:#fff;border:1px solid #eee1e3;border-radius:24px;padding:28px 24px;display:flex;flex-direction:column;align-items:center;gap:16px;box-sizing:border-box">
            ${v.sel ? html`
              <div style=${`${KANA_FONT};font-size:120px;line-height:1`}>${v.sel.ch}</div>
              <div style="font-size:28px;font-weight:700;color:#b44d66">${v.sel.r}</div>
              <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
                <div style="font-size:15px;color:#5e4a50">${v.sel.strokes}</div>
                <div style="font-size:14px;color:#86727a">${v.sel.acc}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;width:100%">
                <button onClick=${v.sel.speak} style="border:none;background:#fbe8ec;color:#b44d66;border-radius:14px;min-height:48px;font:inherit;font-size:16px;font-weight:700;cursor:pointer">Play sound</button>
                <button onClick=${v.sel.quizRow} style=${`${ghostBtn};border-radius:14px;min-height:48px;font:inherit;font-size:16px;cursor:pointer`}>Quiz this row</button>
              </div>` : html`
              <div style="width:120px;height:120px;border-radius:24px;border:2px dashed #eee1e3"></div>
              <div style="font-size:15px;color:#86727a;text-align:center">Tap a character</div>`}
          </div>
        </div>
      </div>`}

    ${v.isQuizSetup && html`
      <div class="page" style="padding:36px 40px 56px;display:flex;flex-direction:column;gap:28px;max-width:820px;box-sizing:border-box">
        <h1 style="margin:0;font-size:32px;font-weight:700">Quiz</h1>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="font-size:14px;font-weight:700;color:#86727a">Mode</div>
          ${v.modeCards.map(m => html`
            <button onClick=${m.go} style=${`display:flex;align-items:center;gap:18px;padding:18px 20px;border-radius:20px;border:2px solid ${m.border};background:${m.bg};text-align:left;font:inherit;color:#3b2b30;cursor:pointer`}>
              <span style=${`width:52px;height:52px;flex-shrink:0;border-radius:14px;background:${m.iconBg};color:${m.iconColor};display:grid;place-items:center;font-size:26px;${KANA_FONT}`}>${m.glyph}</span>
              <span style="display:flex;flex-direction:column;gap:3px;flex:1">
                <span style="font-size:18px;font-weight:700">${m.title}</span>
                <span style="font-size:14px;color:#86727a;text-wrap:pretty">${m.desc}</span>
              </span>
              <span style=${`width:22px;height:22px;border-radius:50%;border:2px solid ${m.border};display:grid;place-items:center;flex-shrink:0`}><span style=${`width:12px;height:12px;border-radius:50%;background:${m.dot}`}></span></span>
            </button>`)}
        </div>
        <div style=${`${card};border-radius:24px;padding:8px 24px;display:flex;flex-direction:column`}>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #f3e9eb;flex-wrap:wrap">
            <div style="font-size:16px;font-weight:500">Characters</div>
            ${segGroup(v.qScriptSeg, 16)}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #f3e9eb;flex-wrap:wrap">
            <div style="font-size:16px;font-weight:500">Include</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${v.setChips.map(o => html`<button onClick=${o.go} style=${`border:2px solid ${o.border};border-radius:12px;padding:0 16px;min-height:44px;font:inherit;font-size:15px;font-weight:700;background:${o.bg};color:${o.color};cursor:pointer`}>${o.label}</button>`)}
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #f3e9eb;flex-wrap:wrap">
            <div style="display:flex;flex-direction:column;gap:2px">
              <div style="font-size:16px;font-weight:500">Direction</div>
              ${v.dirLocked && html`<div style="font-size:13px;color:#a08d93">${v.dirNote}</div>`}
            </div>
            ${!v.dirLocked && segGroup(v.dirSeg, 16)}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;flex-wrap:wrap">
            <div style="font-size:16px;font-weight:500">Questions</div>
            ${segGroup(v.lenSeg, 18)}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
          <button onClick=${this.startQuiz} style=${`${primary};border-radius:16px;padding:0 40px;min-height:56px;font:inherit;font-size:18px;font-weight:700;cursor:pointer`}>Start quiz</button>
          <div style="font-size:14px;color:#86727a">${v.poolNote}</div>
        </div>
      </div>`}

    ${v.isQuizActive && html`
      <div class="page" style="padding:28px 40px 48px;display:flex;flex-direction:column;align-items:center;gap:20px;box-sizing:border-box">
        <div style="width:100%;max-width:760px;display:flex;align-items:center;gap:16px">
          <button onClick=${v.quit} aria-label="Quit quiz" style=${`width:44px;height:44px;border-radius:12px;${ghostBtn};font:inherit;font-size:18px;cursor:pointer`}>✕</button>
          <div style="font-size:16px;font-weight:700">${v.modeLabel}</div>
          <div style="margin-left:auto;font-size:15px;color:#86727a;font-variant-numeric:tabular-nums">${v.counter}</div>
        </div>
        <div style="width:100%;max-width:760px;height:8px;border-radius:4px;background:#f2e6e8;overflow:hidden">
          <div style=${`height:100%;width:${v.pct};background:#d0647d;border-radius:4px;transition:width .3s`}></div>
        </div>
        <div style=${`width:100%;max-width:760px;${card};border-radius:28px;padding:32px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:28px`}>
          <div style="font-size:14px;color:#a08d93">${v.promptHint}</div>
          ${v.promptIsKana
            ? html`<div style=${`${KANA_FONT};font-size:128px;line-height:1`}>${v.prompt}</div>`
            : html`<div style="font-size:72px;font-weight:700;line-height:1;color:#3b2b30">${v.prompt}</div>`}

          ${v.isMC && html`
            <div style=${`width:100%;display:grid;grid-template-columns:repeat(${v.mcCols},minmax(0,1fr));gap:12px`}>
              ${v.mcOpts.map(o => html`<button onClick=${o.go} style=${`min-height:84px;border-radius:18px;border:2px solid ${o.border};background:${o.bg};color:${o.color};${KANA_FONT};font-size:${o.size};cursor:pointer;opacity:${o.opacity};transition:background .15s,border-color .15s`}>${o.label}</button>`)}
            </div>`}

          ${v.isType && html`
            <input ref=${this.inpRef} value=${v.typed} onInput=${v.onType} onKeyDown=${v.onTypeKey} placeholder="type romaji" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="go" style=${`width:340px;max-width:100%;box-sizing:border-box;border:2px solid ${v.typeBorder};border-radius:18px;padding:16px 20px;font:inherit;font-size:30px;text-align:center;color:#3b2b30;background:#fff;outline:none`} />`}

          ${v.isWrite && html`
            <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;justify-content:center">
              <div class="write-pad" style="position:relative;width:360px;height:360px;background:#fff;border:2px solid #eee1e3;border-radius:24px;overflow:hidden">
                <div style="position:absolute;left:50%;top:16px;bottom:16px;border-left:2px dashed #f2e6e8"></div>
                <div style="position:absolute;top:50%;left:16px;right:16px;border-top:2px dashed #f2e6e8"></div>
                ${v.revealed && html`<div class="ghost" style=${`position:absolute;inset:0;display:grid;place-items:center;${KANA_FONT};font-size:250px;line-height:1;color:#f5ccd5`}>${v.ghost}</div>`}
                <canvas ref=${this.canvasRef} onPointerDown=${this.down} onPointerMove=${this.move} onPointerUp=${this.up} onPointerCancel=${this.up} style="position:absolute;inset:0;width:360px;height:360px;touch-action:none"></canvas>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <button onClick=${v.undo} style=${`width:76px;min-height:48px;border-radius:14px;${ghostBtn};font:inherit;font-size:15px;cursor:pointer`}>Undo</button>
                <button onClick=${v.clear} style=${`width:76px;min-height:48px;border-radius:14px;${ghostBtn};font:inherit;font-size:15px;cursor:pointer`}>Clear</button>
              </div>
            </div>`}

          <div style="width:100%;min-height:60px;display:flex;align-items:center;justify-content:center;gap:12px">
            ${v.answered && html`
              <div style=${`flex:1;display:flex;align-items:center;gap:10px;min-height:56px;padding:0 20px;border-radius:16px;background:${v.fbBg};color:${v.fbColor};font-size:17px;font-weight:700`}>${v.fbText}</div>
              <button onClick=${this.next} style=${`${primary};border-radius:16px;padding:0 32px;min-height:56px;font:inherit;font-size:17px;font-weight:700;cursor:pointer`}>${v.nextLabel}</button>`}
            ${v.showCheck && html`<button onClick=${v.check} style=${`${primary};border-radius:16px;padding:0 40px;min-height:56px;font:inherit;font-size:17px;font-weight:700;cursor:pointer`}>Check</button>`}
            ${v.showReveal && html`<button onClick=${v.reveal} style=${`${ghostBtn};border-radius:16px;padding:0 32px;min-height:56px;font:inherit;font-size:17px;font-weight:700;cursor:pointer`}>Reveal answer</button>`}
            ${v.showSelfMark && html`
              <button onClick=${v.markMiss} style="flex:1;border:none;background:#fbe5e1;color:#a8432f;border-radius:16px;min-height:56px;font:inherit;font-size:17px;font-weight:700;cursor:pointer">Not quite</button>
              <button onClick=${v.markGot} style="flex:1;border:none;background:#e3f2e7;color:#2f7a4a;border-radius:16px;min-height:56px;font:inherit;font-size:17px;font-weight:700;cursor:pointer">I got it</button>`}
          </div>
        </div>
      </div>`}

    ${v.isQuizDone && html`
      <div class="page" style="padding:56px 40px;display:flex;flex-direction:column;align-items:center;gap:24px;box-sizing:border-box">
        <div style=${`width:100%;max-width:620px;${card};border-radius:28px;padding:40px 36px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:20px`}>
          <div style="font-size:16px;color:#86727a">Quiz complete</div>
          <div style="font-size:72px;font-weight:700;line-height:1;color:#b44d66;font-variant-numeric:tabular-nums">${v.score}</div>
          <div style="font-size:16px;color:#86727a">${v.scorePct}</div>
          ${v.hasMissed && html`
            <div style="width:100%;display:flex;flex-direction:column;gap:10px;align-items:center;padding-top:8px;border-top:1px solid #f3e9eb">
              <div style="font-size:14px;font-weight:700;color:#86727a;padding-top:12px">To review</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
                ${v.missed.map(m => html`
                  <div style="display:flex;flex-direction:column;align-items:center;min-width:56px;padding:8px 10px;border-radius:14px;background:#fbe8ec">
                    <span style=${`${KANA_FONT};font-size:28px;line-height:1.2`}>${m.ch}</span>
                    <span style="font-size:12px;color:#86727a">${m.r}</span>
                  </div>`)}
              </div>
            </div>`}
          <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;padding-top:8px">
            ${v.hasMissed && html`<button onClick=${v.retryMissed} style=${`${primary};border-radius:16px;padding:0 28px;min-height:52px;font:inherit;font-size:16px;font-weight:700;cursor:pointer`}>Retry missed</button>`}
            <button onClick=${v.again} style=${`${ghostBtn};border-radius:16px;padding:0 28px;min-height:52px;font:inherit;font-size:16px;font-weight:700;cursor:pointer`}>Same settings again</button>
            <button onClick=${v.toSetup} style=${`${ghostBtn};border-radius:16px;padding:0 28px;min-height:52px;font:inherit;font-size:16px;font-weight:700;cursor:pointer`}>Change settings</button>
          </div>
        </div>
      </div>`}

    ${v.isPhrases && html`
      <div class="page" style="padding:36px 40px 56px;display:flex;flex-direction:column;gap:24px;max-width:900px;box-sizing:border-box">
        <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
          <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:240px">
            <h1 style="margin:0;font-size:32px;font-weight:700">Travel Phrases</h1>
            <div style="font-size:14px;color:#86727a">Furigana shows the reading above each kanji. Star the ones you want close at hand.</div>
          </div>
          <button onClick=${v.togglePhraseRomaji} style=${`${ghostBtn};border-radius:12px;padding:0 16px;min-height:44px;font:inherit;font-size:15px;cursor:pointer`}>${v.phraseRomajiLabel}</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${v.catChips.map(c => html`<button onClick=${c.go} style=${`border:none;border-radius:999px;padding:0 18px;min-height:44px;font:inherit;font-size:15px;font-weight:700;background:${c.bg};color:${c.color};cursor:pointer`}>${c.label}</button>`)}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${v.phrases.map(p => html`
            <div key=${p.key} style=${`display:flex;align-items:center;gap:16px;${card};border-radius:20px;padding:18px 16px 18px 24px`}>
              <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
                ${p.heard && html`<div style="align-self:flex-start;font-size:12px;font-weight:700;color:#86727a;background:#f2e6e8;border-radius:6px;padding:2px 8px">You'll hear</div>`}
                <div lang="ja" style=${`${KANA_FONT};font-size:24px;line-height:1.9;text-wrap:pretty`}>${p.segs.map(s => html`<ruby>${s.t}<rt style="font-size:12px;color:#b44d66;letter-spacing:0.02em">${s.rt}</rt></ruby>`)}</div>
                ${v.phraseRomaji && html`<div style="font-size:15px;color:#b44d66">${p.ro}</div>`}
                <div style="font-size:15px;color:#86727a">${p.en}</div>
              </div>
              <button onClick=${p.speak} style="width:52px;height:52px;flex-shrink:0;border-radius:14px;border:none;background:#fbe8ec;color:#b44d66;font:inherit;font-size:13px;font-weight:700;cursor:pointer">Play</button>
              <button onClick=${p.star} aria-label="Save phrase" style=${`width:52px;height:52px;flex-shrink:0;border-radius:14px;border:1px solid #eee1e3;background:#fff;color:${p.starColor};font-size:24px;cursor:pointer`}>${p.starGlyph}</button>
            </div>`)}
          ${v.noFavs && html`<div style="padding:48px 24px;text-align:center;color:#86727a;font-size:15px;border:2px dashed #eee1e3;border-radius:20px">No saved phrases yet. Tap ☆ on any phrase to save it here.</div>`}
        </div>
      </div>`}

    ${v.isProgress && html`
      <div class="page" style="padding:36px 40px 56px;display:flex;flex-direction:column;gap:28px;max-width:1000px;box-sizing:border-box">
        <h1 style="margin:0;font-size:32px;font-weight:700">Progress</h1>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
          ${v.tiles.map(t => html`
            <div style=${`${card};border-radius:20px;padding:20px 24px;display:flex;flex-direction:column;gap:6px`}>
              <div style="font-size:14px;color:#86727a">${t.label}</div>
              <div style="font-size:34px;font-weight:700;font-variant-numeric:tabular-nums">${t.value}</div>
            </div>`)}
        </div>
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          ${v.heat.map(h => html`
            <div style=${`flex:1 1 340px;${card};border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:14px`}>
              <div style="font-size:16px;font-weight:700">${h.title}</div>
              <div style="display:flex;flex-direction:column;gap:5px">
                ${h.rows.map(row => html`
                  <div style="display:flex;gap:5px">
                    ${row.map(c => html`<div style=${`flex:1 1 0;height:38px;border-radius:9px;background:${c.bg};color:${c.color};display:grid;place-items:center;${KANA_FONT};font-size:18px`}>${c.ch}</div>`)}
                  </div>`)}
              </div>
            </div>`)}
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#86727a;flex-wrap:wrap">
          <span>Not quizzed</span><span style="width:18px;height:18px;border-radius:5px;background:#f4ecec"></span>
          <span style="margin-left:10px">Low</span><span style="width:18px;height:18px;border-radius:5px;background:oklch(0.92 0.045 5)"></span><span style="width:18px;height:18px;border-radius:5px;background:oklch(0.8 0.09 5)"></span><span style="width:18px;height:18px;border-radius:5px;background:oklch(0.65 0.13 5)"></span><span>High accuracy</span>
        </div>
        ${v.weak.length > 0 && html`
          <div style=${`${card};border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:16px`}>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
              <div style="font-size:16px;font-weight:700">Needs practice</div>
              <button onClick=${v.quizWeak} style=${`${primary};border-radius:14px;padding:0 22px;min-height:48px;font:inherit;font-size:15px;font-weight:700;cursor:pointer`}>Quiz these</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${v.weak.map(w => html`
                <div style="display:flex;flex-direction:column;align-items:center;min-width:64px;padding:10px;border-radius:14px;background:#fbe8ec;gap:2px">
                  <span style=${`${KANA_FONT};font-size:28px;line-height:1.2`}>${w.ch}</span>
                  <span style="font-size:12px;color:#86727a">${w.acc}</span>
                </div>`)}
            </div>
          </div>`}
        <div>
          <button onClick=${v.reset} style="border:1px solid #eee1e3;background:#fff;color:#a8432f;border-radius:14px;padding:0 20px;min-height:44px;font:inherit;font-size:14px;cursor:pointer">Reset quiz history</button>
        </div>
      </div>`}

  </div>
</div>`;
  }
}

render(html`<${App} />`, document.getElementById('app'));
