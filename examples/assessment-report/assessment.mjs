import {createHash} from 'node:crypto';

export function validateSubmission(submission) {
  const required = ['requestId', 'email', 'questionnaireVersion', 'answers'];
  for (const key of required) {
    if (submission?.[key] === undefined || submission?.[key] === null || submission?.[key] === '') {
      throw new Error(`missing required field: ${key}`);
    }
  }
  if (typeof submission.answers !== 'object' || Array.isArray(submission.answers)) {
    throw new Error('answers must be an object');
  }
  return submission;
}

export function evaluateRules(answers, rules) {
  const matches = [];
  for (const rule of rules) {
    const ok = rule.when.every(({field, op = 'eq', value}) => {
      const actual = answers[field];
      if (op === 'eq') return actual === value;
      if (op === 'gte') return Number(actual) >= Number(value);
      if (op === 'lte') return Number(actual) <= Number(value);
      if (op === 'includes') return Array.isArray(actual) && actual.includes(value);
      throw new Error(`unsupported rule operator: ${op}`);
    });
    if (ok) matches.push(rule.id);
  }
  return matches;
}

function selectControlledContent(config, matchedRuleIds) {
  const selected = [];
  for (const id of matchedRuleIds) {
    const rule = config.rules.find((item) => item.id === id);
    if (!rule) throw new Error(`unknown matched rule: ${id}`);
    for (const contentId of rule.includeContent ?? []) {
      const block = config.content[contentId];
      if (!block) throw new Error(`rule ${id} references missing content: ${contentId}`);
      selected.push({id: contentId, ...block});
    }
  }
  return selected;
}

export function buildAnalysisInput(submission, config) {
  validateSubmission(submission);
  const matchedRuleIds = evaluateRules(submission.answers, config.rules);
  const controlledContent = selectControlledContent(config, matchedRuleIds);
  return {
    requestId: submission.requestId,
    questionnaireVersion: submission.questionnaireVersion,
    answers: submission.answers,
    matchedRuleIds,
    controlledContent,
    constraints: {
      noInventedBenchmarks: true,
      citeControlledContentIds: true,
      outputSchema: {
        summary: 'string',
        priorities: 'string[]',
        recommendations: '[{text:string, evidenceIds:string[]}]'
      }
    }
  };
}

export async function analyzeSubmission({submission, config, aiClient}) {
  const input = buildAnalysisInput(submission, config);
  const result = await aiClient.generate(input);
  if (!result || typeof result.summary !== 'string' || !Array.isArray(result.recommendations)) {
    throw new Error('AI response failed schema validation');
  }
  const allowedIds = new Set(input.controlledContent.map((x) => x.id));
  for (const rec of result.recommendations) {
    if (!Array.isArray(rec.evidenceIds) || rec.evidenceIds.some((id) => !allowedIds.has(id))) {
      throw new Error('AI response referenced uncontrolled evidence');
    }
  }
  return {input, result};
}

export function renderReportHtml({submission, analysis}) {
  const recs = analysis.result.recommendations
    .map((r) => `<li>${escapeHtml(r.text)} <small>[${r.evidenceIds.join(', ')}]</small></li>`)
    .join('');
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Assessment report</title>
<style>body{font-family:Arial,sans-serif;max-width:760px;margin:48px auto;line-height:1.5;color:#172033}h1{margin-bottom:4px}.meta{color:#61708a}.card{border:1px solid #d9e1ec;border-radius:12px;padding:20px;margin:20px 0}</style>
</head><body>
<h1>Personalized assessment report</h1>
<p class="meta">Request ${escapeHtml(submission.requestId)} · Version ${escapeHtml(submission.questionnaireVersion)}</p>
<div class="card"><h2>Summary</h2><p>${escapeHtml(analysis.result.summary)}</p></div>
<div class="card"><h2>Priorities</h2><ul>${analysis.result.priorities.map((x)=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
<div class="card"><h2>Recommendations</h2><ul>${recs}</ul></div>
</body></html>`;
}

export function buildEmail({submission}) {
  return {
    to: submission.email,
    subject: 'Your assessment report',
    text: 'Your personalized assessment report is attached. Reply if you would like help interpreting the recommendations.'
  };
}

export async function processAssessment({submission, config, aiClient, delivery, runStore}) {
  validateSubmission(submission);
  const fingerprint = createHash('sha256').update(JSON.stringify(submission)).digest('hex');
  const prior = await runStore.get(submission.requestId);
  if (prior) {
    if (prior.fingerprint !== fingerprint) throw new Error('requestId reused with different payload');
    return {...prior, deduplicated: true};
  }

  const analysis = await analyzeSubmission({submission, config, aiClient});
  const html = renderReportHtml({submission, analysis});
  const email = buildEmail({submission});
  const deliveryResult = await delivery.send({email, reportHtml: html});
  const completed = {
    status: 'complete',
    requestId: submission.requestId,
    fingerprint,
    matchedRuleIds: analysis.input.matchedRuleIds,
    deliveryId: deliveryResult.id,
    verified: Boolean(await delivery.verify(deliveryResult.id)),
    deduplicated: false
  };
  if (!completed.verified) throw new Error('delivery verification failed');
  await runStore.put(submission.requestId, completed);
  return completed;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}
