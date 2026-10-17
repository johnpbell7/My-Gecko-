const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__bx={put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();save();},"+
 "decor:()=>S.decor.map(d=>d.t),box:()=>(S.box||[]).slice(),"+
 "screenOf:(i)=>{const g=decorGroups[i];const v=new THREE.Vector3();g.getWorldPosition(v);v.y+=.4;"+
 " camera.updateMatrixWorld();camera.matrixWorldInverse.copy(camera.matrixWorld).invert();v.project(camera);"+
 " return [Math.round((v.x*.5+.5)*innerWidth),Math.round((-v.y*.5+.5)*innerHeight)];},"+
 "deco:()=>decorating,"+
 "DOOR:()=>({z:DOOR.z,w:DOOR.w,x:DOOR.x}),IN:()=>[+DOOR_IN.x.toFixed(2),+DOOR_IN.z.toFixed(2)],"+
 "OUT:()=>[+DOOR_OUT.x.toFixed(2),+DOOR_OUT.z.toFixed(2)],"+
 "ramp:()=>{let r=null,best=0;scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='BoxGeometry'"+
 " &&Math.abs(o.rotation.z)>.2&&o.position.x>TANK.w/2-1&&o.position.y<0){"+
 " const bb=new THREE.Box3().setFromObject(o),d=bb.max.z-bb.min.z;if(d>best){best=d;r=o;}}});"+
 " if(!r)return null;const b=new THREE.Box3().setFromObject(r);"+
 " return {z0:+b.min.z.toFixed(2),z1:+b.max.z.toFixed(2),x0:+b.min.x.toFixed(2),x1:+b.max.x.toFixed(2),y0:+b.min.y.toFixed(2),y1:+b.max.y.toFixed(2)};}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'box.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{if(!localStorage.getItem("sd")){localStorage.setItem("sd","1");localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:95,fun:90,clean:95,energy:95,hatched:true,born:Date.now()-20*DAY,
   last:Date.now(),sound:false,coins:300,water:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:2,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 const D=await pg.evaluate(()=>window.__bx.DOOR()),IN=await pg.evaluate(()=>window.__bx.IN()),
       DO=await pg.evaluate(()=>window.__bx.OUT()),R=await pg.evaluate(()=>window.__bx.ramp());
 console.log('=== door and ramp ===');
 console.log('  door opening: z '+(D.z-D.w/2).toFixed(2)+'..'+(D.z+D.w/2).toFixed(2)+'  (middle '+D.z.toFixed(2)+')');
 console.log('  he goes through at z '+IN[1]+' (inside) and '+DO[1]+' (outside)');
 console.log('  ramp spans z '+R.z0+'..'+R.z1+'  x '+R.x0+'..'+R.x1+'  y '+R.y0+'..'+R.y1);
 const centred=Math.abs((R.z0+R.z1)/2-D.z)<.15&&Math.abs(IN[1]-D.z)<.15&&Math.abs(DO[1]-D.z)<.15;
 const inside=R.z0>=D.z-D.w/2-.05&&R.z1<=D.z+D.w/2+.05;
 console.log('  lined up with the opening: '+(centred&&inside?'yes':'*** NO ***'));
 console.log('  meets the sand (y~0) and the table (y~-0.95): '+(R.y1>-.25&&R.y0<-.8?'yes':'*** NO, y '+R.y0+'..'+R.y1+' ***'));
 console.log('\n=== put away and take back out ===');
 await pg.evaluate(()=>window.__bx.put('cactus',-3,2));
 await pg.evaluate(()=>window.__bx.put('mushroom',3,2));
 await pg.waitForTimeout(1200);
 console.log('  in the tank:',JSON.stringify(await pg.evaluate(()=>window.__bx.decor())));
 const p=await pg.evaluate(()=>window.__bx.screenOf(0));
 console.log('  tapping the cactus at',JSON.stringify(p));
 await pg.mouse.click(p[0],p[1]);await pg.waitForTimeout(900);
 const card=await pg.evaluate(()=>{const c=document.getElementById('card');
   return c.hidden?null:(document.getElementById('cTitle').textContent+' | '+
     [...document.querySelectorAll('#cExtra button')].map(b=>b.textContent).join(' / '));});
 console.log('  menu:',card||'*** NOTHING OPENED ***');
 if(card){await pg.click('#dmPut');await pg.waitForTimeout(900);}
 console.log('  in the tank now:',JSON.stringify(await pg.evaluate(()=>window.__bx.decor())));
 console.log('  in the box     :',JSON.stringify(await pg.evaluate(()=>window.__bx.box())));
 await pg.reload();await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2500);
 console.log('  after a reload, box still:',JSON.stringify(await pg.evaluate(()=>window.__bx.box())));
 await pg.click('#bMore');await pg.waitForTimeout(500);
 const tabs=await pg.$$eval('#menuTabs button',bs=>bs.map(b=>b.textContent));
 const i=tabs.findIndex(t=>/collect/i.test(t));
 await pg.$$eval('#menuTabs button',(bs,i)=>bs[i].click(),i);await pg.waitForTimeout(400);
 const cards=await pg.$$eval('#menuCards button',bs=>bs.map(b=>b.textContent));
 console.log('  Collect menu:',JSON.stringify(cards));
 const j=cards.findIndex(t=>/box/i.test(t));
 await pg.$$eval('#menuCards button',(bs,j)=>bs[j].click(),j);await pg.waitForTimeout(900);
 const tiles=await pg.$$eval('#cExtra .tile',bs=>bs.map(b=>b.textContent));
 console.log('  box shows:',JSON.stringify(tiles));
 if(tiles.length){await pg.click('#cExtra .tile');await pg.waitForTimeout(1200);}
 console.log('  back in the tank:',JSON.stringify(await pg.evaluate(()=>window.__bx.decor())));
 console.log('  box now         :',JSON.stringify(await pg.evaluate(()=>window.__bx.box())));
 console.log('  dropped into move mode:',await pg.evaluate(()=>window.__bx.deco()));
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
