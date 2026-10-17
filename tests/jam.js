const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
(async()=>{
 let s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8');
 s=s.replace("window.__geckoStart=function(){",
  "window.__j={hunt:()=>hunt&&{k:hunt.kind,t:+((hunt.t||0).toFixed(1))},act:()=>AI.act,"+
  "crickets:()=>crickets.length,ball:()=>ball&&ball.state,"+
  "feed:()=>{document.getElementById('bFeed').click();},play:()=>{document.getElementById('bPlay').click();},"+
  "bar:()=>{const b=document.getElementById('ballBar');return b?!b.hidden:'missing';},"+
  "loo:()=>{goLoo();},stalk:()=>{hunt={kind:'cricket',c:crickets[0]};startAct('stalk',.6);}};\n"+
  "window.__geckoStart=function(){");
 const f=OUT+'jam.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'galaxy',hunger:40,fun:60,clean:70,energy:95,hatched:true,
   born:Date.now()-1*DAY,last:Date.now(),sound:false,coins:19,water:90,warm:90,lamp:true,
   poops:0,wees:0,bg:'nursery',stickers:{},best:{},tricks:{},decor:[],owned:{chef:1},hat:'chef',
   bedtime:23.9,tank:1,seenGrowth:9,seenDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3500);

 console.log('=== 1. a wee in the middle of a hunt must not jam him ===');
 await pg.evaluate(()=>window.__j.feed());await pg.waitForTimeout(2500);
 console.log('  crickets out:',await pg.evaluate(()=>window.__j.crickets()));
 await pg.evaluate(()=>window.__j.stalk());await pg.waitForTimeout(600);
 console.log('  hunting     :',JSON.stringify(await pg.evaluate(()=>window.__j.hunt())));
 await pg.evaluate(()=>window.__j.loo());          // the interruption
 await pg.waitForTimeout(9000);
 console.log('  after a wee interrupted it, hunt =',JSON.stringify(await pg.evaluate(()=>window.__j.hunt())),
   '(null = he can hunt again)');
 let ate=false,start=await pg.evaluate(()=>window.__j.crickets());
 for(let i=0;i<50;i++){await pg.waitForTimeout(2200);
   const c=await pg.evaluate(()=>window.__j.crickets());
   if(c<start){ate=true;console.log('  he ate one after '+((i+1)*2.2).toFixed(0)+'s ('+start+' -> '+c+')');break;}}
 if(!ate)console.log('  HE NEVER ATE - still jammed, crickets '+await pg.evaluate(()=>window.__j.crickets()));

 console.log('=== 2. fetch can be stopped ===');
 await pg.evaluate(()=>window.__j.play());await pg.waitForTimeout(1500);
 console.log('  ball out:',await pg.evaluate(()=>window.__j.ball()),' bar showing:',await pg.evaluate(()=>window.__j.bar()));
 await pg.evaluate(()=>window.__j.play());await pg.waitForTimeout(1500);
 console.log('  after tapping Play again -> ball:',await pg.evaluate(()=>window.__j.ball()),
   ' bar showing:',await pg.evaluate(()=>window.__j.bar()));
 await pg.evaluate(()=>window.__j.play());await pg.waitForTimeout(1200);
 console.log('  and it comes back:',await pg.evaluate(()=>window.__j.ball()));
 await pg.$eval('#bbStop',el=>el.click());await pg.waitForTimeout(1500);
 console.log('  the bar button also stops it:',await pg.evaluate(()=>window.__j.ball()));
 await pg.screenshot({path:OUT+'jam.png'});
 console.log('ERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
