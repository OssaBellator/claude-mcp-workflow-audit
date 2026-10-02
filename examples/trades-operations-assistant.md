# Trades Operations Assistant — Synthetic Workflow Reference

> Synthetic portfolio artifact. This is not a customer deployment and contains no customer data.

## Goal
Coordinate a trades business from inbound lead through quote, scheduled job, invoice follow-up, and daily briefing while keeping consequential financial and external-write actions behind explicit approval.

## Operating modes
- **Read-only:** inspect leads, jobs, quotes, invoices, calendars, files, and message queues; propose actions only.
- **Approval:** draft writes and present an approval packet before creating jobs, sending quotes/messages, changing schedules, issuing invoices, or changing financial records.
- **Bounded-auto:** only low-risk actions explicitly allow-listed by the operator may execute automatically. Payments, transfers, refunds, pricing overrides, deletions, and permission changes always require approval.

## Canonical records
Every workflow run uses stable IDs for lead, customer, job, quote, invoice, property (if applicable), and request. Before any create/write, search by stable ID and current state to prevent duplicates.

## Workflow 1 — Lead to quote
1. Ingest website/email/voice-note lead.
2. Validate customer contact, service address, requested work, source, and consent/routing rules.
3. Search for an existing customer/lead before creating anything.
4. Read approved pricing/rate tables and scope templates.
5. Draft scope of works, materials, labour assumptions, exclusions, and quote.
6. Flag missing measurements, ambiguous photos/notes, or pricing outside configured bounds.
7. Present approval packet: source evidence, assumptions, proposed price, customer-facing message, intended destination.
8. On approval, create/update exactly one quote and verify its ID/status.
9. Schedule follow-up only after verified quote creation.

## Workflow 2 — Accepted quote to job
1. Re-read quote acceptance from the system of record; never infer acceptance from an ambiguous message.
2. Check calendar/team capacity and material dependencies.
3. Propose job date and checklist.
4. Require approval for customer commitment or schedule change.
5. Create exactly one job using quote/customer IDs as idempotency keys.
6. Re-read job and calendar state; report evidence IDs.

## Workflow 3 — Job completion to invoice
1. Verify completion state and required evidence/checklist.
2. Draft invoice from the approved quote plus explicitly recorded variations.
3. Surface any mismatch between quote, variations, completion notes, and invoice.
4. Require approval before invoice creation/send.
5. Verify invoice ID, amount, recipient, and send state.
6. Track overdue state; draft reminders according to configured cadence.
7. Never initiate a payment, transfer, refund, or bank action.

## Workflow 4 — Daily operations briefing
Read-only aggregation:
- unanswered/new leads
- quotes awaiting approval or customer response
- today's jobs and blockers
- jobs waiting on materials/subcontractors/customers
- invoices due/overdue
- scheduled follow-ups
- exceptions requiring operator decision

Output each item with source system, record ID, last-updated timestamp, recommended next action, and whether approval is required.

## Failure and recovery
- **Source unavailable:** bounded retry, then mark source unavailable; never invent state.
- **Conflicting records:** stop the affected action and show both source records.
- **Ambiguous customer/job match:** require disambiguation before write.
- **Write succeeds but notification fails:** preserve successful write; retry only notification; do not duplicate job/quote/invoice.
- **Timeout after write:** re-read by stable idempotency key before retry.
- **Credential/permission failure:** report missing capability; do not request broader permissions automatically.
- **Out-of-policy action:** refuse execution and produce an approval/escalation packet.

## Representative synthetic tests
1. New lead → quote draft → approval → one verified quote.
2. Duplicate lead arrives twice → one customer/lead record.
3. Missing roof measurements → no price fabricated; request missing data.
4. Accepted quote with calendar conflict → alternatives proposed; no booking.
5. Job write succeeds, customer message fails → one job only; message retry.
6. Completed job with unapproved variation → invoice blocked pending review.
7. Overdue invoice → reminder draft; no payment/bank action.
8. Conflicting invoice states across systems → exception surfaced.
9. Expired credential → safe diagnostic, no permission broadening.
10. Daily briefing with one unavailable source → partial result clearly labelled.

## Handoff checklist
Document system-of-record ownership, MCP/API tools, OAuth scopes, credential owner, business hours, pricing/rate source, quote/invoice templates, approval roles, message cadence, idempotency keys, retry limits, retention, logs, verification queries, disable procedure, and recovery procedure.

## Evidence contract
A successful consequential action must return:
```json
{
  "status": "completed|blocked|partial",
  "request_id": "stable-id",
  "records_read": [],
  "writes_performed": [],
  "approval": {"required": true, "approved": false},
  "verification": {"performed": true, "evidence_ids": []},
  "exceptions": []
}
```

The purpose is not to make an LLM an unsupervised business owner. It is to make routine operations inspectable, idempotent, recoverable, and appropriately approval-gated.
