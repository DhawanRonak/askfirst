// Scores how well a sentence is turned into policy attributes, per attribute.
// node eval/extract_eval.mjs                 -> keyword reader only (offline)
// GEMINI_API_KEY=... GEMINI_MODEL=... node eval/extract_eval.mjs --model   -> also scores the live model
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const A = require('../policy.js'), TASKS = require('../tasks.js');
const KEYS = ['reversible', 'money', 'audience', 'sensitive', 'precedent', 'source', 'credential'];
const gold = t => A.decide(t).action;
async function viaModel(text) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: A.EXTRACT_SYSTEM }] }, contents: [{ role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } }) });
  const d = await r.json(); if (!r.ok) throw new Error(d.error?.message);
  return JSON.parse(d.candidates[0].content.parts.map(p => p.text || '').join('').replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, ''));
}
async function score(name, fn) {
  const hit = Object.fromEntries(KEYS.map(k => [k, 0])); let sameDecision = 0, unsafe = 0;
  for (const t of TASKS) {
    const g = gold(t), p = A.decide(await fn(t.text)).action;
    KEYS.forEach(k => { if (String(g[k]) === String(p[k])) hit[k]++; });
    const dg = A.decide(g).levelIndex, dp = A.decide(p).levelIndex;
    if (dg === dp) sameDecision++; if (dp < dg) unsafe++;
  }
  console.log(`\n${name}`); KEYS.forEach(k => console.log(`  ${k.padEnd(11)} ${(hit[k] / TASKS.length * 100).toFixed(0)}%`));
  console.log(`  -> same final decision as gold attributes: ${(sameDecision / TASKS.length * 100).toFixed(0)}% | less cautious than gold: ${(unsafe / TASKS.length * 100).toFixed(0)}%`);
}
await score('Keyword reader (offline baseline)', async t => A.heuristicParse(t));
if (process.argv.includes('--model')) await score('Live model: ' + process.env.GEMINI_MODEL, viaModel);
