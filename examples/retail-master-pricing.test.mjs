import assert from 'node:assert/strict';
function price(r){for(const k of ['cost','fx','shipping','customs','other','margin'])if(!Number.isFinite(r[k]))return {ok:false,flag:'MISSING_REQUIRED_FIELD',field:k};if(r.cost<=0)return {ok:false,flag:'ZERO_PRICE'};if(r.margin<=0||r.margin>=1)return {ok:false,flag:'INVALID_NUMBER',field:'margin'};const converted=r.cost*r.fx;const landed=converted+r.shipping+r.customs+r.other;return {ok:true,converted,landed,proposed:landed/(1-r.margin),margin:(landed/(1-r.margin)-landed)/(landed/(1-r.margin))}}
const x=price({cost:100,fx:.41,shipping:5,customs:3,other:1,margin:.4});assert.equal(x.ok,true);assert.equal(x.converted,41);assert.equal(x.landed,50);assert.ok(Math.abs(x.proposed-83.3333333333)<1e-6);assert.ok(Math.abs(x.margin-.4)<1e-9);
assert.deepEqual(price({cost:100,fx:NaN,shipping:5,customs:3,other:1,margin:.4}),{ok:false,flag:'MISSING_REQUIRED_FIELD',field:'fx'});
assert.deepEqual(price({cost:0,fx:.41,shipping:5,customs:3,other:1,margin:.4}),{ok:false,flag:'ZERO_PRICE'});
console.log('retail pricing reference tests passed');
