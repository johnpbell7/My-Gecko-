/* The view was stuck on him. She must be able to look around, and always get
   back. */
const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const GAME=process.env.GECKO||__dirname+'/../index.html';
const HOOKS="window.__c={look:()=>[+look.x.toFixed(2),+look.z.toFixed(2)],"+
 "pan:()=>[+panX.toFixed(2),+panZ.toFixed(2)],"+
 "cam:()=>[+camera.position.x.toFixed(1),+camera.position.y.toFixed(1),+camera.position.z.toFixed(1)],"+
 "ang:()=>[+camT.toFixed(2),+camPT.toFixed(2),+camZoom.toFixed(2)],"+
 "gp:()=>[+G.root.position.x.toFixed(2),+G.root.position.z.toFixed(2)],"+
 "chip:()=>{const c=document.getElementById('backChip');return c.hidden?null:c.textContent;},"+
 "tapChip:()=>document.getElementById('backChip').click(),"+
 "draw:()=>{renderer.render(scene,camera);renderer.render(scene,camera);}};\n";
const two=async(pg,from,to)=>{
 /* two fingers sliding together, the way she would */
 await pg.evaluate(a=>{const c=document.querySelector('canvas');
   const mk=(t,id,x,y)=>c.dispatchEvent(new PointerEvent(t,{bubbles:true,pointerId:id,clientX:x,clientY:y,isPrimary:id===1}));
   const mv=(id,x,y)=>window.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:id,clientX:x,clientY:y}));
   mk('pointerdown',1,a.fx-40,a.fy);mk('pointerdown',2,a.fx+40,a.fy);
   for(let i=1;i<=8;i++){const u=i/8;
     mv(1,a.fx-40+(a.tx-a.fx)*u,a.fy+(a.ty-a.fy)*u);
     mv(2,a.fx+40+(a.tx-a.fx)*u,a.fy+(a.ty-a.fy)*u);}
   window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1}));
   window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:2}));},
  {fx:from[0],fy:from[1],tx:to[0],ty:to[1]});};
(async()=>{
 const src=fs.readFileSync(GAME,'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'camera.html';fs.writeFileSync(f,src);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:90,fun:60,clean:95,energy:90,hatched:true,born:Date.now()-10*DAY,
   last:Date.now(),sound:false,coins:200,water:85,thirst:80,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,tourDone:true,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1800);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});
 await pg.waitForTimeout(1200);

 const l0=await pg.evaluate(()=>window.__c.look());
 console.log('  looking at '+JSON.stringify(l0)+'   chip: '+JSON.stringify(await pg.evaluate(()=>window.__c.chip())));

 console.log('\n  --- two fingers, slide the view across ---');
 await two(pg,[215,430],[70,330]);
 await pg.waitForTimeout(2500);
 const p1=await pg.evaluate(()=>window.__c.pan()),l1=await pg.evaluate(()=>window.__c.look());
 const moved=Math.hypot(l1[0]-l0[0],l1[1]-l0[1]);
 console.log('  pan now '+JSON.stringify(p1)+'  looking at '+JSON.stringify(l1)
   +'  -> moved '+moved.toFixed(2)+(moved>1?'  (the view really moved)':'  *** STILL STUCK ***'));
 console.log('  chip: '+JSON.stringify(await pg.evaluate(()=>window.__c.chip())));
 await pg.evaluate(()=>window.__c.draw());await pg.screenshot({path:OUT+'camera-panned.png'});

 console.log('\n  --- and back again ---');
 await pg.evaluate(()=>window.__c.tapChip());await pg.waitForTimeout(2500);
 const l2=await pg.evaluate(()=>window.__c.look()),g=await pg.evaluate(()=>window.__c.gp());
 const home=Math.hypot(l2[0]-g[0],l2[1]-g[1]);
 console.log('  looking at '+JSON.stringify(l2)+'  he is at '+JSON.stringify(g)
   +'  -> '+home.toFixed(2)+' away'+(home<3?'  (back on him)':'  *** DID NOT COME BACK ***'));
 console.log('  chip: '+JSON.stringify(await pg.evaluate(()=>window.__c.chip())));

 console.log('\n  --- one finger still swivels, and further than before ---');
 const a0=await pg.evaluate(()=>window.__c.ang());
 await pg.evaluate(()=>{const c=document.querySelector('canvas');
   const o=(t,x,y)=>({bubbles:true,pointerId:9,clientX:x,clientY:y,isPrimary:true});
   c.dispatchEvent(new PointerEvent('pointerdown',o('d',300,500)));
   for(let i=1;i<=10;i++)window.dispatchEvent(new PointerEvent('pointermove',o('m',300-i*22,500-i*6)));
   window.dispatchEvent(new PointerEvent('pointerup',o('u',80,440)));});
 await pg.waitForTimeout(2000);
 const a1=await pg.evaluate(()=>window.__c.ang());
 console.log('  swivel '+a0[0]+' -> '+a1[0]+'   tilt '+a0[1]+' -> '+a1[1]);
 const ok=moved>1&&home<3&&Math.abs(a1[0]-a0[0])>0.1;
 console.log('\n  '+(ok?'she can look around, and always get back to him':'*** the camera is still stuck ***'));
 console.log('  ERRORS: '+(errs.length?errs.join(' | '):'none'));
 await b.close();})();
