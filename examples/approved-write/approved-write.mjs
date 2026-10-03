import {createHash} from 'node:crypto';

export function normalizeLead(payload) {
  const requestId = String(payload?.requestId ?? '').trim();
  const email = String(payload?.email ?? '').trim().toLowerCase();
  const name = String(payload?.name ?? '').trim();
  const message = String(payload?.message ?? '').trim();
  if (!requestId) throw new Error('missing requestId');
  if (!email || !email.includes('@')) throw new Error('invalid email');
  if (!message) throw new Error('missing message');
  return {requestId,email,name,message};
}

export function fingerprintLead(lead) {
  return createHash('sha256').update(JSON.stringify(lead)).digest('hex');
}

export async function prepareLeadPlan({payload, aiClient, crm}) {
  const lead = normalizeLead(payload);
  const existing = await crm.findByEmail(lead.email);
  const classification = await aiClient.classify({
    message: lead.message,
    outputSchema:{category:'string',priority:'low|normal|high',draftReply:'string'}
  });
  if (!classification?.category || !classification?.priority || !classification?.draftReply) {
    throw new Error('classification failed schema validation');
  }
  return {
    requestId: lead.requestId,
    lead,
    existingRecordId: existing?.id ?? null,
    proposedWrites: [
      existing ? {type:'crm.update',recordId:existing.id} : {type:'crm.create'},
      {type:'email.send',to:lead.email}
    ],
    classification,
    approvalRequired:true
  };
}

export async function executeApprovedPlan({plan, approval, crm, mailer, journal}) {
  if (!approval?.approved || approval.requestId !== plan.requestId) {
    return {status:'blocked',reason:'approval required',writes:[]};
  }

  const prior = await journal.get(plan.requestId);
  const fp = fingerprintLead(plan.lead);
  if (prior && prior.fingerprint !== fp) throw new Error('requestId reused with different lead');
  const state = prior ?? {fingerprint:fp,crmRecordId:null,emailId:null};

  if (!state.crmRecordId) {
    const existing = plan.existingRecordId ? await crm.get(plan.existingRecordId) : await crm.findByEmail(plan.lead.email);
    const saved = existing
      ? await crm.update(existing.id,{...plan.lead,classification:plan.classification})
      : await crm.create({...plan.lead,classification:plan.classification});
    const verified = await crm.get(saved.id);
    if (!verified || verified.email !== plan.lead.email) throw new Error('CRM verification failed');
    state.crmRecordId = saved.id;
    await journal.put(plan.requestId,state);
  }

  if (!state.emailId) {
    const sent = await mailer.send({
      to:plan.lead.email,
      subject:'Thanks — we received your request',
      text:plan.classification.draftReply,
      referenceId:plan.requestId
    });
    if (!await mailer.verify(sent.id)) {
      await journal.put(plan.requestId,state);
      return {status:'partial',crmRecordId:state.crmRecordId,emailId:null,writes:['crm']};
    }
    state.emailId=sent.id;
    await journal.put(plan.requestId,state);
  }

  return {
    status:'complete',
    crmRecordId:state.crmRecordId,
    emailId:state.emailId,
    writes:['crm','email'],
    verified:true
  };
}
