# Example Claude/MCP Operational Audit

> Synthetic example. No customer data or production credentials are used.

## Executive summary
The workspace has one project instruction file, two MCP integrations, and one recurring reporting workflow. The main risks are an overly broad tool grant and unclear failure/approval behavior. The strongest automation opportunity is a read-only daily operations brief with an explicit human approval boundary before any external write.

## Inventory
| Area | Observed | Status |
| --- | --- | --- |
| Agent instructions | CLAUDE.md | Keep; tighten tool policy |
| MCP integrations | CRM, reporting | Review scopes |
| Recurring workflow | Daily operations brief | Good automation candidate |
| Consequential writes | CRM update, outbound message | Human approval required |

## Findings
1. **Broad permissions** — replace wildcard access with the minimum tools required by the workflow.
2. **Unclear failure behavior** — define bounded retries and stop conditions for unavailable sources.
3. **Missing verification contract** — require source traceability, missing-data disclosure, and a no-write assertion for read-only runs.

## Recommended first workflow
**Daily operations brief** — validate inputs → fetch minimum required data → normalize → disclose missing/conflicting data → draft brief → verify. External writes require explicit human approval.

## Handoff
Deliver configuration notes, test cases, known limits, credential boundaries, failure/recovery steps, and the workflow contract.
