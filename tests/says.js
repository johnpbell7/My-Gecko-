/* Gecko Says: he shows a routine, she taps it back */
const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__s={start:()=>startGame('says'),"+
 "st:()=>game&&game.kind==='says'?{phase:game.phase,seq:game.seq.slice(),at:game.at,lives:game.lives,"+
 "  score:game.score,pts:game.pts,bar:document.getElementById('gbText').textContent,"+
 "  buttons:!document.getElementById('saysBar').hidden}:null,"+
 "answer:k=>saysAnswer(k),"+
 "tapBtn:k=>{const b=document.querySelector('#saysBar button[data-k=\"'+k+'\"]');if(b){b.click();return true;}return false;},"+
 "over:()=>!game,lvl:()=>gameLvl('says'),goal:()=>goalOf('says'),"+
 "menu:()=>{document.getElementById('bMore').click();"+
 " const t=[...document.querySelectorAll('#menuTabs button')].find(b=>/games/i.test(b.textContent));if(t)t.click();"+
 " return [...document.querySelectorAll('#menuCards button')].map(b=>b.textContent.trim());},"+
 "closeMenu:()=>{document.getElementById('more').hidden=true;},"+
 "playFav:t=>{const q=decorSpot(-3+Math.random(),1+Math.random(),t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();},"+
 "fav:()=>({fav:S.favToy||null,plays:S.plays||{}}),"+
 "note:t=>noteFav(t),"+
 "draw:()=>{renderer.render(scene,camera);renderer.render(scene,camera);}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'says.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 await pg.addInitScript('try{if(!localStorage.getItem("__seeded")){localStorage.setItem("__seeded","1");localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:90,fun:60,clean:95,energy:95,hatched:true,born:Date.now()-9*DAY,
   last:Date.now(),sound:false,coins:200,water:95,thirst:90,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,tourDone:true,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+');}}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2800);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});

 console.log('=== it is in the Play menu ===');
 const cards=await pg.evaluate(()=>window.__s.menu());await pg.waitForTimeout(500);
 console.log('  listed:',cards.some(c=>/Gecko says/i.test(c))?'yes':'*** NOT THERE ***');
 await pg.evaluate(()=>window.__s.closeMenu());await pg.waitForTimeout(600);

 console.log('\n=== he shows a routine, then hands over ===');
 await pg.evaluate(()=>window.__s.start());
 let st=null;
 for(let i=0;i<40;i++){await pg.waitForTimeout(900);st=await pg.evaluate(()=>window.__s.st());
   if(st&&st.phase==='you')break;}
 console.log('  '+(st?'phase='+st.phase+'  routine='+JSON.stringify(st.seq)+'  buttons up: '+st.buttons+'  bar "'+st.bar+'"':'*** GAME NEVER STARTED ***'));

 console.log('\n=== she taps it back ===');
 let rounds=0;
 for(let r=0;r<2;r++){
   st=await pg.evaluate(()=>window.__s.st());if(!st)break;
   if(st.phase!=='you'){for(let i=0;i<90;i++){await pg.waitForTimeout(900);st=await pg.evaluate(()=>window.__s.st());if(!st||st.phase==='you')break;}}
   if(!st||st.phase!=='you')break;
   const seq=st.seq.slice();
   for(const k of seq){await pg.evaluate(a=>window.__s.tapBtn(a),k);await pg.waitForTimeout(500);}
   await pg.waitForTimeout(900);
   const after=await pg.evaluate(()=>window.__s.st());
   if(after&&after.score>rounds){rounds=after.score;
     console.log('  round '+seq.length+' right: score='+after.score+'  next routine is '+after.seq.length+' long  lives='+after.lives);}
   else {console.log('  *** round '+seq.length+' did not count *** '+JSON.stringify(after));break;}}

 console.log('\n=== a wrong tap costs a life, not the game ===');
 /* a fresh game, so the routine is one move long and we are not waiting a
    minute of sandbox time to watch him do five of them */
 await pg.evaluate(()=>window.__s.start());await pg.waitForTimeout(800);
 for(let i=0;i<90;i++){await pg.waitForTimeout(900);st=await pg.evaluate(()=>window.__s.st());if(!st||st.phase==='you')break;}
 if(st&&st.phase==='you'){
   const wrong=['spin','wave','jump'].find(k=>k!==st.seq[0]);
   const lives0=st.lives;
   await pg.evaluate(()=>window.__s.draw());await pg.screenshot({path:OUT+'says-buttons.png'});
   await pg.evaluate(a=>window.__s.tapBtn(a),wrong);await pg.waitForTimeout(1200);
   const after=await pg.evaluate(()=>window.__s.st());
   console.log('  lives '+lives0+' -> '+(after?after.lives:'(game over)')+'   still playing: '+(!!after));}

 console.log('\n=== levels ===');
 console.log('  level',await pg.evaluate(()=>window.__s.lvl()),' three stars at',await pg.evaluate(()=>window.__s.goal()),'rounds');

 console.log('\n=== and he picks a favourite ===');
 await pg.evaluate(()=>{const g=window.__s;});
 await pg.evaluate(()=>window.__s.playFav('castle'));
 let seen=null;
 for(let i=0;i<9;i++){seen=await pg.evaluate(()=>window.__s.note('castle'));}
 const fv=await pg.evaluate(()=>window.__s.fav());
 console.log('  after nine visits to the castle:',JSON.stringify(fv),' -> is favourite:',seen);
 const mix=await pg.evaluate(()=>{for(let i=0;i<8;i++)window.__s.note('pond');return window.__s.fav();});
 console.log('  once the pond nearly catches up:',JSON.stringify(mix.fav));
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
