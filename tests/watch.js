const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__w={put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();},"+
 "ride:()=>{toyPick=decorGroups[0];toyUse=decorGroups[0];toyT=60;rideT=3;want=null;AI.act=null;},"+
 "using:()=>toyUse&&toyUse.userData.toy,watching:()=>!!closeUp,"+
 "dist:()=>+camera.position.distanceTo(G.root.position).toFixed(1),"+
 "draw:()=>renderer.render(scene,camera)};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'watch.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:95,fun:90,clean:95,energy:95,hatched:true,born:Date.now()-30*DAY,
   last:Date.now(),sound:false,coins:300,water:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:2,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 await pg.evaluate(()=>window.__w.put('tunnel',1.5,1.0));
 await pg.evaluate(()=>window.__w.ride());await pg.waitForTimeout(2500);
 console.log('on a toy                :',await pg.evaluate(()=>window.__w.using()));
 const chip=await pg.evaluate(()=>{const c=document.getElementById('watchChip');return c.hidden?null:c.textContent;});
 console.log('"watch" chip shows      :',chip||'NO');
 const far=await pg.evaluate(()=>window.__w.dist());
 await pg.click('#watchChip');await pg.waitForTimeout(2500);
 const near=await pg.evaluate(()=>window.__w.dist());
 console.log('watching                :',await pg.evaluate(()=>window.__w.watching()));
 console.log('HUD out of the way      :',await pg.evaluate(()=>document.body.classList.contains('watching')));
 console.log('camera distance         : '+far+' -> '+near+'   '+(near<far?'moved in close':'*** NO CLOSER ***'));
 await pg.evaluate(()=>window.__w.draw());await pg.screenshot({path:OUT+'watch-1.png'});
 await pg.mouse.click(215,430);await pg.waitForTimeout(1800);
 console.log('a tap puts it back      :',!(await pg.evaluate(()=>window.__w.watching())));
 console.log('HUD back                :',!(await pg.evaluate(()=>document.body.classList.contains('watching'))));
 console.log('ERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
