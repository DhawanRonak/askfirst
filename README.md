# AskFirst

AskFirst explains when an AI agent should act, act and tell you, ask for approval, or hand the final step back. It is for people exploring agent permissions and researchers collecting preferences about those boundaries.

## Features

- Live policy demo with 40 structured scenarios, rotating examples, editable properties, configurable thresholds and plain-language reasons.
- Skippable four-step first-visit tour, reopenable from **How it works**.
- Optional AI text reader with an eight-second timeout and offline keyword fallback. Review extracted properties before relying on a decision.
- One-action-per-screen survey with progress, previous-answer editing and automatic local saving after every answer.
- CSV import/export, participant-code deduplication, policy agreement chart and a clear insufficient-labels state.
- Demo settings, survey progress, answers and tour completion persist in localStorage. Reset removes this application's saved work after confirmation.

## Run and test

No framework, dependencies or build step. Serve this folder with Python:

```sh
python -m http.server 4173
```

Open `http://localhost:4173`. Static hosting supports all core features; `/api/gemini` is available on Cloudflare Pages when configured.

With Node 18 or later:

```sh
node --test eval/policy.test.cjs
node eval/run_eval.mjs
node eval/extract_eval.mjs
```

The rule tests assert safeguards, payment boundaries, CSV validation and vote deduplication. The evaluation scripts report descriptive comparisons; they are not accuracy pass/fail tests. Put exported research CSVs in `eval/labels/` to evaluate them. When that folder is absent, the command explicitly reports its author-guess baseline. The browser Results screen never substitutes those guesses.

Optional model extraction evaluation uses server environment variables `GEMINI_API_KEY` and `GEMINI_MODEL` with `node eval/extract_eval.mjs --model`.

## Deploy on Cloudflare Pages

Connect this repository to a Pages project. Choose framework **None**, build command `exit 0`, and output directory `/`. No build artifacts are needed.

For AI extraction, add `GEMINI_API_KEY` as an encrypted secret and `GEMINI_MODEL` as a server variable, then redeploy. `functions/api/gemini.js` calls the provider on the server. Never put an API key in client code. Without these settings, structured scenarios and the offline reader continue to work.

## What is real and what is not

The policy calculation, editable rules, local survey storage, CSV exchange and agreement calculation work. No actions execute against real apps: the demo cannot send messages, make payments, undo external actions or authenticate. A standing-rule checkbox describes an assumed permission; it does not create an agent integration.

The 40 scenarios and their legacy `guess` labels are authored examples, not participant findings. Results uses only answers saved or imported on this device. Fewer than three participants is explicitly marked insufficient for a stable conclusion; this is a display threshold, not a statistical guarantee. Inter-participant agreement is reported only on actions with at least two independent participant codes. Ties select the more cautious response, and each action has equal weight.

Answers stay in this browser unless exported. There is no account, shared database or automatic collection from friends. Use a separate code for each person and exchange CSV files to combine responses. Codes are not verified identities. Clearing browser data can remove answers, so export research data regularly. Text entered into the optional AI reader is sent to the configured server and provider; structured scenario selection works locally.

The keyword reader is imperfect; AI extraction may also misread context. Neither is a production authorization boundary. See [PRD.md](PRD.md) for the policy specification and research hypotheses.
