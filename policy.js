// AskFirst policy engine. Pure functions, no DOM. Works in the browser (window.AskFirst) and in Node (require).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AskFirst = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const LEVELS = ['ACT', 'NOTIFY', 'ASK', 'HANDOFF'];
  const LEVEL_TEXT = {
    ACT: 'Just do it',
    NOTIFY: 'Do it and tell me',
    ASK: 'Ask me first',
    HANDOFF: 'Let me do it myself'
  };
  // Every number here is a product decision. The Results tab shows what changing them does.
  const DEFAULT_CONFIG = {
    smallCap: 200,     // INR. A direct instruction at or under this can go ahead with a notice.
    midCap: 2000,      // INR. A standing rule can cover payments up to this.
    hardCap: 10000,    // INR. Above this the agent prepares and the user pays.
    strictness: 0,     // Added to every score. Positive = more cautious.
    standingDiscount: 3
  };
  const W = {
    reversible: { yes: 0, partly: 2, no: 4 },
    audience: { self: 0, known: 1, new: 3, public: 4 },
    sensitive: { none: 0, personal: 2, high: 4 },
    precedent: { never: 0, once: -1, routine: -2 },
    source: { user: 0, inferred: 2, external: 3 }
  };
  const FIELDS = {
    reversible: ['yes', 'partly', 'no'],
    audience: ['self', 'known', 'new', 'public'],
    sensitive: ['none', 'personal', 'high'],
    precedent: ['never', 'once', 'routine'],
    source: ['user', 'inferred', 'external']
  };

  function normalise(a) {
    return {
      reversible: a.reversible || 'yes', audience: a.audience || 'self', sensitive: a.sensitive || 'none',
      precedent: a.precedent || 'never', source: a.source || 'user',
      money: Math.max(0, Number(a.money) || 0), standing: !!a.standing, credential: !!a.credential
    };
  }
  function moneyPoints(m, c) { return m <= 0 ? 0 : m <= c.smallCap ? 1 : m <= c.midCap ? 3 : 5; }

  function decide(action, config) {
    const c = Object.assign({}, DEFAULT_CONFIG, config || {});
    const a = normalise(action);
    const reasons = [];
    const add = (pts, why) => { if (pts !== 0) reasons.push({ pts, why }); return pts; };
    let s = 0;
    s += add(W.reversible[a.reversible], a.reversible === 'no' ? 'Cannot be undone' : 'Only partly undoable');
    s += add(moneyPoints(a.money, c), 'Spends ₹' + a.money);
    s += add(W.audience[a.audience], { known: 'Reaches someone you know', new: 'Reaches new or many people', public: 'Visible to the public' }[a.audience]);
    s += add(W.sensitive[a.sensitive], a.sensitive === 'high' ? 'Financial, health or identity data' : 'Personal information');
    s += add(W.precedent[a.precedent], a.precedent === 'routine' ? 'You do this routinely with the agent' : 'You have approved this once before');
    s += add(W.source[a.source], a.source === 'external' ? 'Triggered by someone else’s content, not by you' : 'The agent inferred this; you did not ask');
    const externalRisky = a.source === 'external' && (a.money > 0 || a.audience !== 'self' || a.sensitive !== 'none');
    if (a.standing && !externalRisky) s += add(-c.standingDiscount, 'Covered by a standing rule you set');
    s += add(c.strictness, 'Strictness setting');

    let level = s <= 1 ? 0 : s <= 3 ? 1 : s <= 11 ? 2 : 3;
    const floors = [];
    const floor = (lvl, why) => { floors.push({ level: LEVELS[lvl], why }); if (lvl > level) level = lvl; };
    // Hard rules. These override the score and cannot be relaxed by a standing rule.
    if (a.credential) floor(3, 'Needs a PIN, OTP, password or ID document: the agent never handles these');
    if (a.money > c.hardCap) floor(3, 'Above the ₹' + c.hardCap + ' hand-off limit');
    if (externalRisky) floor(2, 'Instructions that arrive inside emails, messages or web pages always need your OK');
    if (a.money > 0) {
      const directSmall = a.source === 'user' && a.money <= c.smallCap;
      const coveredByRule = a.standing && a.source !== 'external' && a.money <= c.midCap;
      floor(directSmall || coveredByRule ? 1 : 2,
        directSmall ? 'Small payment you asked for just now: no second prompt, but always a receipt'
          : coveredByRule ? 'Payment inside your standing rule: no prompt, but always a receipt'
            : 'Money moves only with your OK unless a standing rule covers it');
    }
    if (a.audience === 'public' && a.reversible === 'no') floor(2, 'Public and permanent');
    return { level: LEVELS[level], levelIndex: level, score: s, reasons, floors, action: a };
  }

  // ---- Evaluation: compare the policy with what people said they want ----
  // labels: array of { participant, task_id, label } where label is one of LEVELS.
  function majority(labels) {
    const by = {};
    for (const l of labels) {
      if (!LEVELS.includes(l.label)) continue;
      (by[l.task_id] = by[l.task_id] || []).push(l.label);
    }
    const out = {};
    for (const id in by) {
      const counts = [0, 0, 0, 0];
      by[id].forEach(x => counts[LEVELS.indexOf(x)]++);
      let best = 0;
      for (let i = 1; i < 4; i++) if (counts[i] >= counts[best]) best = i; // ties go to the more cautious level
      out[id] = { label: LEVELS[best], n: by[id].length, share: counts[best] / by[id].length, counts };
    }
    return out;
  }

  function evaluate(tasks, truth, config) {
    // truth: { task_id: 'LEVEL' }
    const matrix = [0, 1, 2, 3].map(() => [0, 0, 0, 0]); // rows = people, cols = policy
    const byCat = {}; const misses = [];
    let n = 0, exact = 0, under = 0, over = 0, severeUnder = 0;
    for (const t of tasks) {
      const want = truth[t.id]; if (!want) continue;
      const h = LEVELS.indexOf(want), p = decide(t, config).levelIndex;
      matrix[h][p]++; n++;
      const cat = (byCat[t.cat] = byCat[t.cat] || { n: 0, exact: 0, under: 0, over: 0 });
      cat.n++;
      if (p === h) { exact++; cat.exact++; }
      else if (p < h) { under++; cat.under++; if (h >= 2 && p <= 1) severeUnder++; misses.push({ id: t.id, text: t.text, people: want, policy: LEVELS[p], kind: 'under-asks' }); }
      else { over++; cat.over++; misses.push({ id: t.id, text: t.text, people: want, policy: LEVELS[p], kind: 'over-asks' }); }
    }
    const pct = x => n ? x / n : 0;
    return { n, exact: pct(exact), underAsk: pct(under), overAsk: pct(over), silentWhenPeopleWantedAsk: pct(severeUnder), matrix, byCat, misses };
  }

  function parseCsv(text) {
    const rows = text.trim().split(/\r?\n/).map(r => r.split(',').map(x => x.trim()));
    const head = rows.shift().map(h => h.toLowerCase());
    const ix = k => head.indexOf(k);
    return rows.filter(r => r.length >= 3).map(r => ({ participant: r[ix('participant')], task_id: Number(r[ix('task_id')]), label: r[ix('label')], ms: Number(r[ix('ms')]) || 0 }));
  }

  // Offline stand-in for the model: turns a sentence into attributes with keyword rules.
  // It is deliberately crude. The live path (api/gemini.js) replaces it; eval/extract_eval.mjs scores both.
  function heuristicParse(text) {
    const t = ' ' + text.toLowerCase() + ' ';
    const has = (...w) => w.some(x => t.includes(x));
    const m = t.replace(/,/g, '').match(/(?:₹|rs\.?|inr)\s*(\d+)/);
    const a = { money: m ? Number(m[1]) : 0 };
    a.credential = has(' otp', ' pin ', 'password', 'aadhaar', ' pan ', 'passport', 'bank details');
    a.audience = has('public', 'instagram', 'post ', 'anyone with the link') ? 'public'
      : has('reply all', 'attendees', 'everyone', 'group', 'recruiter', 'customer', 'application', 'agent you') ? 'new'
        : has('email', 'message', 'send', 'reply', 'share', 'invite', 'friend', 'landlord', 'clinic', 'whatsapp', 'forward') ? 'known' : 'self';
    a.reversible = has('draft', 'cart', 'rename', 'sort', 'back up', 'archive', 'dark mode', 'block ', 'coupon') ? 'yes'
      : has('delete', 'send', 'pay ', 'transfer', 'post ', 'submit', 'reply', 'email', 'buy ', 'forward', 'decline') ? 'no' : 'partly';
    a.sensitive = a.credential || has('bank', 'health', 'medical', 'salary') ? 'high' : has('photo', 'resume', 'wedding', 'moving out', 'landlord') ? 'personal' : 'none';
    a.source = has('email says', 'message says', 'asked for it in', 'instruction') ? 'external' : has('when ', 'you didn', 'dropped in price', 'runs out') ? 'inferred' : 'user';
    a.precedent = has('every month', 'as last week', 'same ', 'monthly', 'already use') ? 'routine' : 'never';
    a.standing = false;
    return a;
  }

  const EXTRACT_SYSTEM = 'You convert a described action an AI assistant might take for a user into JSON attributes. '
    + 'Return only JSON with keys: reversible ("yes"|"partly"|"no"), money (number, INR, 0 if none), '
    + 'audience ("self"|"known"|"new"|"public"; "new" also covers many recipients), sensitive ("none"|"personal"|"high"; high = financial, health, identity), '
    + 'precedent ("never"|"once"|"routine"), source ("user" if the user asked directly, "inferred" if the assistant decided on its own, "external" if the instruction came from an email, message or web page), '
    + 'credential (true if it needs a PIN, OTP, password or identity document), standing (true only if the text says the user set a standing rule).';

  return { LEVELS, LEVEL_TEXT, DEFAULT_CONFIG, FIELDS, decide, majority, evaluate, parseCsv, heuristicParse, EXTRACT_SYSTEM };
});
