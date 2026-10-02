# Claude Code & MCP Workflow Audit

A small public example of how I approach an existing Claude Code / MCP environment before changing it.

## Audit sequence

1. Inventory MCP servers, skills, hooks, agent instructions, scheduled tasks, and external integrations.
2. Map each tool to its credentials, permissions, data boundary, and consequential actions.
3. Reproduce unreliable workflows before changing them.
4. Remove duplicate or obsolete configuration before adding more automation.
5. Separate model judgment from deterministic execution where practical.
6. Add explicit failure handling, bounded retries, verification, and human approval for consequential actions.
7. Test representative happy paths, missing-data paths, permission failures, and recovery paths.
8. Leave an operator handoff: what changed, how to run it, known limits, credential boundaries, and recovery steps.

## Example workflow contract

A reusable workflow should state its trigger, required inputs, allowed tools, sequencing rules, output schema, failure behavior, verification checks, and human-approval boundary. See `workflow-contract.md`.


## Free local audit tool

This repository includes a dependency-free static scanner for common Claude/MCP configuration risks. It reads local configuration/text files only; it does not call external services or modify the target workspace.

```bash
node audit.mjs /path/to/workspace
```

It flags possible committed environment files or credential-like values, wildcard permissions, dangerous command patterns, and MCP command configurations worth reviewing. Findings are heuristics, not proof of a vulnerability. Review every result before acting.

Generate a Markdown operational report with:

```bash
node report.mjs /path/to/workspace > audit-report.md
```

A synthetic example deliverable is included in `example-audit.md`. The report deliberately separates static evidence from judgments that require a human, such as workflow value and approval boundaries.

Run the synthetic regression test with:

```bash
node test.mjs
```

If the scan finds a setup that needs hands-on cleanup, the fixed-scope audit + hardening service is available at the booking link below.

## Service

I offer a fixed-scope audit + hardening pass for one existing Claude Code, MCP, or AI-agent workspace for **A$149**.

The engagement is designed for setups that already work but have become messy, fragile, difficult to maintain, or unclear about permissions and recovery.

Payment / booking: https://buy.stripe.com/9B600d9Mocei2RV8c104801

No passwords, private keys, recovery phrases, production customer data, or other sensitive credentials should be sent through project notes or chat.
