import assert from 'node:assert/strict';
import {buildAnalysisInput, processAssessment} from './assessment.mjs';

const config = {
  rules: [
    {id:'cash-pressure', when:[{field:'cashFlow', op:'lte', value:2}], includeContent:['benchmark-cash','rec-cash']},
    {id:'manual-overload', when:[{field:'manualHours', op:'gte', value:8}], includeContent:['rec-automation']}
  ],
  content: {
    'benchmark-cash': {kind:'benchmark', text:'Approved benchmark: maintain a documented cash reserve policy.'},
    'rec-cash': {kind:'recommendation', text:'Review payment timing and cash forecasting weekly.'},
    'rec-automation': {kind:'recommendation', text:'Automate one repetitive workflow before adding more tooling.'}
  }
};

const submission = {
  requestId:'demo-001',
  email:'owner@example.test',
  questionnaireVersion:'v2',
  answers:{cashFlow:2, manualHours:11}
};

const input = buildAnalysisInput(submission, config);
assert.deepEqual(input.matchedRuleIds, ['cash-pressure','manual-overload']);
assert.equal(input.controlledContent.length, 3);

const aiClient = {
  async generate(input) {
    return {
      summary:'Cash-flow pressure and manual workload are the two highest-priority areas.',
      priorities:['Cash visibility','Manual workload'],
      recommendations:[
        {text:'Introduce a weekly cash review.', evidenceIds:['benchmark-cash','rec-cash']},
        {text:'Automate one repetitive workflow.', evidenceIds:['rec-automation']}
      ]
    };
  }
};

const sent = new Map();
const delivery = {
  async send({email, reportHtml}) {
    assert.equal(email.to, 'owner@example.test');
    assert.match(reportHtml, /Personalized assessment report/);
    const id='delivery-1';
    sent.set(id, {email, reportHtml});
    return {id};
  },
  async verify(id) { return sent.has(id); }
};

const runs = new Map();
const runStore = {
  async get(id){ return runs.get(id); },
  async put(id,value){ runs.set(id,value); }
};

const first = await processAssessment({submission, config, aiClient, delivery, runStore});
assert.equal(first.status, 'complete');
assert.equal(first.verified, true);
assert.equal(first.deduplicated, false);

const second = await processAssessment({submission, config, aiClient, delivery, runStore});
assert.equal(second.deduplicated, true);
assert.equal(sent.size, 1);

await assert.rejects(
  () => processAssessment({
    submission:{...submission, answers:{cashFlow:5,manualHours:1}},
    config, aiClient, delivery, runStore
  }),
  /requestId reused with different payload/
);

const badAi = {async generate(){return {summary:'x',priorities:[],recommendations:[{text:'bad',evidenceIds:['invented-stat']}]};}};
await assert.rejects(
  () => processAssessment({
    submission:{...submission,requestId:'demo-002'},
    config, aiClient:badAi, delivery, runStore
  }),
  /uncontrolled evidence/
);

console.log('ok - assessment workflow validates, constrains evidence, deduplicates, delivers, and verifies');
