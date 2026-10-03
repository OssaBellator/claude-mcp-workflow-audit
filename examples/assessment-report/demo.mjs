import {mkdir, writeFile} from 'node:fs/promises';
import {processAssessment, buildAnalysisInput, renderReportHtml} from './assessment.mjs';

const config = {
  rules: [
    {id:'manual-overload', when:[{field:'manualHours',op:'gte',value:8}], includeContent:['manual-work']},
    {id:'followup-gap', when:[{field:'missedFollowups',op:'gte',value:3}], includeContent:['followup']}
  ],
  content: {
    'manual-work': {kind:'recommendation', text:'Automate one repetitive workflow before adding more tooling.'},
    'followup': {kind:'recommendation', text:'Use a single follow-up queue with explicit ownership and due dates.'}
  }
};

const submission = {
  requestId:'sample-business-001',
  email:'owner@example.test',
  questionnaireVersion:'v1',
  answers:{manualHours:12, missedFollowups:4}
};

const aiClient = {async generate(input){
  return {
    summary:'Manual workload and missed follow-ups are the clearest operational constraints.',
    priorities:['Reduce repetitive handling','Make follow-up ownership explicit'],
    recommendations: input.controlledContent.map((x)=>({text:x.text,evidenceIds:[x.id]}))
  };
}};

const deliveries=new Map();
const delivery={
  async send(payload){const id='sample-delivery-001';deliveries.set(id,payload);return{id};},
  async verify(id){return deliveries.has(id);}
};
const runs=new Map();
const runStore={async get(id){return runs.get(id)},async put(id,v){runs.set(id,v)}};

await mkdir(new URL('./sample-output/', import.meta.url), {recursive:true});
const analysis={input:buildAnalysisInput(submission,config),result:await aiClient.generate(buildAnalysisInput(submission,config))};
await writeFile(new URL('./sample-output/report.html', import.meta.url), renderReportHtml({submission,analysis}));
const result=await processAssessment({submission,config,aiClient,delivery,runStore});
await writeFile(new URL('./sample-output/run-result.json', import.meta.url), JSON.stringify(result,null,2)+'\n');
console.log(result);
