# AI Business Automation — Case Study

## Problem

Many AI automation projects fail after the demo because they do not define what happens when inputs are incomplete, webhooks repeat, API permissions fail, an external write succeeds only partially, or the model invents controlled business information.

This reference work demonstrates how I approach one bounded business workflow end-to-end: validate inputs, keep deterministic business rules outside the model where practical, use AI for a constrained task, execute external actions deliberately, verify what actually happened, and leave enough state to recover without duplicate side effects.

> These are synthetic portfolio implementations, not claims about prior paid client deployments. They use no customer data or production credentials.

## Example 1 — Assessment to personalized report

Use case:

`questionnaire/webhook -> validation -> editable rules -> AI analysis -> report -> email -> verification`

### What is implemented

- structured submission validation;
- configurable rule matching;
- approved content/evidence selection;
- AI output schema validation;
- rejection of recommendations that cite uncontrolled evidence;
- personalized HTML report generation;
- delivery adapter boundary;
- delivery verification;
- stable request identity and duplicate protection;
- replay protection when the same request ID carries a changed payload.

### Representative proof

The test verifies:

1. correct rule/evidence selection;
2. one successful report delivery;
3. duplicate replay produces no second delivery;
4. reused request ID with changed input fails closed;
5. AI output referencing unapproved evidence is rejected.

Source:
[examples/assessment-report](./examples/assessment-report/)

## Example 2 — Approval-gated CRM/email workflow

Use case:

`webhook -> validate -> CRM read -> AI classification -> approval -> CRM write -> verify -> email -> verify`

### What is implemented

- webhook/input normalization;
- current CRM lookup before mutation;
- bounded AI classification/drafting;
- explicit approval before consequential writes;
- create/update behavior based on current state;
- post-write CRM read-back verification;
- durable run journal;
- partial-failure representation;
- recovery that retries only the unfinished step.

### Representative proof

The test deliberately makes the first email verification fail **after the CRM write has succeeded**.

The next run verifies that:

- the existing CRM record is preserved;
- no duplicate CRM record is created;
- only the failed email step is retried;
- the completed run becomes replay-safe.

Source:
[examples/approved-write](./examples/approved-write/)

## What this demonstrates for a client

For a bounded automation project, I can own:

- technical decomposition and workflow architecture;
- API/webhook integration;
- TypeScript/Node.js implementation;
- deterministic business-rule handling;
- bounded AI integration;
- approval boundaries;
- idempotency and duplicate prevention;
- failure/retry design;
- verification;
- tests;
- documentation and operator handoff.

Typical client input can stay limited to:

1. representative input/workflow examples;
2. business rules and acceptance criteria;
3. client-owned account/API access after contracting;
4. approval for consequential production actions;
5. customer-facing branding/copy when applicable.

## Verification

Both examples are included in the repository's standard `npm test` gate.

The current GitHub Actions run passes on:

- Node 20;
- Node 22;
- Node 24.

## Boundary

The code demonstrates the engineering approach and executable acceptance behavior. A production delivery still depends on the selected client-owned vendors, their APIs, account permissions, and production test data.
