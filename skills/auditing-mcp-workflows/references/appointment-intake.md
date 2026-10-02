# Synthetic reference: appointment intake workflow

This is a synthetic implementation example, not a deployed customer system. It shows how to structure a business workflow that reads availability, proposes an appointment, obtains approval where required, performs bounded writes, and verifies the result.

## Outcome
Turn an inbound appointment request into either a verified booking proposal or a clearly explained blocked/partial result.

## Inputs
- caller/customer name and contact channel
- requested service
- preferred date/time window
- time zone
- optional business routing rules

## Sequence
1. Validate contact details, requested service, time zone, and date window.
2. Read calendar availability only; do not create an event yet.
3. Select candidate slots allowed by business rules.
4. Produce a proposed appointment and confirmation summary.
5. Require explicit approval before calendar creation when the workflow is running in approval mode.
6. Create exactly one calendar event.
7. Re-read the created event and verify time, attendee/contact metadata, and identifier.
8. Draft or send confirmation according to the configured action mode.
9. Record a structured result with evidence IDs and any unresolved limitations.

## Action modes
- `read-only`: propose slots; perform no external writes.
- `approval`: pause before calendar/email writes.
- `bounded-auto`: writes are allowed only within pre-approved business rules; escalation is mandatory outside them.

## Failure and recovery
- No availability: return alternative windows; do not fabricate a slot.
- Calendar unavailable: bounded retry, then return blocked.
- Event created but confirmation fails: do **not** create a second event; return partial with the existing event ID and retry only the confirmation step.
- Ambiguous time zone: stop before booking.
- Duplicate request: detect by stable request/reference ID before creating another event.
- Cancellation/reschedule: treat as a separate verified state transition, not a silent overwrite.
- Tool permission failure: identify the missing capability without exposing credentials.

## Verification evidence
A successful run records:
```json
{
  "status": "complete",
  "request_id": "synthetic-123",
  "calendar_event_id": "evt_example",
  "scheduled_time": "2026-10-08T10:00:00+10:00",
  "confirmation": "sent|drafted",
  "writes_performed": ["calendar.create", "email.send"],
  "verified": true
}
```

## Representative tests
| Case | Expected result |
| --- | --- |
| valid request + free slot | one verified event; confirmation follows configured mode |
| no free slot | alternatives returned, zero writes |
| ambiguous time zone | blocked before writes |
| calendar write succeeds, email fails | partial; existing event preserved, no duplicate |
| duplicate request ID | existing result returned or escalated; no second event |
| out-of-policy time/service | escalation; zero autonomous writes |
| permission denied | blocked with safe diagnostic |
| approval declined | zero writes |

## Handoff
The operator must configure business hours, services, duration rules, calendar identity, confirmation templates, escalation destination, action mode, credential scopes, retention policy, and disable/recovery procedure before production use.
