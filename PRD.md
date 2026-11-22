# PRD: AskFirst — when should an AI agent ask before acting?

Author: Ronak Dhawan · Status: concept, pre-research · Last updated: 16 Nov 2026
Product area this maps to: agentic assistants (for example Gemini's agent features). This is an independent concept and uses no company branding.

## 1. Problem
AI agents now send messages, change calendars and spend money for people. Each action forces one design decision: act, act and tell, ask first, or hand the last step back. Ask too often and the agent is slower than doing it yourself. Ask too rarely and one wrong payment or email destroys trust.

Today the rule is coarse. Google says its agent asks before "high-stakes" actions such as spending money or sending email, and its help page says the user remains responsible for the agent's actions, including unexpected purchases. Press coverage of the launch focused on exactly this line. A category rule ("all email, all money") treats a "thanks, got it" reply the same as a resignation letter, and a ₹90 recharge the same as a ₹25,000 transfer.

Sources: https://support.google.com/gemini/answer/16821166 · https://datacamp.com/blog/gemini-spark · https://www.technobezz.com/news/google-wants-gemini-to-replace-your-apps-but-trust-is-a-harder-sell

## 2. Who it is for
- Primary: people in India who already let an assistant draft or summarise, and are deciding whether to let it act.
- Secondary: the trust and safety team that must defend the rule when something goes wrong.

## 3. Hypotheses (not yet tested; the label study in section 8 tests them)
- H1. People's preference depends on a few properties of the action (can it be undone, how much money, who sees it, how sensitive, have I done it before, who started it), not on the app it happens in.
- H2. People agree with each other on most actions. If agreement is low, one global rule cannot work and the product needs per-user settings early.
- H3. Acting silently when someone wanted to be asked hurts trust far more than one extra prompt. The policy should be tuned to make that error rare, and accept some over-asking.
- H4. Instructions that arrive inside an email, message or web page must always need the user's OK, because that is the route for prompt-injection scams.

## 4. Goals and non-goals
Goals: a policy that is explainable in one sentence per decision; fewer prompts than "ask for everything"; near-zero silent actions that people wanted to approve.
Non-goals: building an agent; payment authentication (UPI PIN and bank rules stay as they are); per-app permission screens.

## 5. The policy (implemented in `policy.js`)
Four levels: **Just do it**, **Do it and tell me** (receipt plus Undo), **Ask me first**, **Let me do it myself** (agent prepares, user finishes).

Score = undoability (0/2/4) + money (0/1/3/5 by band) + audience (0/1/3/4) + sensitivity (0/2/4) + precedent (0/−1/−2) + who started it (0/+2/+3) − standing rule (3).
Score ≤1 → just do it; 2–3 → do and tell; 4–11 → ask; 12+ → hand off.

Hard rules that override the score and that no standing rule can relax:
1. Anything needing a PIN, OTP, password or ID document → hand off.
2. Money above the hand-off limit (default ₹10,000) → hand off.
3. Any risky action triggered by someone else's content → at least ask.
4. Money moves without a prompt only if the user asked just now and it is small (default ≤₹200), or a standing rule covers it (default ≤₹2,000). Even then there is always a receipt.
5. Public and permanent → at least ask.

Every threshold is a setting, so the trade-off can be shown live.

## 6. Requirements
P0
- Decision plus a plain-language reason for every action ("Why I am asking").
- Receipt and Undo on every "do and tell" action that can be undone.
- "Don't ask again for things like this" creates a standing rule, shown only when no hard rule applies.
- Activity log of everything done silently.
P1
- Standing rules page: view, edit, delete; each rule has a money cap and an expiry.
- Weekly digest of silent actions.
P2
- Personal strictness setting; the policy learns from Undo and "ask me next time".

## 7. Success metrics
- North star: share of agent actions completed without a correction (no Undo, no complaint) per week.
- Guardrail 1: silent actions the user later undoes or reports, per 1,000 actions. Target near zero.
- Guardrail 2: prompts per completed task. Should fall against an "ask for everything" baseline.
- Counter-metric: approval taps under 1 second (a sign people have stopped reading prompts).

## 8. Evaluation plan (the prototype does this)
1. **Label study.** 10–15 people use Label mode to say what they want for 40 actions (about 6 minutes each). Output: majority answer per action and how much people agree.
2. **Policy vs people.** Results tab and `eval/run_eval.mjs` report exact match, "asks too little", "silent when people wanted to be asked", and "asks too much", by category, for several policy settings.
3. **Reading accuracy.** `eval/extract_eval.mjs` scores how well a sentence is turned into the six properties, per property, for the keyword baseline and for the live model. The key number is how often a reading error makes the final decision less cautious.
Until step 1 is done, every number in the tool is a comparison with the author's guesses and must not be quoted as a finding.

## 9. Risks
- Stated preference is not behaviour. Mitigation: follow up with 5 people using the Try tab and think-aloud.
- The 40 actions are the author's selection. Mitigation: add 10 actions suggested by participants.
- Prompt fatigue makes "ask" meaningless. Mitigation: counter-metric above; cap prompts per task.
- A model misreads an action as low risk. Mitigation: hard rules read from structured tool calls (amount, recipient), not from model text.

## 10. Open questions
- Should the hand-off limit differ for a first-time payee?
- How should a standing rule expire?
- What does Undo mean for a sent message?

## 11. Research script (10 minutes after labelling)
1. Which two actions were hardest to decide? Why?
2. Tell me about a time an app did something for you that you did not expect.
3. For "pay ₹149 music subscription": what would have to be true for you to never be asked?
4. If the assistant got one of these wrong, what would you do next?

## Implemented experience (22 November 2026)

The first screen explains the confirmation policy and provides a live decision demo with rotating example scenarios. The demo evaluates decisions only; real execution, receipts, Undo, activity logs and standing-rule management in section 6 remain future integration requirements.

A four-step first-visit walkthrough can be skipped and reopened from the header. Demo properties and policy settings persist locally. Custom text extraction times out after eight seconds and falls back to the offline reader, with a request to review the properties.

Label mode presents one of 40 actions per screen, saves each answer immediately, resumes by participant code, supports previous-answer editing and exports CSV. Local CSV import merges by participant and action, replacing duplicate answers. Data stays on the device unless exported; no central collection is implemented.

Results uses collected labels only, never author guesses. It charts exact match, under-asking and over-asking against the most common answer per action. Ties choose the more cautious answer. It marks samples with fewer than three participants as insufficient for stable conclusions, and computes inter-participant agreement only for actions with at least two participant codes. This threshold is a product display rule, not a claim of statistical sufficiency.

External-content safeguards now cover irreversible actions even when private and without money or sensitive data. All such actions require at least approval. A reset control clears saved local work after confirmation.
