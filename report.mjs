#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const target=path.resolve(process.argv[2]||'.');
const audit=fileURLToPath(new URL('./audit.mjs',import.meta.url));
const r=spawnSync(process.execPath,[audit,target],{encoding:'utf8'});
if(!r.stdout){console.error(r.stderr||'audit produced no output');process.exit(2)}
const j=JSON.parse(r.stdout);
const lines=['# Claude/MCP Operational Audit','', 'Target: '+target,'', '## Summary','',
'- Findings: **'+j.summary.findings+'** (high '+j.summary.high+', medium '+j.summary.medium+', low '+j.summary.low+')',
'- Instruction files: **'+j.inventory.instructions.length+'**',
'- MCP config files: **'+j.inventory.mcpConfigs.length+'**',
'- Automation/workflow files: **'+j.inventory.automationFiles.length+'**','','## Inventory',''];
for(const [k,v] of Object.entries(j.inventory)) lines.push('- **'+k+'**: '+(v.length?v.join(', '):'none found'));
lines.push('','## Findings','');
if(!j.findings.length) lines.push('No heuristic safety findings.');
else for(const f of j.findings) lines.push('- **'+f.severity.toUpperCase()+' · '+f.rule+'** — '+f.file+': '+f.message);
lines.push('','## Operational recommendations','');
if(!j.recommendations.length) lines.push('No automatic recommendations. Validate runtime behavior and approval boundaries manually.');
else for(const x of j.recommendations) lines.push('- '+x);
lines.push('','## Human review required','','This static report cannot determine whether a workflow is economically valuable, whether runtime behavior matches configuration, or whether consequential writes are appropriate. Review actual workflows, credentials/scopes, failure paths, verification evidence, and human approval boundaries before implementation.');
console.log(lines.join('\n'));
process.exit(r.status===1?1:0);
