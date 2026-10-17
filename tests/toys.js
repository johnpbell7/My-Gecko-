const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
(async()=>{
 let s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8');
 s=s.replace("window.__geckoStart=function(){",
  "window.__t={toys:()=>toyList().map(g=>[g.userData.toy,+g.position.x.toFixed(2),+g.position.z.toFixed(2)]),"+
  "go:()=>{want='toy';toyT=0;toyPick=null;AI.route=null;AI.target=null;callPt=null;},"+
  "toyT:()=>+toyT.toFixed(1),using:()=>toyUse&&toyUse.userData.toy,p:()=>G.root.position,"+
  "mk:(t)=>{const q=decorSpot(rand(-3,3),rand(.4,2.2));S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();},"+
  "game:()=>{startGame('bubbles');},endg:()=>{endGame();},"+
  "timing:()=>timing&&{pos:+timing.pos.toFixed(3),start:+timing.start.toFixed(3),w:+timing.w.toFixed(3)},"+
  "tap:()=>document.getElementById('tbGo').click(),coins:()=>S.coins,"+
  "card:()=>{const c=document.getElementById('card');return c.hidden?null:document.getElementById('cText').textContent.slice(0,110);}};\n"+
  "window.__geckoStart=function(){");
 const f=OUT+'toys.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:90,fun:60,clean:90,energy:95,hatched:true,
   born:Date.now()-12*DAY,last:Date.now(),sound:false,coins:200,water:90,warm:90,lamp:true,
   poops:0,wees:0,bg:'desert',stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,
   tank:1,seenGrowth:9,seenDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3500);

 console.log('=== toys ===');
 for(const t of ['wheel','hammock','mirror'])await pg.evaluate(k=>window.__t.mk(k),t);
 await pg.waitForTimeout(1500);
 console.log('  placed:',JSON.stringify(await pg.evaluate(()=>window.__t.toys())));
 await pg.evaluate(()=>window.__t.go());
 let used=null;
 for(let i=0;i<50;i++){await pg.waitForTimeout(2200);
   const u=await pg.evaluate(()=>window.__t.using());
   if(u){used=u;console.log('  he walked over and started using the '+u+' after '+((i+1)*2.2).toFixed(0)+'s');break;}}
 if(!used)console.log('  HE NEVER REACHED A TOY');
 else{await pg.screenshot({path:OUT+'ty-play.png'});
   let stopped=false;
   for(let i=0;i<40;i++){await pg.waitForTimeout(2200);
     if(!(await pg.evaluate(()=>window.__t.using()))){stopped=true;console.log('  and finished with it on his own');break;}}
   if(!stopped)console.log('  (still playing when the test ran out - fine)');}

 console.log('=== the bonus shot at the end of a game ===');
 const c0=await pg.evaluate(()=>window.__t.coins());
 await pg.evaluate(()=>window.__t.game());await pg.waitForTimeout(3000);
 await pg.evaluate(()=>window.__t.endg());await pg.waitForTimeout(800);
 console.log('  bonus bar appeared:',!!(await pg.evaluate(()=>window.__t.timing())));
 let hit=false;
 for(let i=0;i<40;i++){await pg.waitForTimeout(140);
   const t=await pg.evaluate(()=>window.__t.timing());if(!t)break;
   if(t.pos>t.start+t.w*.4&&t.pos<t.start+t.w*.6){await pg.evaluate(()=>window.__t.tap());hit=true;break;}}
 await pg.waitForTimeout(2000);
 console.log('  tapped in the gold:',hit,' coins '+c0+' -> '+await pg.evaluate(()=>window.__t.coins()));
 console.log('  result card says  :',await pg.evaluate(()=>window.__t.card()));
 await pg.screenshot({path:OUT+'ty-bonus.png'});
 console.log('ERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
