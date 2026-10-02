import {readFileSync} from 'node:fs';
const skill=readFileSync('skills/auditing-mcp-workflows/SKILL.md','utf8');
const manifest=JSON.parse(readFileSync('.claude-plugin/plugin.json','utf8'));
if(!/^---\nname: auditing-mcp-workflows\ndescription: /m.test(skill)) throw new Error('invalid skill frontmatter');
if(skill.split('\n').length>500) throw new Error('SKILL.md exceeds recommended size');
for(const s of ['read-first','Never request or reproduce passwords','partial-failure','Human review required']) if(!skill.includes(s)) throw new Error('missing '+s);
if(manifest.name!=='mcp-workflow-audit') throw new Error('unexpected plugin name');
console.log('ok - plugin manifest and audit skill contract validated');