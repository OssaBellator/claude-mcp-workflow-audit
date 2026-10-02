#!/usr/bin/env node
const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return i<0?[x,true]:[x.slice(0,i),x.slice(i+1)]}));
const n=(k,d)=>Number.isFinite(+args[k])?+args[k]:d;
const workflows=Math.max(1,n('workflows',1));
const integrations=Math.max(0,n('integrations',1));
const writes=String(args.writes||'approval').toLowerCase();
const tests=Math.max(1,n('tests',3));
const scheduled=String(args.scheduled||'false')==='true';
let points=2*workflows+integrations+Math.ceil(tests/3)+(scheduled?1:0)+(writes==='none'?0:writes==='approval'?2:4);
let band=points<=6?'small':points<=12?'medium':'large';
const guidance={
 small:{hours:'4–8',note:'one bounded workflow with limited integration complexity'},
 medium:{hours:'8–20',note:'multiple tools/workflows or consequential actions requiring stronger testing'},
 large:{hours:'20+',note:'multi-workflow system; split into milestones before quoting'}
}[band];
console.log(JSON.stringify({
  estimate_type:'planning-only',
  inputs:{workflows,integrations,writes,tests,scheduled},
  complexity_points:points,
  scope_band:band,
  indicative_engineering_hours:guidance.hours,
  note:guidance.note,
  pricing_rule:'Quote only after validating APIs, authentication, data boundaries, acceptance tests, and deployment/maintenance requirements.',
  excludes:['third-party usage fees','paid API plans','data migration','24/7 support','unbounded revisions']
},null,2));
