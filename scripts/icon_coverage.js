// Writes the seed-gloss part of docs/dadi/icon-coverage.md: for every distinct gloss in seed.json, which icon it gets (or none).
// Run from the repository root after build_icons.js:  node scripts/icon_coverage.js [seed.json] [icons.json]
'use strict';
const fs = require('fs'), path = require('path');
const root = process.cwd();
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const seed = JSON.parse(fs.readFileSync(args[0] || path.join(root, 'website/dadi/data/seed.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(args[1] || path.join(root, 'website/dadi/data/icons.json'), 'utf8'));
const DI = require(path.join(root, 'website/dadi/js/icons.js')); DI.use(data);
const glosses = new Map();
for (const e of seed.entries) { if (!glosses.has(e.gloss)) glosses.set(e.gloss, []); glosses.get(e.gloss).push(e.form); }
const rows = [...glosses].map(([g, forms]) => ({ g, forms, slug: DI.slugFor(g) })).sort((a, b) => a.g.localeCompare(b.g));
if (process.argv.includes('--json')) console.log(JSON.stringify(rows)); else {
  const hit = rows.filter((r) => r.slug);
  console.log('glosses:', rows.length, 'with icon:', hit.length, 'none:', rows.length - hit.length);
  for (const r of rows) console.log((r.slug || '-').padEnd(20), r.g);
}
