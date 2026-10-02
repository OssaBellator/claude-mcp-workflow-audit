# AI Workflow Training Curriculum — Public Proof Artifact

> Proposed teaching architecture and synthetic/open-source methodology. This is **not** evidence of a prior customer training engagement.

This six-session curriculum is designed for a small team where each participant brings one real business process that may benefit from AI-assisted automation. The goal is not to teach prompt tricks in isolation. Each participant should leave with a bounded workflow, representative tests, and an operator handoff they can maintain.

## Training outcome

By the end of the program, each participant should be able to:

- describe a workflow in terms of trigger, inputs, tools, outputs, approval boundaries, and recovery;
- distinguish model judgment from deterministic execution;
- work with JSON, APIs, webhooks, files/CSV, and structured outputs at an operator level;
- connect Claude or another agent to approved tools through MCP or an orchestration layer;
- build read-first workflows before adding consequential writes;
- test happy paths, missing data, permission failures, duplicates, and partial failures;
- verify external writes instead of assuming a tool call succeeded;
- document credentials/scopes without exposing secrets;
- hand the workflow to another operator with run, recovery, and disable instructions.

## Participant project rule

Each participant brings one process with a clear business outcome. Before implementation, the process must be reduced to a workflow contract:

- **Trigger:** what starts the workflow?
- **Inputs:** what data is required?
- **Systems of record:** where does truth live?
- **Allowed tools:** what may the agent read or call?
- **Output:** what observable result is produced?
- **Action boundary:** what can be automatic, and what requires approval?
- **Acceptance tests:** how will we know it works?
- **Recovery:** what happens when a tool, credential, or downstream system fails?

Projects with unclear ownership, unrestricted production writes, or missing source data stay in read-only/prototype mode until those constraints are resolved.

## Session 1 — Choose the workflow and make it testable

**Concepts**
- Claude Projects / Claude Code roles
- agents vs. deterministic automation
- workflow contracts
- data boundaries and credentials
- read-only vs. approval vs. bounded-auto modes

**Build**
- map each participant's process;
- select one narrow first workflow;
- define structured input/output;
- write acceptance tests before connecting production systems.

**Deliverable**
- one-page workflow contract per participant.

## Session 2 — APIs, JSON, webhooks, CSV and business data

**Concepts**
- requests/responses and status codes
- JSON objects and arrays
- authentication at a practical level
- webhooks
- CSV / spreadsheet normalization
- missing and conflicting data

**Build**
- ingest a representative file, sheet, or API response;
- normalize it into a predictable schema;
- generate a management summary without inventing missing values.

**Example patterns**
- production plan vs. actual report;
- sales activity summary;
- lead or enquiry triage;
- exception report from spreadsheet rows.

**Deliverable**
- repeatable read-only data pipeline with a known output schema.

## Session 3 — MCP and tool-connected Claude

**Concepts**
- what MCP provides and what it does not;
- tool descriptions, scopes, and least privilege;
- server/tool ownership;
- approval boundaries for consequential actions;
- source traceability.

**Build**
- connect one approved tool or synthetic MCP workflow;
- execute a read operation;
- return structured evidence;
- deliberately trigger one permission or missing-data failure and diagnose it.

**Deliverable**
- tool inventory plus a verified read workflow.

## Session 4 — Orchestration and multi-step workflows

**Concepts**
- when to use Claude Code directly vs. an orchestration layer such as n8n;
- sequencing and branching;
- idempotency keys and duplicate prevention;
- schedules and event triggers;
- human-in-the-loop checkpoints.

**Build**
- turn the participant's read workflow into a multi-step flow;
- add one downstream proposed action;
- stop for approval before the consequential write;
- record evidence IDs and resulting state.

**Deliverable**
- end-to-end workflow in approval mode.

## Session 5 — Break it before production does

**Concepts**
- representative test sets
- bounded retries
- timeouts after writes
- partial failure
- conflicting records
- expired credentials
- duplicate events
- unsafe retry patterns

**Build**
Test at least:
1. happy path;
2. required source missing;
3. duplicate request;
4. permission denied;
5. write succeeds but a later notification fails;
6. timeout where write outcome is initially unknown.

**Deliverable**
- regression checklist and recovery procedure.

## Session 6 — Operate, hand off and improve

**Concepts**
- production-readiness review
- logs and verification
- cost/latency limits
- maintenance ownership
- disable/rollback procedures
- deciding what *not* to automate

**Build**
- run a final demonstration from trigger to verified result;
- review acceptance tests;
- document credentials/scopes by owner (never secret values);
- create operator runbook and next-step backlog.

**Deliverable**
- working bounded workflow, test evidence, operator handoff, and improvement plan.

## Instructor approach

The instructor should not take over every participant's keyboard. A useful format is:

1. explain the concept briefly;
2. demonstrate the smallest example;
3. have participants implement their own version;
4. review failures and edge cases together;
5. close with a checkable deliverable.

This keeps the course practical and makes the participant—not the instructor—the operator of the final system.

## Suggested session shape

For a 6–7 person cohort:

- 15–25 min: concept and demonstration
- 60–75 min: guided build time
- 20–30 min: review, failures, and Q&A
- 10 min: acceptance check and homework

A 90–120 minute session works well when participants are building real workflows rather than following identical canned exercises.

## Public reference material

This curriculum is supported by the repository's existing synthetic/open-source materials:

- [Workflow implementation template](../workflow-template.md)
- [Trades operations assistant](trades-operations-assistant.md)
- [Retail master pricing pilot](retail-master-pricing.md)
- [Appointment intake workflow](appointment-intake.md)
- [Public proof page](../proof.html)

Those examples demonstrate workflow contracts, structured outputs, approval boundaries, duplicate protection, failure recovery, testing, and operator handoff. They are intentionally labeled synthetic rather than presented as customer deployments.

## Commercial scoping boundary

Training is scoped separately from implementation. If a participant's project requires production credentials, custom API development, paid third-party services, data migration, security review, or ongoing support, that work should be estimated and approved separately rather than hidden inside the training fee.
