/* the first time through: four steps, each waiting for her to do the thing */
const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__t={step:()=>({bar:!document.getElementById('tourBar').hidden,"+
 " label:document.getElementById('tourStep').textContent,text:document.getElementById('tourText').textContent,"+
 " n:S.tour||0,done:!!S.tourDone}),"+
 "gp:()=>[+G.root.position.x.toFixed(1),+G.root.position.z.toFixed(1)],"+
 "screen:(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(camera);"+
 " return [Math.round((v.x+1)/2*window.innerWidth),Math.round((1-v.y)/2*window.innerHeight)];},"+
 "himAt:()=>{const p=G.root.position;const v=new THREE.Vector3(p.x,p.y+.7*growth(),p.z).project(camera);"+
 " return [Math.round((v.x+1)/2*window.innerWidth),Math.round((1-v.y)/2*window.innerHeight)];},"+
 "doorAt:()=>{const v=new THREE.Vector3(TANK.w/2,DOOR.y||1.2,DOOR.z).project(camera);"+
 " return [Math.round((v.x+1)/2*window.innerWidth),Math.round((1-v.y)/2*window.innerHeight)];},"+
 "letOut:()=>letOut(),feed:()=>document.getElementById('bFeed').click(),"+
 "menu:()=>{document.getElementById('bMore').click();const tabs=[...document.querySelectorAll('#menuTabs button')];const t=tabs.find(b=>/collect/i.test(b.textContent));if(t)t.click();"+
 "  return [...document.querySelectorAll('#menuCards button')].map(b=>b.textContent.trim()).filter(Boolean);},"+
 "howto:()=>{const b=[...document.querySelectorAll('#menuCards button')].find(x=>/How to play/.test(x.textContent));"+
 "  if(b){b.click();return true;}return false;},"+
 "closeMenu:()=>{document.getElementById('more').hidden=true;}};\n";
const tapAt=async(pg,xy)=>{
  await pg.evaluate(a=>{const c=document.querySelector('canvas');
    const o={bubbles:true,clientX:a[0],clientY:a[1],pointerId:1,isPrimary:true};
    c.dispatchEvent(new PointerEvent('pointerdown',o));
    window.dispatchEvent(new PointerEvent('pointerup',o));},xy);};
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'tour.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 /* only on the first load - re-seeding on reload is how a test convinces
    itself that nothing was ever saved */
 await pg.addInitScript('try{if(!localStorage.getItem("__seeded")){localStorage.setItem("__seeded","1");localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:60,fun:60,clean:95,energy:95,hatched:true,born:Date.now()-2*DAY,
   last:Date.now(),sound:false,coins:40,water:95,thirst:90,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+');}}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});
 await pg.waitForTimeout(1200);
 const show=async(w)=>{const st=await pg.evaluate(()=>window.__t.step());
   /* once it is finished a hidden bar is the right answer, not a failure */
   console.log('  '+w.padEnd(16)+(st.bar?'"'+st.label+': '+st.text+'"':(st.done?'(bar put away - correct)':'*** BAR NOT SHOWING ***'))+'  (tour='+st.n+(st.done?', done':'')+')');return st;};
 await show('at the start');

 console.log('\n=== step 1: tap the sand ===');
 await tapAt(pg,await pg.evaluate(()=>window.__t.screen(1.5,0,2.0)));
 await pg.waitForTimeout(1400);await show('after tapping');

 console.log('\n=== step 2: tap him ===');
 for(let i=0;i<8;i++){await tapAt(pg,await pg.evaluate(()=>window.__t.himAt()));await pg.waitForTimeout(700);
   if((await pg.evaluate(()=>window.__t.step())).n>=2)break;}
 await show('after a stroke');

 console.log('\n=== step 3: press Feed ===');
 await pg.evaluate(()=>window.__t.feed());await pg.waitForTimeout(1200);await show('after Feed');

 console.log('\n=== step 4: the door ===');
 await pg.evaluate(()=>window.__t.letOut());await pg.waitForTimeout(1400);
 const st4=await show('after the door');
 console.log('  finished:',st4.done===true,'  bar gone:',st4.bar===false);

 console.log('\n=== it stays finished ===');
 await pg.reload();await pg.waitForTimeout(2200);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 await show('after a reload');

 console.log('\n=== and she can ask for it again ===');
 const cards=await pg.evaluate(()=>window.__t.menu());await pg.waitForTimeout(600);
 console.log('  menu has How to play:',cards.some(c=>/How to play/.test(c)));
 console.log('  clicked:',await pg.evaluate(()=>window.__t.howto()));
 await pg.evaluate(()=>window.__t.closeMenu());await pg.waitForTimeout(1200);
 await show('back at step 1');
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
