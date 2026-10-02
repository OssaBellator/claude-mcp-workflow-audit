#!/usr/bin/env node
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'.');
const errors=[],warnings=[];
const req=f=>{const p=path.join(root,f);if(!existsSync(p))errors.push('missing '+f);return p};
for(const f of ['.claude-plugin/plugin.json','README.md','LICENSE','skills/auditing-mcp-workflows/SKILL.md']) req(f);
if(!errors.length){
 let manifest; try{manifest=JSON.parse(readFileSync(path.join(root,'.claude-plugin/plugin.json'),'utf8'))}catch(e){errors.push('invalid plugin.json: '+e.message)}
 if(manifest){
  for(const k of ['name','version','description','author','homepage','repository','license']) if(!manifest[k]) errors.push('plugin.json missing '+k);
  if(manifest.license!=='MIT') warnings.push('manifest license differs from repository MIT expectation');
 }
 const readme=readFileSync(path.join(root,'README.md'),'utf8').trim();
 if(readme.split(/\s+/).length<40) errors.push('README should contain at least 40 words');
 const skill=readFileSync(path.join(root,'skills/auditing-mcp-workflows/SKILL.md'),'utf8');
 if(!/^---\r?\n[\s\S]*?\r?\n---/m.test(skill)) errors.push('Skill missing YAML frontmatter');
 if(!/^name:\s*auditing-mcp-workflows\s*$/m.test(skill)) errors.push('Skill frontmatter missing expected name');
 if(!/^description:\s*.+$/m.test(skill)) errors.push('Skill frontmatter missing description');
 for(const rel of ['references/workflow-contract.md','references/appointment-intake.md','scripts/audit.mjs']){
  if(!existsSync(path.join(root,'skills/auditing-mcp-workflows',rel))) errors.push('Skill references missing '+rel);
 }
}
console.log(JSON.stringify({valid:errors.length===0,errors,warnings,note:'Local deterministic preflight only; Anthropic directory validation/security review remains authoritative.'},null,2));
process.exit(errors.length?1:0);
