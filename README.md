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


## Quick start with npx

After the package is published to npm, the intended commands are:

```bash
npx --yes claude-mcp-audit /path/to/workspace
npx --yes --package claude-mcp-audit claude-mcp-report /path/to/workspace
npx --yes --package claude-mcp-audit claude-mcp-new-workflow "Daily Operations Brief"
npx --yes --package claude-mcp-audit claude-mcp-estimate-scope workflows=2 integrations=3 writes=approval tests=6 scheduled=true
```

Until npm publication, clone the repository and use the local Node commands below.

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

## Workflow implementation template

Current Claude/MCP implementation work often needs the same bounded deliverables: tool sequencing, structured outputs, missing/conflicting-data handling, synthetic tests, configurable settings, and maintenance handoff. Generate a starting contract with:

```bash
node new-workflow.mjs "Daily Operations Brief"
```

The reusable source template is `workflow-template.md`. It deliberately requires explicit approval before consequential writes and treats missing data as something to disclose rather than invent.

## Synthetic business-workflow reference

`examples/appointment-intake.md` shows a production-oriented appointment workflow contract: calendar availability reads, approval/bounded-write modes, duplicate protection, partial-failure recovery, confirmation behavior, verification evidence, and handoff requirements. It is synthetic proof of the methodology, not a customer deployment.

Its contract test runs with `npm test` so the documented safety and recovery boundaries cannot disappear silently.

## Install in Claude Code

The repository is a decentralized Claude Code marketplace, so it can be installed without waiting for a central directory review:

```text
/plugin marketplace add OssaBellator/claude-mcp-workflow-audit
/plugin install mcp-workflow-audit@ossabellator-claude-tools
```

Review the source before installation. The bundled audit Skill is read-first and the deterministic scanner reads target files without mutating the target workspace.

## Claude plugin / Agent Skill

This repository also packages the audit methodology as a Claude plugin with the `auditing-mcp-workflows` Agent Skill. The Skill is read-first, uses the deterministic scanner as a heuristic, and separates observed evidence from human review.

It includes three evaluation scenarios covering credential/consequential-action boundaries, partial-failure/idempotency behavior, and the distinction between static findings and runtime proof.

The plugin source is under `.claude-plugin/` and `skills/auditing-mcp-workflows/`.

## Service

I offer a fixed-scope audit + hardening pass for one existing Claude Code, MCP, or AI-agent workspace for **A$149**.

The engagement is designed for setups that already work but have become messy, fragile, difficult to maintain, or unclear about permissions and recovery.

Payment / booking: https://buy.stripe.com/9B600d9Mocei2RV8c104801

No passwords, private keys, recovery phrases, production customer data, or other sensitive credentials should be sent through project notes or chat.

## Agent Skills CLI

The audit Skill is also installable from the public repository with the cross-platform Agent Skills CLI:

```bash
npx skills add OssaBellator/claude-mcp-workflow-audit --skill auditing-mcp-workflows
```

Review the Skill source before installation. The Skill is read-first; the bundled scanner is deterministic and non-mutating.

