import assert from 'node:assert/strict';
import {prepareLeadPlan, executeApprovedPlan} from './approved-write.mjs';

class MemoryCrm {
  constructor(){this.rows=new Map();this.seq=0;}
  async findByEmail(email){return [...this.rows.values()].find(x=>x.email===email)??null;}
  async get(id){return this.rows.get(id)??null;}
  async create(row){const saved={id:`crm-${++this.seq}`,...row};this.rows.set(saved.id,saved);return saved;}
  async update(id,row){const saved={...this.rows.get(id),...row,id};this.rows.set(id,saved);return saved;}
}
class MemoryJournal {
  constructor(){this.rows=new Map();}
  async get(id){return this.rows.get(id)??null;}
  async put(id,value){this.rows.set(id,{...value});}
}

const aiClient={async classify(){return {category:'sales',priority:'normal',draftReply:'Thanks — your request is in our queue.'};}};
const crm=new MemoryCrm();
const journal=new MemoryJournal();
let sends=0;
let failFirst=true;
const mailer={
  async send(msg){sends++;return{id:`mail-${sends}`,msg};},
  async verify(){if(failFirst){failFirst=false;return false;} return true;}
};

const payload={requestId:'lead-001',email:'Person@Example.test',name:'Pat',message:'Can I get a quote?'};
const plan=await prepareLeadPlan({payload,aiClient,crm});
assert.equal(plan.approvalRequired,true);
assert.equal(plan.existingRecordId,null);

const blocked=await executeApprovedPlan({plan,approval:{approved:false,requestId:'lead-001'},crm,mailer,journal});
assert.equal(blocked.status,'blocked');
assert.equal(crm.rows.size,0);

const partial=await executeApprovedPlan({plan,approval:{approved:true,requestId:'lead-001'},crm,mailer,journal});
assert.equal(partial.status,'partial');
assert.equal(crm.rows.size,1);
assert.equal(sends,1);

const recovered=await executeApprovedPlan({plan,approval:{approved:true,requestId:'lead-001'},crm,mailer,journal});
assert.equal(recovered.status,'complete');
assert.equal(crm.rows.size,1);
assert.equal(sends,2);

const replay=await executeApprovedPlan({plan,approval:{approved:true,requestId:'lead-001'},crm,mailer,journal});
assert.equal(replay.status,'complete');
assert.equal(crm.rows.size,1);
assert.equal(sends,2);

console.log('ok - approval workflow blocks unapproved writes, verifies CRM state, and recovers without duplicates');
