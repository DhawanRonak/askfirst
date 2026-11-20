# AskFirst

**When should an AI agent ask before acting?**

> Independent concept prototype for a product-management case study. Not affiliated with any company; all data is made up.

**Live demo:** _add your Vercel link here after deploying_  
**Product spec:** [PRD.md](PRD.md)

## The problem

AI agents now send messages, change calendars and spend money for people. Every action forces one decision: act, act and tell, ask first, or hand the last step back. AskFirst is a confirmation policy that makes that decision from a few properties of the action (can it be undone, how much money, who sees it, how sensitive, who started it), explains every decision in one sentence, and is tested against what people actually say they want.

## What the prototype does

- **Try the policy**: pick one of 40 actions or describe your own; see the decision, the reasons, and the screen the user would get. Every threshold is a slider.
- **Label mode**: a 6-minute research flow where participants say how they want each of 40 actions handled. Answers export as CSV.
- **Results**: a scorecard comparing the policy with the majority answer, with a confusion matrix, per-category breakdown and every disagreement listed.

## Run it

No build step and no dependencies. Open `index.html` in a browser.

Tests need Node 18 or later:

```
node eval/run_eval.mjs
node eval/extract_eval.mjs
```

To also score the live model:

```
GEMINI_API_KEY=... GEMINI_MODEL=... node eval/extract_eval.mjs --model
```

## Deploy

1. On [vercel.com](https://vercel.com), choose **Add New → Project** and import this repository.
2. Framework preset **Other**, no build command, no root directory. Deploy.
3. In **Settings → Environment Variables**, add `GEMINI_API_KEY` (from [Google AI Studio](https://aistudio.google.com/apikey)) and `GEMINI_MODEL` (a current Flash model name from the [models page](https://ai.google.dev/gemini-api/docs/models)), then redeploy.

Without the key the prototype still works, using a simple offline keyword reader, and says so on screen. Never put the key in any file in this repository.

Then paste the live link at the top of this README.

## Files

| File | What it is |
|---|---|
| `policy.js` | The policy engine, evaluation and the offline keyword reader (pure functions) |
| `tasks.js` | The 40 test actions |
| `index.html` | The prototype |
| `api/gemini.js` | Server function that calls the Gemini API, so the key never reaches the page |
| `eval/run_eval.mjs` | Scores the policy against labels in `eval/labels/` |
| `eval/extract_eval.mjs` | Scores how well text is turned into action properties (keyword reader, and the live model with `--model`) |
| `PRD.md` | Product requirements: problem, hypotheses, requirements, metrics, evaluation plan, risks |
| `base.css` | Shared styles |

## What is real and what is not

- The Results tab compares the policy with the author's own guesses until real participants complete Label mode. Those numbers are placeholders, not findings.
- The keyword reader is a deliberately crude offline baseline. The live model path needs an API key (see Deploy).

## Author

Ronak Dhawan · product management portfolio
