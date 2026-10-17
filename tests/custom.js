const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
(async()=>{
 let s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8');
 s=s.replace("window.__geckoStart=function(){",
  "window.__c={open:()=>openPicker(false),morph:()=>S.morph,custom:()=>S.custom,"+
  "pick:(k)=>{const b=(k==='My own')?document.getElementById('mineGo'):[...document.querySelectorAll('#swatches .sw')].find(x=>x.textContent.trim()===k);if(b)b.click();return !!b;},"+
  "mine:()=>!document.getElementById('mine').hidden,"+
  "dot:(row,i)=>{const d=document.querySelectorAll('#'+row+' i');if(d[i])d[i].click();return d.length;},"+
  "pat:(i)=>{const p=document.querySelectorAll('#patRow button');if(p[i])p[i].click();return p.length;},"+
  "go:()=>document.getElementById('pGo').click(),save:()=>localStorage.getItem(KEY)};\n"+
  "window.__geckoStart=function(){");
 const f=OUT+'custom.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript('try{if(!localStorage.getItem("sd")){localStorage.setItem("sd","1");localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:90,fun:90,clean:90,energy:95,hatched:true,
   born:Date.now()-12*DAY,last:Date.now(),sound:false,coins:80,water:90,warm:90,lamp:true,
   poops:0,wees:0,bg:'desert',stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,
   tank:1,seenGrowth:9,seenDay:new Date().toDateString()}))+');}}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3500);
 await pg.evaluate(()=>window.__c.open());await pg.waitForTimeout(800);
 console.log('"Make my own" button present:',await pg.evaluate(()=>window.__c.pick('My own')));
 await pg.waitForTimeout(600);
 console.log('colour rows shown      :',await pg.evaluate(()=>window.__c.mine()));
 console.log('body colours offered   :',await pg.evaluate(()=>window.__c.dot('dotSkin',4)));
 await pg.waitForTimeout(900);
 console.log('tummy colours offered  :',await pg.evaluate(()=>window.__c.dot('dotBelly',3)));
 await pg.waitForTimeout(900);
 console.log('spot colours offered   :',await pg.evaluate(()=>window.__c.dot('dotSpot',4)));
 await pg.waitForTimeout(900);
 console.log('patterns offered       :',await pg.evaluate(()=>window.__c.pat(3)));
 await pg.waitForTimeout(1500);
 console.log('his colours now        :',JSON.stringify(await pg.evaluate(()=>window.__c.custom())));
 await pg.screenshot({path:OUT+'cu-pick.png'});
 await pg.evaluate(()=>window.__c.go());await pg.waitForTimeout(2500);
 await pg.screenshot({path:OUT+'cu-gecko.png'});
 console.log('saved morph            :',await pg.evaluate(()=>window.__c.morph()));
 await pg.reload();await pg.waitForTimeout(2000);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(3500);
 const after=await pg.evaluate(()=>({m:window.__c.morph(),c:window.__c.custom()}));
 console.log('after a reload         :',JSON.stringify(after));
 await pg.screenshot({path:OUT+'cu-after.png'});
 console.log('ERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
