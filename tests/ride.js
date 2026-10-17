const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__r={g:()=>growth(),BX:()=>BX,Z0:()=>Z0,Z1:()=>Z1,"+
 "clear:()=>{S.decor.length=0;buildDecor();},"+
 "put:(t,x,z,r)=>{const q=decorSpot(x,z,t,r||0);S.decor.push({t:t,x:q.x,z:q.z,r:r||0});buildDecor();"+
 " return [+q.x.toFixed(2),+q.z.toFixed(2)];},"+
 "box:(i)=>{const b=new THREE.Box3().setFromObject(decorGroups[i]);"+
 " return {x0:+b.min.x.toFixed(2),x1:+b.max.x.toFixed(2),y1:+b.max.y.toFixed(2),z0:+b.min.z.toFixed(2),z1:+b.max.z.toFixed(2)};},"+
 "go:()=>{want='toy';toyT=0;toyUse=null;toyPick=null;AI.act=null;AI.route=null;AI.target=null;},"+
 "using:()=>toyUse&&toyUse.userData.toy,rideT:()=>+rideT.toFixed(1),"+
 "gp:()=>[+G.root.position.x.toFixed(2),+G.root.position.y.toFixed(2),+G.root.position.z.toFixed(2)],"+
 "warp:(x,z)=>{G.root.position.set(x,groundY(x,z),z);AI.route=null;AI.target=null;}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'ride.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];
 const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:95,fun:60,clean:95,energy:95,hatched:true,born:Date.now()-30*DAY,
   last:Date.now(),sound:false,coins:300,water:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:2,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3000);
 const lim=await pg.evaluate(()=>({BX:+window.__r.BX().toFixed(1),Z0:+window.__r.Z0().toFixed(1),Z1:+window.__r.Z1().toFixed(1),g:+window.__r.g().toFixed(2)}));
 console.log('tank sand x +/-'+lim.BX+'  z '+lim.Z0+'..'+lim.Z1+'   he is x'+lim.g);
 for(const [t,r,label] of [['tunnel',0,'tunnel'],['tunnel',Math.PI/2,'tunnel turned'],
                           ['hammock',0,'hammock'],['digbox',0,'digging box'],['mirror',0,'mirror']]){
   await pg.evaluate(()=>window.__r.clear());
   const at=await pg.evaluate(a=>window.__r.put(a[0],a[1],a[2],a[3]),[t,r?0:5.5,r?2.0:1.0,r]);
   const bx=await pg.evaluate(()=>window.__r.box(0));
   const inside = bx.x0>=-lim.BX-.35 && bx.x1<=lim.BX+.35 && bx.z0>=lim.Z0-.35 && bx.z1<=lim.Z1+.35 && bx.y1<=5.4;
   console.log('\n'+label+' at '+JSON.stringify(at)+'  spans x '+bx.x0+'..'+bx.x1+'  z '+bx.z0+'..'+bx.z1+'  top '+bx.y1
     +'   '+(inside?'fits the tank':'*** STICKS OUT ***'));
   await pg.evaluate(()=>window.__r.warp(0,3.0));
   await pg.evaluate(()=>window.__r.go());
   let used=null;
   for(let i=0;i<40;i++){await pg.waitForTimeout(2000);const u=await pg.evaluate(()=>window.__r.using());if(u){used=u;break;}}
   console.log('  climbed on: '+(used||'NEVER GOT ON'));
   if(used){await pg.waitForTimeout(6000);
     const p1=await pg.evaluate(()=>window.__r.gp());
     await pg.screenshot({path:OUT+'ride-'+label.replace(/ /g,'-')+'.png'});
     await pg.waitForTimeout(9000);
     const p2=await pg.evaluate(()=>window.__r.gp());
     /* he walks out of the tunnel mouth and stands in front of the mirror, so
        being a bit outside the toy's own box is the toy working, not failing.
        The mirror deliberately holds him a body's length back, or his face
        ends up painted on the glass, so it gets a longer leash. */
     const slack = t==='mirror' ? 5 : 2;
     const inBox = p1[0]>=bx.x0-slack && p1[0]<=bx.x1+slack && p1[2]>=bx.z0-slack && p1[2]<=bx.z1+slack;
     console.log('  he is at '+JSON.stringify(p1)+' then '+JSON.stringify(p2)
       +'   '+(inBox?'on the toy':'*** standing away from it ***')
       +(Math.hypot(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2])>.15?'  and moving with it':'  (still)'));}
 }
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
