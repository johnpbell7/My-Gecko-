const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
(async()=>{
 let s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8');
 s=s.replace("window.__geckoStart=function(){",
  "window.__c={CAVE:CAVE,keepIn:keepIn,V:(x,y,z)=>new THREE.Vector3(x,y,z),"+
  "p:()=>G.root.position,inCave:()=>!!AI.inCave,caveT:()=>+caveT.toFixed(1),want:()=>want,"+
  "go:()=>{want='cave';caveT=0;AI.route=null;AI.target=null;callPt=null;},"+
  "put:(x,z)=>{G.root.position.set(x,0,z);AI.vy=0;},"+
  "kinds:()=>{const g=scene.getObjectByName('hideRock');return g?g.userData.kind:'NO GROUP';}};\n"+
  "window.__geckoStart=function(){");
 const f=OUT+'cave.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:90,fun:90,clean:92,energy:95,hatched:true,
   born:Date.now()-14*DAY,last:Date.now(),sound:false,coins:60,water:90,warm:95,lamp:false,
   poops:0,wees:0,bg:'desert',stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,
   tank:1,seenGrowth:9,seenDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(4000);
 const C=await pg.evaluate(()=>window.__c.CAVE);
 console.log('cave at ('+C.x+','+C.z+')  outer '+C.rOut+'  inner '+C.rIn+'  mouth +/-'+C.mouth+' rad');
 console.log('tappable as:',await pg.evaluate(()=>window.__c.kinds()));

 // 1. walls hold, mouth lets through (probe the wall band, from outside)
 const wall=await pg.evaluate(()=>{const D=window.__c,C=D.CAVE;let blocked=0,through=0,leaks=[];
   const r=(C.rIn+C.rOut)/2;
   for(let a=0;a<Math.PI*2;a+=Math.PI/36){
     const v=D.V(C.x+Math.sin(a)*r,0,C.z+Math.cos(a)*r);
     const bx=v.x,bz=v.z;D.keepIn(v);
     const moved=Math.hypot(v.x-bx,v.z-bz)>1e-6;
     const aa=a>Math.PI?a-Math.PI*2:a;
     if(Math.abs(aa)<C.mouth){through++;}
     else if(moved)blocked++;else leaks.push(+aa.toFixed(2));}
   return {blocked,through,leaks};});
 console.log('wall test: '+wall.blocked+' pushed out of the wall, '+wall.through+' left free in the mouth, leaks: '+(wall.leaks.length?wall.leaks.join(','):'none'));
 await pg.evaluate(()=>window.__c.put(0,2));await pg.waitForTimeout(1200);

 // 2. he walks in when asked, and stays
 await pg.evaluate(()=>window.__c.put(-1.5,2.2));
 await pg.evaluate(()=>window.__c.go());
 let inAt=-1;
 for(let i=0;i<40;i++){await pg.waitForTimeout(2200);
   const d=await pg.evaluate(()=>({x:+window.__c.p().x.toFixed(2),z:+window.__c.p().z.toFixed(2),
     inC:window.__c.inCave(),ct:window.__c.caveT(),w:window.__c.want()}));
   if(i%5===0)console.log('  c'+i+' at('+d.x+','+d.z+') inside='+d.inC+' restT='+d.ct+' want='+d.w);
   if(d.inC&&inAt<0){inAt=i;console.log('  WENT IN at step '+i+' -> ('+d.x+','+d.z+')');
     await pg.screenshot({path:OUT+'cave-in.png'});}
   if(inAt>=0&&!d.inC&&d.ct<=0){console.log('  CAME BACK OUT at step '+i+' -> ('+d.x+','+d.z+')');break;}}
 if(inAt<0)console.log('  NEVER GOT IN');
 await pg.screenshot({path:OUT+'cave-after.png'});
 console.log('ERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
