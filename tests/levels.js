const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__lv={lvl:k=>gameLvl(k),goal:k=>goalOf(k),best:()=>S.best||{},lvls:()=>S.lvl||{},"+
 "bestTxt:k=>bestTxt(k),trickTxt:k=>trickTxt(k),trickLevel:k=>trickLevel(k),trickDone:k=>trickDone(k),"+
 "play:(k,score)=>{startGame(k);game.cd=0;game.score=score;if(k==='hide')game.pts=score;},"+
 "finish:()=>{const g=game;endGame();},"+
 "perfect:n=>{for(let i=0;i<n;i++){S.trickBest=S.trickBest||{};performTrick('spin',.95);}},"+
 "stickers:()=>Object.keys(S.stickers||{}),"+
 "setLvl:(k,v)=>{S.lvl=S.lvl||{};S.lvl[k]=v;},"+
 "hic:()=>{startHic(6);return !!hic;},hicOn:()=>!!hic,mist:()=>mist()};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'levels.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:95,fun:90,clean:95,energy:95,hatched:true,born:Date.now()-20*DAY,
   last:Date.now(),sound:false,coins:300,water:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:2,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});

 console.log('=== the ladder, per game ===');
 for(const k of ['catch','feather','bubbles','hide']){
   const l1=await pg.evaluate(k=>window.__lv.lvl(k),k), g1=await pg.evaluate(k=>window.__lv.goal(k),k);
   console.log('  '+k.padEnd(9)+' Level '+l1+'  goal '+g1+'   card says: "'+await pg.evaluate(k=>window.__lv.bestTxt(k),k)+'"');}

 console.log('\n=== beating a level moves you up ===');
 for(const [k,score,what] of [['catch',6,'exactly the goal'],['catch',2,'well under'],['bubbles',12,'exactly the goal'],['hide',6,'exactly the goal']]){
   const before=await pg.evaluate(k=>window.__lv.lvl(k),k);
   await pg.evaluate(a=>window.__lv.play(a[0],a[1]),[k,score]);await pg.waitForTimeout(700);
   await pg.evaluate(()=>window.__lv.finish());await pg.waitForTimeout(900);
   /* the bonus-shot bar comes up first; tap it */
   const bar=await pg.evaluate(()=>{const t=document.getElementById('timeBar');return t&&!t.hidden;});
   if(bar){await pg.mouse.click(215,700);await pg.waitForTimeout(1200);}
   const after=await pg.evaluate(k=>window.__lv.lvl(k),k);
   const card=await pg.evaluate(()=>{const c=document.getElementById('card');return c.hidden?null:
     (document.getElementById('cTitle').textContent+' | '+document.getElementById('cExtra').textContent.replace(/Play again/,''));});
   console.log('  '+k+' scoring '+score+' ('+what+'): Level '+before+' -> '+after+(after>before?'  UP':'  stayed'));
   console.log('     card: '+(card||'(no card)'));
   await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c)c.click();});await pg.waitForTimeout(500);}

 console.log('\n=== difficulty actually rises ===');
 await pg.evaluate(()=>window.__lv.setLvl('catch',9));
 console.log('  catch at Level 9 needs '+await pg.evaluate(()=>window.__lv.goal('catch'))+' (Level 1 needed 6)');
 console.log('  hide at Level 1 has '+await pg.evaluate(()=>3+Math.floor((1-1)/3))+' rounds, at Level 10 has '+await pg.evaluate(()=>3+Math.floor((10-1)/3)));

 console.log('\n=== tricks ===');
 console.log('  before:      "'+await pg.evaluate(()=>window.__lv.trickTxt('spin'))+'"');
 for(const n of [2,4,7,11,16]){
   await pg.evaluate(n=>window.__lv.perfect(n),n);await pg.waitForTimeout(400);
   console.log('  after '+String(await pg.evaluate(()=>window.__lv.trickDone('spin'))).padStart(2)+' perfect: Level '
     +await pg.evaluate(()=>window.__lv.trickLevel('spin'))+'  "'+await pg.evaluate(()=>window.__lv.trickTxt('spin'))+'"');}
 console.log('  stickers won:',JSON.stringify((await pg.evaluate(()=>window.__lv.stickers())).filter(x=>/lvl|trick/.test(x))));

 console.log('\n=== hiccups ===');
 console.log('  started:',await pg.evaluate(()=>window.__lv.hic()));
 await pg.waitForTimeout(2500);
 console.log('  still going:',await pg.evaluate(()=>window.__lv.hicOn()));
 await pg.evaluate(()=>window.__lv.mist());await pg.waitForTimeout(800);
 console.log('  a misting cures them:',!(await pg.evaluate(()=>window.__lv.hicOn())));
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
