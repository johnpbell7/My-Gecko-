const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__p2={put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();return [+q.x.toFixed(1),+q.z.toFixed(1)];},"+
 "clear:()=>{S.decor.length=0;buildDecor();},"+
 "go:()=>{want='toy';toyT=0;toyUse=null;toyPick=null;AI.act=null;AI.route=null;AI.target=null;},"+
 "using:()=>toyUse?toyUse.userData.toy:null,act:()=>AI.act,toyT:()=>+toyT.toFixed(1),"+
 "said:()=>{const b=document.getElementById('bubble');return b.classList.contains('show')?b.textContent:null;},"+
 "gp:()=>[+G.root.position.x.toFixed(2),+G.root.position.y.toFixed(2),+G.root.position.z.toFixed(2)],"+
 "warp:(x,z)=>{G.root.position.set(x,groundY(x,z),z);AI.route=null;AI.target=null;AI.act=null;want=null;},"+
 "obsR:t=>+decorR(t).toFixed(2),doorOpen:()=>+doorOpen.toFixed(2),"+
 "letOut:()=>letOut(),out:()=>outside,trip:()=>trip&&trip.phase,"+
 "shelfStuff:()=>{let n=0;scene.traverse(o=>{if(o.name==='ledgeLog'||o.name==='perchRock')n++;});return n;},"+
 "lamp:()=>{const o=scene.children.find(c=>c.isMesh&&c.geometry&&c.geometry.type==='ConeGeometry'&&c.position.x<-8);"+
 " if(!o)return null;const b=new THREE.Box3().setFromObject(o);return +(b.max.x-b.min.x).toFixed(2);},"+
 "draw:()=>{renderer.render(scene,camera);renderer.render(scene,camera);}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'play.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:95,fun:50,clean:95,energy:95,hatched:true,born:Date.now()-14*DAY,
   last:Date.now(),sound:false,coins:300,water:95,thirst:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3200);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});

 console.log('=== the shelf is cleared ===');
 console.log('  log and perch rock left up there:',await pg.evaluate(()=>window.__p2.shelfStuff()),'(want 0)');
 console.log('  desk lamp shade is now '+await pg.evaluate(()=>window.__p2.lamp())+' wide (was about 1.5)');

 console.log('\n=== things are solid now ===');
 for(const t of ['tunnel','hammock','digbox','mirror','cactus'])
   console.log('  '+t.padEnd(8)+' he keeps '+await pg.evaluate(t=>window.__p2.obsR(t),t)+' away');

 console.log('\n=== he goes and plays with EVERYTHING ===');
 for(const t of ['hammock','cactus','castle','pond','treasure','crystal']){
   await pg.evaluate(()=>window.__p2.clear());
   await pg.evaluate(t=>window.__p2.put(t,-2.5,1.6),t);
   await pg.evaluate(()=>window.__p2.warp(4.5,2.6));await pg.waitForTimeout(500);
   await pg.evaluate(()=>window.__p2.go());
   let got=null;
   for(let i=0;i<70;i++){await pg.waitForTimeout(1500);
     const a=await pg.evaluate(()=>({u:window.__p2.using(),t:window.__p2.toyT(),act:window.__p2.act(),s:window.__p2.said()}));
     if(a.t>0){got=a;break;}}
   console.log('  '+t.padEnd(9)+(got?'played: act="'+(got.act||'-')+'"  said "'+(got.s||'-')+'"':'*** NEVER WENT ***'));}

 console.log('\n=== the door shuts behind him ===');
 await pg.evaluate(()=>window.__p2.clear());
 await pg.evaluate(()=>window.__p2.letOut());
 for(let i=0;i<60;i++){await pg.waitForTimeout(1500);if(await pg.evaluate(()=>window.__p2.out())&&!(await pg.evaluate(()=>window.__p2.trip())))break;}
 await pg.waitForTimeout(4000);
 console.log('  he is out:',await pg.evaluate(()=>window.__p2.out()),'  door open amount:',await pg.evaluate(()=>window.__p2.doorOpen()),'(want near 0)');
 await pg.evaluate(()=>window.__p2.draw());await pg.screenshot({path:OUT+'play-1.png'});
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
