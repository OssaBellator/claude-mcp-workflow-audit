# Executable reference: assessment → AI analysis → report delivery

> Synthetic portfolio artifact. This is not a customer deployment and uses no customer data or production credentials.

This example is deliberately shaped like a small paid business-automation project: receive questionnaire data, apply client-editable rules, constrain the AI to approved content, generate a personalized report, deliver it, verify delivery, and prevent duplicate processing.

## Why this exists

A client evaluating automation work should be able to answer more than “does the developer understand agents?” This example demonstrates a bounded, testable workflow with ordinary business requirements:

- webhook/API-style structured input;
- deterministic validation and rule evaluation;
- AI analysis constrained to client-approved content;
- schema/evidence validation after model output;
- HTML report generation suitable for browser-to-PDF or a managed PDF renderer;
- email-delivery adapter boundary;
- request-id idempotency;
- post-send verification;
- representative failure tests.

## Architecture

```mermaid
flowchart LR
    A[Questionnaire webhook] --> B[Validate + normalize]
    B --> C[Editable rules/config]
    C --> D[Controlled evidence packet]
    D --> E[AI analysis adapter]
    E --> F[Schema + evidence validation]
    F --> G[Report renderer]
    G --> H[Email/PDF delivery adapter]
    H --> I[Verification + run record]
```

The core module does not require a particular questionnaire provider, AI vendor, PDF service, email vendor, or database. Those are adapter boundaries so a client can own the production accounts.

## Run it

```bash
node examples/assessment-report/assessment.test.mjs
node examples/assessment-report/demo.mjs
```

The demo writes deterministic sample artifacts under `sample-output/`.

## What a real client would provide

Minimal client input is intentionally small:

1. one representative questionnaire payload;
2. approved business rules/content/benchmarks;
3. report branding/template;
4. client-owned API/hosting/email credentials for production deployment.

The implementation can then be built, tested, documented, and handed over without requiring the client to make technical decisions throughout the build.

## Production substitutions

The included demo uses in-memory adapters and HTML output so it is credential-free and reproducible. A production implementation would replace adapters with client-owned services, for example:

- Typeform/Tally/custom form → webhook;
- JSON/YAML/Google Sheet/admin UI → editable rules;
- Anthropic/OpenAI → AI adapter;
- Playwright/Chromium or managed renderer → PDF;
- SES/Postmark/Resend/Gmail API → email;
- SQLite/PostgreSQL/DynamoDB → durable idempotency/run state.

Those substitutions do not change the core authority boundaries: deterministic rules select approved evidence; the model cannot invent controlled benchmarks; delivery is verified; the same request ID cannot silently produce duplicate reports.

## Tests included

- rule matching and controlled-content selection;
- successful delivery plus read-back verification;
- duplicate request replay without duplicate delivery;
- reused request ID with a changed payload fails closed;
- model output referencing unapproved evidence is rejected.

## Handoff

A production handoff should document the questionnaire schema, rule/config owner, AI model/version, approved content source, email/PDF provider, credential scopes, idempotency retention period, retry policy, logs, verification procedure, and disable/recovery steps.
