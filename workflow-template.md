# Claude/MCP Workflow Implementation Template

Use this for a single reusable Claude Skill or scheduled workflow. Replace bracketed fields; do not put credentials in the document.

## Workflow
**Name:** [workflow name]  
**Trigger:** [on demand / schedule / approved event]  
**Business outcome:** [observable result]

## Inputs
- Required: [inputs]
- Optional: [inputs]
- Missing-data behavior: stop, continue with disclosure, or request clarification.

## MCP/tool sequence
1. Validate required inputs and permitted scope.
2. Read only the minimum data needed from [tool/server].
3. Normalize source results into [schema].
4. Resolve or disclose missing/conflicting data.
5. Produce the structured output.
6. Verify source traceability and required fields.
7. If a consequential write is proposed, stop for explicit approval before executing it.

## Tool policy
**Allowed:** [minimum tool list]  
**Not allowed:** tools outside this workflow's scope.  
**Credentials:** supplied through the runtime's approved secret mechanism, never embedded in instructions.

## Structured output
```json
{
  "status": "complete|partial|blocked",
  "summary": "",
  "sources": [],
  "missing_data": [],
  "proposed_actions": [],
  "verification": {
    "required_fields_present": true,
    "source_traceability": true
  }
}
```

## Failure handling
- Authentication/permission failure: stop; identify the failing integration without exposing credentials.
- Tool unavailable: bounded retry, then return `partial` or `blocked`.
- Conflicting source data: preserve both values and identify the conflict.
- Missing required data: do not invent it.
- Write/action failure: report the attempted action and observed error; do not loop indefinitely.

## Representative synthetic tests
| Case | Input | Expected behavior |
| --- | --- | --- |
| Happy path | all required data | complete structured output |
| Missing source | one required source unavailable | partial/blocked with disclosure |
| Conflicting data | sources disagree | conflict preserved, no invented resolution |
| Permission denied | tool rejects access | stop safely, no credential leakage |
| Consequential action | output recommends a write | approval required before execution |

## Client-configurable settings
- Schedule/time zone: [value]
- Reporting window: [value]
- Output destination: [value]
- Approval mode: [read-only / approval required]
- Optional filters: [values]

## Maintenance handoff
Document tool/server names, required scopes, schedule ownership, known limits, verification steps, recovery procedure, and how to disable the workflow.
