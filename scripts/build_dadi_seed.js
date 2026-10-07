// Builds website/dadi/data/seed.json: the built-in offline copy of the project's words and sentences.
// Run from the repository root:  node scripts/build_dadi_seed.js
// The app refreshes from GitHub on its own; this copy only matters for first load and offline use.
const fs = require('fs'), path = require('path');
const D = require('../website/dadi/js/data.js');
const root = path.resolve(__dirname, '..');
function walk(dir, out) { if (!fs.existsSync(dir)) return out; for (const f of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, f.name); if (f.isDirectory()) walk(p, out); else out.push(p); } return out; }
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const files = walk(root, []).map(rel).filter((p) => D.WANTED.some((re) => re.test(p))).sort();
const entries = [], problems = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(root, f), 'utf8');
  const parsed = /\.ya?ml$/.test(f) ? D.parseSimpleYAML(text) : D.parseJSONL(text);
  parsed.errors.forEach((e) => problems.push(f + ' ' + e));
  for (const rec of parsed.records) { const n = D.normalize(rec, f); if (n) entries.push(n); }
}
const out = { builtAt: new Date().toISOString(), files, entries };
fs.mkdirSync(path.join(root, 'website/dadi/data'), { recursive: true });
fs.writeFileSync(path.join(root, 'website/dadi/data/seed.json'), JSON.stringify(out));
console.log('seed: ' + entries.length + ' entries from ' + files.length + ' files' + (problems.length ? '; ' + problems.length + ' problems: ' + problems.join(' | ') : ''));
