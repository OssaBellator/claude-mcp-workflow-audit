# Follow-on implementation scoping

The A$149 audit is intentionally a bounded entry engagement. New workflow/MCP implementation is quoted separately after the audit establishes what actually exists.

Use the planning helper:

```bash
node estimate-scope.mjs workflows=2 integrations=3 writes=approval tests=6 scheduled=true
```

It returns a **complexity band and indicative engineering hours, not a price quote**. The estimate deliberately waits for API/authentication validation, data boundaries, acceptance tests, deployment requirements, and maintenance expectations before a commercial quote is made.

Complexity increases with:
- number of distinct workflows;
- external integrations and authentication boundaries;
- consequential writes or approval gates;
- representative test coverage;
- recurring/scheduled execution and recovery requirements.

Third-party fees, paid API plans, migrations, 24/7 support, and unbounded revisions are excluded unless explicitly scoped.
