const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__w3={thirst:()=>Math.round(S.thirst),water:()=>Math.round(S.water),"+
 "setThirst:v=>{S.thirst=v;updateUI();},setWater:v=>{S.water=v;updateUI();},"+
 "need:()=>{const n=need();return n?n[1]:null;},want:()=>want,act:()=>AI.act,"+
 "ring:()=>{const r=document.querySelector('#st-water .ring');return r?r.style.getPropertyValue('--v'):null;},"+
 "lowRing:()=>document.getElementById('st-water').classList.contains('low'),"+
 "tapRing:()=>document.getElementById('st-water').click(),"+
 "put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();return [+q.x.toFixed(1),+q.z.toFixed(1)];},"+
 "warp:(x,z)=>{G.root.position.set(x,groundY(x,z),z);AI.route=null;AI.target=null;AI.act=null;},"+
 "notice:()=>notice(),said:()=>{const b=document.getElementById('bubble');return b.classList.contains('show')?b.textContent:null;},"+
 "tadaOn:()=>!!tadaAt,"+
 "buy:(id)=>{const it=SHOP.find(i=>i.id===id);S.coins=500;buy(it);return S.decor.length;},"+
 "deco:()=>decorating,stopDeco:()=>stopDecorate(),"+
 "draw:()=>{renderer.render(scene,camera);renderer.render(scene,camera);}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'water.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:95,fun:90,clean:95,energy:95,hatched:true,born:Date.now()-20*DAY,
   last:Date.now(),sound:false,coins:500,water:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});

 console.log('=== water ===');
 console.log('  a Water ring exists:',await pg.evaluate(()=>!!document.getElementById('st-water')));
 await pg.evaluate(()=>window.__w3.setWater(18));await pg.waitForTimeout(900);
 console.log('  bowl at 18 -> ring shows '+await pg.evaluate(()=>window.__w3.ring())+', chip is red:',await pg.evaluate(()=>window.__w3.lowRing()));
 await pg.evaluate(()=>window.__w3.tapRing());await pg.waitForTimeout(700);
 console.log('  tapping the ring refills it ->',await pg.evaluate(()=>window.__w3.water()));
 await pg.evaluate(()=>window.__w3.setThirst(25));await pg.evaluate(()=>window.__w3.setWater(4));await pg.waitForTimeout(600);
 console.log('  thirsty, empty bowl, he says: "'+await pg.evaluate(()=>window.__w3.need())+'"');
 await pg.evaluate(()=>window.__w3.setWater(90));await pg.waitForTimeout(600);
 console.log('  thirsty, full bowl,  he says: "'+await pg.evaluate(()=>window.__w3.need())+'"');
 await pg.evaluate(()=>window.__w3.warp(0,1.5));
 let drank=false;const t0=await pg.evaluate(()=>window.__w3.thirst());
 for(let i=0;i<70;i++){await pg.waitForTimeout(1600);
   if(await pg.evaluate(()=>window.__w3.act())==='drink'){drank=true;break;}}
 await pg.waitForTimeout(3000);
 console.log('  he walked over and drank:',drank,' thirst '+t0+' -> '+await pg.evaluate(()=>window.__w3.thirst()));

 console.log('\n=== a new thing gets a moment ===');
 await pg.evaluate(()=>window.__w3.warp(-7,-3.5));await pg.waitForTimeout(500);
 const nd=await pg.evaluate(()=>window.__w3.buy('cactus'));await pg.waitForTimeout(900);
 console.log('  bought a cactus, decorations now '+nd+', he heads over:',await pg.evaluate(()=>window.__w3.tadaOn()));
 console.log('  and it dropped into move mode:',await pg.evaluate(()=>window.__w3.deco()));
 await pg.evaluate(()=>window.__w3.warp(-7,-3.5));await pg.waitForTimeout(400);
 await pg.evaluate(()=>window.__w3.stopDeco());await pg.waitForTimeout(700);
 console.log('  putting it down celebrates again:',await pg.evaluate(()=>window.__w3.tadaOn()));

 console.log('\n=== he notices things ===');
 await pg.evaluate(()=>window.__w3.put('mirror',2.2,1.4));await pg.waitForTimeout(600);
 await pg.evaluate(()=>window.__w3.warp(2.2,2.6));await pg.waitForTimeout(400);
 await pg.evaluate(()=>window.__w3.notice());await pg.waitForTimeout(700);
 console.log('  passing the mirror he says: "'+await pg.evaluate(()=>window.__w3.said())+'"');
 await pg.evaluate(()=>window.__w3.draw());await pg.waitForTimeout(300);
 await pg.screenshot({path:OUT+'water-1.png'});
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
