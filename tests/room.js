const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__rm={BX:()=>BX,Z0:()=>Z0,Z1:()=>Z1,W:()=>TANK.w,D:()=>TANK.d,L:()=>LEDGE,R:()=>RAMP,g:()=>growth(),"+
 "free:(x,z)=>{const q=new THREE.Vector3(x,0,z);const w=AI.inCave;AI.inCave=false;keepIn(q);AI.inCave=w;"+
 " return Math.hypot(q.x-x,q.z-z)<1e-3;},"+
 "warp:(x,z)=>{G.root.position.set(x,groundY(x,z),z);AI.route=null;AI.target=null;AI.act=null;},"+
 "goto:(x,z)=>{callTo(new THREE.Vector3(x,groundY(x,z),z));},"+
 "gp:()=>[+G.root.position.x.toFixed(2),+G.root.position.y.toFixed(2),+G.root.position.z.toFixed(2)],"+
 "put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();return [+q.x.toFixed(2),+q.z.toFixed(2)];}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'room.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];
 for(const [tag,day,tank] of [['small tank',10,1],['big tank',30,2]]){
  const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(tag+': '+e.message));
  await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
    name:'Ziggy',morph:'tangerine',hunger:95,fun:90,clean:95,energy:95,hatched:true,born:Date.now()-day*DAY,
    last:Date.now(),sound:false,coins:300,water:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
    stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:tank,seenGrowth:9,
    seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
  await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
  await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
  const d=await pg.evaluate(()=>({BX:window.__rm.BX(),Z0:window.__rm.Z0(),Z1:window.__rm.Z1(),
    W:window.__rm.W(),D:window.__rm.D(),L:window.__rm.L(),R:window.__rm.R(),g:window.__rm.g()}));
  console.log('\n=== '+tag+' ===');
  console.log('  glass  : x +/-'+(d.W/2).toFixed(1)+'   z +/-'+(d.D/2).toFixed(1));
  console.log('  he can : x +/-'+d.BX.toFixed(1)+'   z '+d.Z0.toFixed(1)+'..'+d.Z1.toFixed(1)
    +'   = '+((2*d.BX)*(d.Z1-d.Z0)).toFixed(0)+' sq   (gap to glass: '+(d.W/2-d.BX).toFixed(2)+' side, '+(d.D/2+d.Z0).toFixed(2)+' back)');
  console.log('  shelf  : z '+d.L.z0.toFixed(2)+'..'+d.L.z1.toFixed(2)+'   corridor behind it: '+(d.L.z0-d.Z0).toFixed(2)+' deep (he is '+(2.37*d.g).toFixed(2)+' wide)');
  // grid sweep: how much of the sand is actually standable
  const grid=await pg.evaluate(async d=>{let free=0,tot=0;
    for(let x=-d.BX;x<=d.BX;x+=.35)for(let z=d.Z0;z<=d.Z1;z+=.35){tot++;if(window.__rm.free(x,z))free++;}
    return {free:free,tot:tot};},d);
  console.log('  open sand: '+(100*grid.free/grid.tot).toFixed(0)+'% of it is standable');
  // can he actually walk the corridor behind the shelf?
  const zc=(d.Z0+d.L.z0)/2;
  await pg.evaluate(a=>window.__rm.warp(a[0],a[1]),[d.L.x1+1.2,zc]);
  await pg.evaluate(a=>window.__rm.goto(a[0],a[1]),[d.L.x0-1.2,zc]);
  let best=1e9;
  for(let i=0;i<110;i++){await pg.waitForTimeout(1500);
    const p=await pg.evaluate(()=>window.__rm.gp());
    best=Math.min(best,Math.hypot(p[0]-(d.L.x0-1.2),p[2]-zc));if(best<.8)break;}
  console.log('  walked behind the shelf, left to right: '+(best<.8?'yes':'NO (got within '+best.toFixed(1)+')'));
  console.log('  a toy against the back glass -> ',await pg.evaluate(()=>window.__rm.put('digbox',0,-99)));
  console.log('  a shell against the front glass ->',await pg.evaluate(()=>window.__rm.put('shell',0,99)));
  await pg.screenshot({path:OUT+'room-'+tank+'.png'});
  await ctx.close();}
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
