const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element {constructor(){this.children=[];this.value='';this.disabled=false;this.style={};}append(...els){this.children.push(...els);}replaceChildren(...els){this.children=els;}setAttribute(){}showModal(){}}
const elements=new Map();const document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)},createElement:()=>new Element(),querySelector:()=>({value:'qingan'}),querySelectorAll:()=>[]};
const c=vm.createContext({document,console});
for(const file of ['data','expansion','chronicle','app'])vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),c);
const run=code=>vm.runInContext(code,c);
assert.equal(run('D.TIMELINE.length'),21);assert.equal(run('D.CHAPTERS.length'),11);
const counts={};for(let n=0;n<10000;n++){const id=run(`D.drawSuccessor(()=>${(n+.5)/10000})`);counts[id]=(counts[id]||0)+1;}
assert.deepEqual(counts,{yinreng:2000,yinzhi:2000,yinzhen:2000,yinsi:2000,yinti:2000});
run('state.stats.jiaCai=40;social("prince","yinti")');assert.equal(run('state.favor.yinti'),6);assert.equal(run('state.stats.jiaCai'),37);
run('social("prince","yinti")');assert.equal(run('state.favor.yinti'),6);
run('loadTurn();state.stats.jiaCai=0;social("prince","yinti")');assert.equal(run('state.favor.yinti'),6);
run('reset();social("minister","zhang")');assert.equal(run('state.ministers.zhang'),8);assert.equal(run('state.stats.shiWu'),42);
run('loadTurn();social("minister","zhang");loadTurn();social("minister","zhang")');assert.equal(run('state.flags.help_zhang'),true);
run('reset();state.stats.shouYuan=100;state.stats.shengJuan=50');
for(let turn=0;turn<13;turn++)run('choose(state.current.choices[0]);advance();state.stats.shengJuan=50;state.stats.shouYuan=100');
assert.equal(run('state.current.title'),'筆底留痕');
for(let turn=0;turn<6;turn++)run('choose(state.current.choices[0]);advance();state.stats.shengJuan=50;state.stats.shouYuan=100');
assert.equal(run('state.current.title'),'龍馭上賓');
run('choose(state.current.choices[0]);advance()');assert.equal(run('state.current.title'),'新朝門檻');
run('state.align=null;state.stats.shengJuan=50;state.stats.jiaCai=45;choose(state.current.choices[0]);advance()');assert.equal(run('state.ending'),'safe');
run('reset();state.turn=D.TIMELINE.findIndex(e=>e.id==="fin_choice");loadTurn();state.stats.shengJuan=85;choose(state.current.choices[0]);advance()');assert.equal(run('state.current.title'),'溫旨慰留');
for(let n=0;n<3;n++)run('choose(state.current.choices[0]);advance()');assert.equal(run('state.ending'),'nian');
console.log('PASS: 10,000 weighted draws, social costs/limits/bonus, 21-event progression, safe ending and full trap chain.');

// 各結局均有擬史評；未登基早死不洩露繼承人，留任不誤稱身後論定。
for(const ending of run('Object.keys(D.ENDINGS)')) {
  run(`state.ending=${JSON.stringify(ending)};state.ended=true;render()`);
  assert(run('D.careerCommentary(state).text.length')>100);
  assert.equal(elements.get('chronicle').hidden,false);
}
run('reset();state.ending="death"');
assert(!run('D.careerCommentary(state).text').includes('嗣位'));
run('state.ending="stay"');assert(run('D.careerCommentary(state).text').includes('不遽論其終'));
run('state.career=[{kind:"decision",title:"測試案",chapter:0,choice:"秉公",effects:{qingWang:15,shiWu:20}}]');
assert(run('D.careerCommentary(state).text').includes('頗知惜名'));
assert(run('D.careerCommentary(state).evidence').includes('秉公'));
run('state.career=[{kind:"decision",effects:{qingWang:-15,shiWu:-10}}]');
assert(run('D.careerCommentary(state).text').includes('屢以名節易便利'));
console.log('PASS: all nine ending commentaries, early-death secrecy, ongoing career wording, conduct variants and decision evidence.');
