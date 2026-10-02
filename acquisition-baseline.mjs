#!/usr/bin/env node
const a=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return i<0?[x,true]:[x.slice(0,i),x.slice(i+1)]}));
const n=k=>a[k]===undefined?null:Number(a[k]);
const unique=n('unique_visitors_14d');
const out={
  captured_at:new Date().toISOString(),
  github:{views_14d:n('views_14d'),unique_visitors_14d:unique,clones_14d:n('clones_14d'),unique_cloners_14d:n('unique_cloners_14d'),stars:n('stars'),forks:n('forks')},
  checkout:{sessions:n('checkout_sessions'),completed_paid:n('completed_paid'),gross_paid_aud:n('gross_paid_aud'),reporting_available:a.reporting_available==='true'},
  next_gate: unique===null?'collect traffic metrics':unique<50?'distribution: reach 50+ qualified unique visitors before offer changes':'evaluate conversion and source quality',
  note:'This script stores supplied aggregate metrics only. It does not access credentials, analytics APIs, or user workspaces.'
};
console.log(JSON.stringify(out,null,2));
