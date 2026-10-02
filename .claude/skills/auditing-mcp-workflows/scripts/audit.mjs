#!/usr/bin/env node
import {readdirSync,readFileSync,statSync} from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.argv[2]||'.');
const maxBytes=512*1024;
const findings=[];
const inventory={instructions:[],mcpConfigs:[],envFiles:[],automationFiles:[],packageFiles:[]};
const skip=new Set(['.git','node_modules','dist','build','.next','.cache']);
const interesting=/^(CLAUDE\.md|AGENTS\.md|\.mcp\.json|mcp\.json|settings\.json|package\.json|\.env(?:\..*)?)$/i;
const secretName=/\.env(?:\..*)?$/i;
const secretPattern=/(api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*["']?([^\s"',}]{8,})/ig;
const downloadPipe=new RegExp(['cu'+'rl\\b[^\\n|]*','\\|\\s*(?:sh|bash)'].join(''),'i');
const dangerousPatterns=[/\brm\s+-rf/i,/\bsudo\b/i,/\bchmod\s+777/i,downloadPipe,/Invoke-Expression/i,/eval\s*\(/i];
const wildcard=/(allowedTools|permissions|allow)[^\n]{0,100}["']?\*["']?/i;

function walk(dir){
  for(const name of readdirSync(dir)){
    if(skip.has(name)) continue;
    const p=path.join(dir,name); let s;
    try{s=statSync(p)}catch{continue}
    if(s.isDirectory()) walk(p);
    else if(s.isFile() && (interesting.test(name)||/\.(json|md|ya?ml|toml)$/i.test(name)) && s.size<=maxBytes) inspect(p,name);
  }
}
function add(severity,file,rule,message){findings.push({severity,file:path.relative(root,file).replaceAll('\\','/'),rule,message})}
function inspect(file,name){
  let text; try{text=readFileSync(file,'utf8')}catch{return}
  if(secretName.test(name)){
    if(!/\.example$|\.sample$|\.template$/i.test(name)) add('high',file,'env-file','Environment file present. Confirm it is ignored and contains no committed credentials.');
  }
  secretPattern.lastIndex=0; let m;
  while((m=secretPattern.exec(text))){
    const v=m[2];
    if(!/^(process\.env|\$\{|<|your_|example|changeme|placeholder)/i.test(v))
      add('high',file,'possible-secret','Possible hard-coded credential-like value. Rotate if real; move secrets to an approved credential store.');
  }
  if(dangerousPatterns.some(pattern=>pattern.test(text))) add('medium',file,'dangerous-command','Potentially destructive or shell-piped command found. Require narrow scope and explicit approval before consequential execution.');
  if(wildcard.test(text) && (name.toLowerCase()==='claude.md' || name.toLowerCase()==='agents.md' || ['.json','.yaml','.yml','.toml'].includes(path.extname(name).toLowerCase()))) add('medium',file,'wildcard-permission','Possible wildcard tool/permission grant. Prefer least-privilege allowlists.');
  if(/mcpServers/i.test(text) && /"command"\s*:/i.test(text) && !/"args"\s*:/i.test(text))
    add('low',file,'mcp-command-review','MCP command configuration found; review executable provenance, arguments, and credential boundary.');
}
try{walk(root)}catch(e){console.error('audit failed:',e.message);process.exit(2)}
const rank={high:0,medium:1,low:2};
findings.sort((a,b)=>rank[a.severity]-rank[b.severity]||a.file.localeCompare(b.file));
const counts={high:0,medium:0,low:0}; for(const f of findings) counts[f.severity]++;
const recommendations=[];
if(!inventory.instructions.length) recommendations.push('No CLAUDE.md or AGENTS.md found; consider repository-specific operating instructions.');
if(inventory.mcpConfigs.length) recommendations.push('Review each MCP server for provenance, least-privilege scopes, credential boundaries, and recovery behavior.');
if(inventory.automationFiles.length) recommendations.push('Exercise recurring automation failure paths and document retry/approval behavior.');
console.log(JSON.stringify({root,summary:{filesFlagged:new Set(findings.map(f=>f.file)).size,findings:findings.length,...counts},inventory,recommendations,findings},null,2));
process.exit(counts.high?1:0);
