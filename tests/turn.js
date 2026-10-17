const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__t={g:()=>growth(),BX:()=>BX,Z0:()=>Z0,Z1:()=>Z1,"+
 "fits:(t,r)=>decorFits(t,r,false),"+
 "clear:()=>{S.decor.length=0;buildDecor();},"+
 "put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();return 1;},"+
 "turn:()=>{const d=S.decor[0];let r=d.r||0;for(let i=0;i<8;i++){r+=Math.PI/4;if(decorFits(d.t,r,false))break;}d.r=r;"+
 " const q=decorSpot(d.x,d.z,d.t,d.r);d.x=q.x;d.z=q.z;buildDecor();return +(d.r*180/Math.PI).toFixed(0);},"+
 "box:()=>{const b=new THREE.Box3().setFromObject(decorGroups[0]);"+
 " return {x0:+b.min.x.toFixed(2),x1:+b.max.x.toFixed(2),z0:+b.min.z.toFixed(2),z1:+b.max.z.toFixed(2)};}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'turn.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];
 for(const [tag,day,tank] of [['small tank, day 13',13,1],['big tank, fully grown',30,2]]){
  const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
    name:'Ziggy',morph:'tangerine',hunger:95,fun:80,clean:95,energy:95,hatched:true,born:Date.now()-day*DAY,
    last:Date.now(),sound:false,coins:300,water:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
    stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:tank,seenGrowth:9,
    seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
  await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
  await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2500);
  const L=await pg.evaluate(()=>({BX:+window.__t.BX().toFixed(1),Z0:+window.__t.Z0().toFixed(1),Z1:+window.__t.Z1().toFixed(1)}));
  console.log('\n=== '+tag+'  (sand x +/-'+L.BX+', z '+L.Z0+'..'+L.Z1+') ===');
  for(const t of ['tunnel','hammock','digbox','mirror']){
    await pg.evaluate(()=>window.__t.clear());
    await pg.evaluate(t=>window.__t.put(t,2,1),t);
    let line='  '+t+': ';let bad=0;
    for(let i=0;i<8;i++){const deg=await pg.evaluate(()=>window.__t.turn());
      const bx=await pg.evaluate(()=>window.__t.box());
      const ok=bx.x0>=-L.BX-.35&&bx.x1<=L.BX+.35&&bx.z0>=L.Z0-.35&&bx.z1<=L.Z1+.35;
      if(!ok)bad++;line+=deg+'°'+(ok?'✓':'✗')+' ';}
    console.log(line+(bad?'   *** '+bad+' turns leave the tank ***':'   every turn stays inside'));}
  await ctx.close();}
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
