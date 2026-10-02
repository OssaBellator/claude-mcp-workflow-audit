# Reusable MCP Workflow Contract — Example

This is a synthetic template, not a customer implementation.

## Goal
Produce a concise daily operational brief from approved MCP tools without performing consequential writes.

## Trigger
Manual invocation or an approved daily schedule.

## Required inputs
- Workspace identifier
- Reporting window
- Approved MCP tool set

## Tool policy
- Read-only tools by default.
- Do not request broader scopes merely to make the workflow succeed.
- Never expose secrets or raw credentials in model context or output.
- Any external write, purchase, message send, deletion, or permission change requires an explicit approval step.

## Sequence
1. Validate required inputs and tool availability.
2. Fetch only the minimum data needed.
3. Normalize results into a stable internal structure.
4. Record unavailable or conflicting sources instead of silently guessing.
5. Produce the structured brief.
6. Run verification checks before completion.

## Output
- Summary
- Material changes
- Exceptions / missing data
- Recommended human actions
- Sources used
- Verification status

## Failure handling
- Authentication failure: stop and report the affected connector.
- Missing source: continue only when the missing source is non-critical; disclose it.
- Conflicting data: present the conflict and do not invent a resolution.
- Tool timeout: one bounded retry when safe, then report failure.
- Consequential action requested: stop at an approval boundary.

## Verification
- Required sections present.
- Every factual item traceable to an allowed source.
- No secrets in output.
- No consequential write occurred.
- Missing/conflicting data disclosed.

## Handoff
Document installation, configuration, tool scopes, test cases, known limits, and recovery steps.
