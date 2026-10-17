/* This one keeps happening: the file is one long script, so a const used by
   something the tank build calls, but declared further down, does not read as
   undefined - it throws, and the whole game dies with a blank tank. It needs a
   particular save to go off (a poop AND a toy, the last time), so it slips past
   every test that boots a tidy one. This boots a spread of real saves and only
   asks one thing: did anything throw? */
const {chromium}=require('playwright');const DAY=864e5;
const base=()=>({name:'Ziggy',morph:'tangerine',hunger:80,fun:60,clean:70,energy:80,hatched:true,
  born:Date.now(),last:Date.now(),sound:false,coins:120,water:80,thirst:70,warm:90,lamp:true,
  poops:0,wees:0,bg:'desert',stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1});
const D=(t,x,z)=>({t:t,x:x,z:z,r:0});
const CASES=[
 ['day 1, empty tank',            s=>s],
 ['day 1, a mess',                s=>{s.poops=3;s.wees=2;return s;}],
 ['day 1, a toy',                 s=>{s.decor=[D('tunnel',-3,1)];return s;}],
 ['day 1, a mess AND a toy',      s=>{s.poops=1;s.decor=[D('tunnel',-3,1)];return s;}],
 ['day 1, a mess AND an ornament',s=>{s.wees=1;s.decor=[D('cactus',2,1)];return s;}],
 ['day 20, full tank',            s=>{s.born=Date.now()-20*DAY;s.poops=4;s.wees=3;
    s.decor=[D('tunnel',-3,1),D('hammock',3,2),D('digbox',-4,-2),D('mirror',5,1),D('castle',1,-2)];return s;}],
 ['big tank, things on the table',s=>{s.born=Date.now()-30*DAY;s.tank=2;s.poops=2;s.wees=2;
    s.decor=[D('tunnel',-3,1),D('castle',14,3),D('cactus',-14,2),D('digbox',15,-3)];return s;}],
 ['asleep, mess, toys',           s=>{s.born=Date.now()-9*DAY;s.asleep=true;s.poops=2;s.wees=1;
    s.decor=[D('hammock',3,2),D('pond',-2,2)];return s;}],
 ['sick and hungry, full tank',   s=>{s.born=Date.now()-16*DAY;s.hunger=4;s.clean=3;s.water=0;s.thirst=2;
    s.warm=5;s.lamp=false;s.sick=true;s.poops=6;s.wees=5;
    s.decor=[D('tunnel',-3,1),D('mirror',4,2),D('bones',-5,2)];return s;}],
 ['away five hours, full tank',   s=>{s.born=Date.now()-11*DAY;s.last=Date.now()-5*3600e3;s.poops=3;
    s.decor=[D('digbox',-4,-1),D('treasure',3,2)];return s;}]];
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 let bad=0;
 for(const [label,make] of CASES){
   const st=make(base());
   const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
   const pg=await ctx.newPage();const errs=[];
   pg.on('pageerror',e=>errs.push(e.message));
   await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify(st))+')}catch(e){}');
   await pg.goto('file://'+(process.argv[2]||(process.env.GECKO||__dirname+'/../index.html'))+'?p=ayla');
   await pg.waitForTimeout(2200);
   await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro()).catch(()=>{});
   await pg.waitForTimeout(2600);
   /* a dead script leaves the tank empty, so check something 3D really arrived */
   const built=await pg.evaluate(()=>{try{return !!(window.__geckoStart)&&document.querySelectorAll('canvas').length>0;}catch(e){return false;}});
   if(errs.length)bad++;
   console.log('  '+label.padEnd(32)+(errs.length?'*** '+errs.join(' | ')+' ***':'ok')+(built?'':'   *** NOTHING BUILT ***'));
   await ctx.close();}
 console.log('\n'+(bad?'*** '+bad+' of '+CASES.length+' saves kill the game ***':'all '+CASES.length+' saves boot clean'));
 await b.close();})();
