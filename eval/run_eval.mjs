// Usage: node eval/run_eval.mjs            (reads every CSV in eval/labels/)
// Compares the policy with the majority answer per action and prints the scorecard.
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url), here = path.dirname(fileURLToPath(import.meta.url));
const A = require('../policy.js'), TASKS = require('../tasks.js');
const dir = path.join(here, 'labels');
let rows = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.csv'))) rows = rows.concat(A.parseCsv(fs.readFileSync(path.join(dir, f), 'utf8')));
let truth = {};
if (rows.length) {
  const m = A.majority(rows); for (const id in m) truth[id] = m[id].label;
  const agree = Object.values(m).reduce((s, x) => s + x.share, 0) / Object.keys(m).length;
  console.log(`Participants: ${new Set(rows.map(r => r.participant)).size} | actions labelled: ${Object.keys(m).length} | agreement with majority: ${(agree * 100).toFixed(0)}%`);
} else {
  console.log('NO LABEL FILES FOUND in eval/labels/. Using the author\'s guesses as a placeholder. These are not research findings.');
  TASKS.forEach(t => truth[t.id] = t.guess);
}
const pc = x => (x * 100).toFixed(0).padStart(3) + '%';
const show = (name, cfg) => { const r = A.evaluate(TASKS, truth, cfg); console.log(`${name.padEnd(28)} match ${pc(r.exact)} | asks too little ${pc(r.underAsk)} | silent when ask wanted ${pc(r.silentWhenPeopleWantedAsk)} | asks too much ${pc(r.overAsk)}`); return r; };
console.log('\nPolicy variants (the trade-off to discuss):');
const base = show('Default', {});
show('Cautious (strictness +2)', { strictness: 2 });
show('Relaxed (strictness -2)', { strictness: -2 });
show('Always ask for any money', { smallCap: 0, midCap: 0 });
console.log('\nDisagreements under the default policy:');
for (const m of base.misses) console.log(`  #${String(m.id).padStart(2)} ${m.kind.padEnd(10)} people: ${m.people.padEnd(7)} policy: ${m.policy.padEnd(7)} ${m.text}`);
