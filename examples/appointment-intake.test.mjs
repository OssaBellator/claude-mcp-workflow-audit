import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('./appointment-intake.md', import.meta.url),'utf8');
const must=['read-only','approval','bounded-auto','do **not** create a second event','ambiguous time zone','duplicate request ID','verified'];
for(const x of must) if(!s.includes(x)) throw new Error('missing: '+x);
const writeSteps=(s.match(/Create exactly one calendar event/g)||[]).length;
if(writeSteps!==1) throw new Error('calendar create contract must be singular');
console.log('ok - appointment workflow has action boundaries, idempotency, recovery, and verification');
