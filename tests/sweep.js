const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const state=(x)=>Object.assign({name:'Ziggy',morph:'tangerine',hunger:85,fun:85,clean:80,energy:92,hatched:true,
  born:Date.now()-16*DAY,last:Date.now(),sound:false,coins:200,water:60,warm:75,lamp:true,poops:2,wees:2,
  bg:'desert',stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,stars:1,streak:3,
  seenGrowth:9,seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString()},x||{});
(async()=>{
 let s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8');
 s=s.replace("window.__geckoStart=function(){",
  "window.__t={act:(k)=>moreAction(k),game:()=>game&&game.kind,end:()=>{try{endGame(true);}catch(e){}},"+
  "open:()=>[...document.querySelectorAll('.overlay')].filter(o=>!o.hidden).map(o=>o.id),"+
  "pos:()=>[+G.root.position.x.toFixed(1),+G.root.position.y.toFixed(1),+G.root.position.z.toFixed(1)],"+
  "outside:()=>outside,trip:()=>trip&&trip.phase,sendHome:()=>{try{sendHome();}catch(e){}},"+
  "stats:()=>({hunger:Math.round(S.hunger),fun:Math.round(S.fun),clean:Math.round(S.clean),"+
  "energy:Math.round(S.energy),coins:S.coins,water:Math.round(S.water),sick:S.sick,asleep:S.asleep})};\n"+
  "window.__geckoStart=function(){");
 const f=OUT+'sweep.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];
 const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();
 pg.on('pageerror',e=>errs.push('PAGE: '+e.message));
 pg.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text().slice(0,140));});
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify(state()))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1600);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3500);
 console.log('start stats:',JSON.stringify(await pg.evaluate(()=>window.__t.stats())));

 const clearOverlays=async()=>{
   await pg.evaluate(()=>{document.querySelectorAll('.overlay').forEach(o=>o.hidden=true);
     ['more','settings','picker','shop','album','stickers'].forEach(id=>{const e=document.getElementById(id);if(e)e.hidden=true;});});
   await pg.waitForTimeout(400);};

 // every card in the More menu
 for(const k of ['water','treat','lamp','vet','call','jobs','journey','album','shop','stickers','fact','settings','decorate']){
   const before=errs.length;
   await pg.evaluate(k=>window.__t.act(k),k);
   await pg.waitForTimeout(1800);
   const open=await pg.evaluate(()=>window.__t.open());
   console.log(('  '+k).padEnd(12),'opened:'+(open.length?open.join(','):'(none)'),
               errs.length>before?'  <-- ERROR':'');
   if(k==='decorate')await pg.evaluate(()=>{const d=document.getElementById('dbDone');d&&d.click();});
   await clearOverlays();
 }
 await pg.evaluate(()=>window.__t.act('lamp'));await pg.waitForTimeout(400); // back on

 // every mini-game: start, let it run, end it
 for(const g of ['catch','hide','feather','bubbles']){
   const before=errs.length;
   await pg.evaluate(g=>window.__t.act(g),g);
   await pg.waitForTimeout(2500);
   const running=await pg.evaluate(()=>window.__t.game());
   await pg.waitForTimeout(6000);
   await pg.screenshot({path:OUT+'sw-'+g+'.png'});
   await pg.evaluate(()=>window.__t.end());
   await pg.waitForTimeout(2500);
   const stopped=await pg.evaluate(()=>window.__t.game());
   const barGone=await pg.evaluate(()=>document.getElementById('gameBar').hidden);
   console.log(('  game '+g).padEnd(16),'started:'+(running===g),' ended:'+(!stopped)+' barHidden:'+barGone,
               errs.length>before?'  <-- ERROR':'');
   await clearOverlays();
 }

 // the door trip, then home
 await pg.evaluate(()=>window.__t.act('out'));
 for(let i=0;i<40&&!(await pg.evaluate(()=>window.__t.outside()));i++)await pg.waitForTimeout(2500);
 console.log('  door out      :',await pg.evaluate(()=>window.__t.outside()));
 await pg.evaluate(()=>window.__t.sendHome());
 let home=false;
 for(let i=0;i<40;i++){await pg.waitForTimeout(2500);
   const o=await pg.evaluate(()=>({o:window.__t.outside(),t:window.__t.trip()}));
   if(!o.o&&!o.t){home=true;break;}}
 console.log('  came home     :',home);

 // interrupting a game by feeding, and the main buttons
 for(const id of ['bFeed','bPlay','bClean','bMed','bSleep']){
   const before=errs.length;
   await pg.$eval('#'+id,el=>el.click());await pg.waitForTimeout(2200);
   console.log(('  btn '+id).padEnd(16),errs.length>before?'<-- ERROR':'ok');
 }
 await pg.$eval('#bSleep',el=>el.click());await pg.waitForTimeout(1500); // wake him
 await clearOverlays();
 await pg.waitForTimeout(6000);
 console.log('end stats  :',JSON.stringify(await pg.evaluate(()=>window.__t.stats())));
 console.log('where he is:',JSON.stringify(await pg.evaluate(()=>window.__t.pos())));
 await pg.screenshot({path:OUT+'sw-final.png'});
 console.log('ERRORS:',errs.length?('\n   '+errs.join('\n   ')):'none');
 await b.close();})();
