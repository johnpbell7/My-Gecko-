/* two sisters, two links, two geckos that never see each other */
const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
(async()=>{
 const src=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8');
 const f=OUT+'players.html';fs.writeFileSync(f,src);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];
 const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});

 console.log('=== the plain link asks whose turn it is ===');
 await pg.goto('file://'+f);await pg.waitForTimeout(2600);
 console.log('  chooser showing :',await pg.evaluate(()=>!document.getElementById('whoBox').hidden));
 console.log('  play button gone:',await pg.evaluate(()=>document.getElementById('introGo').hidden));
 console.log('  names offered   :',JSON.stringify(await pg.evaluate(()=>[...document.querySelectorAll('.who b')].map(b=>b.textContent))));
 await pg.screenshot({path:OUT+'who.png'});

 for(const [who,pet] of [['ayla','Ziggy'],['fleur','Pip']]){
   console.log('\n=== '+who+"'s link ===");
   await pg.goto('file://'+f+'?p='+who);await pg.waitForTimeout(2600);
   console.log('  title   :',await pg.title());
   console.log('  headline:',await pg.evaluate(()=>document.getElementById('introTitle').textContent),
               '|',await pg.evaluate(()=>document.getElementById('introSub').textContent.trim()));
   console.log('  chooser hidden:',await pg.evaluate(()=>document.getElementById('whoBox').hidden));
   await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2800);
   /* name her gecko and hatch it, the way she would */
   await pg.evaluate(a=>{const i=document.getElementById('nameIn');if(i)i.value=a;},pet+'y');
   await pg.evaluate(()=>{const g=document.getElementById('pGo');if(g&&!document.getElementById('picker').hidden)g.click();});
   await pg.waitForTimeout(1800);
   const keys=await pg.evaluate(()=>Object.keys(localStorage).filter(k=>k.indexOf('gecko')===0).sort());
   console.log('  saves on the device now:',JSON.stringify(keys));
   console.log('  default pet name offered:',await pg.evaluate(()=>{try{return JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>/gecko-pet/.test(k)))||'{}').name;}catch(e){return null;}}));}

 console.log('\n=== and neither can see the other ===');
 const all=await pg.evaluate(()=>Object.keys(localStorage).filter(k=>/gecko-pet/.test(k)).sort());
 console.log('  separate save slots:',JSON.stringify(all),all.length===2?'  (one each)':'  *** THEY SHARE ONE ***');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(2600);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2600);
 console.log('  back on Ayla\'s link, her gecko is:',await pg.evaluate(()=>document.getElementById('gname').textContent));
 await ctx.close();

 console.log('\n=== on an iPad, held sideways ===');
 const ipad=await b.newContext({viewport:{width:1180,height:820},ignoreHTTPSErrors:true,deviceScaleFactor:1});
 const p2=await ipad.newPage();p2.on('pageerror',e=>{errs.push(e.message);});
 await p2.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:88,fun:40,clean:95,energy:90,hatched:true,born:Date.now()-12*DAY,
   last:Date.now(),sound:false,coins:260,water:85,thirst:80,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,tourDone:true,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await p2.goto('file://'+f+'?p=ayla');await p2.waitForTimeout(2200);
 await p2.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await p2.waitForTimeout(3200);
 await p2.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});
 await p2.waitForTimeout(1400);
 const box=await p2.evaluate(()=>{const c=document.querySelector('.hudCard').getBoundingClientRect();
   const t=document.getElementById('tray').getBoundingClientRect();
   return {card:[Math.round(c.left),Math.round(c.top),Math.round(c.width),Math.round(c.height)],
           tray:[Math.round(t.left),Math.round(t.width)],
           row:getComputedStyle(document.querySelector('.hudCard')).flexDirection};});
 console.log('  hud card [x,y,w,h]:',JSON.stringify(box.card),' laid out',box.row);
 console.log('  tray [x,w]        :',JSON.stringify(box.tray),'of 1180');
 console.log('  card clears the scene middle:',box.card[1]+box.card[3]<300&&box.card[2]<820?'yes':'*** NO ***');
 await p2.screenshot({path:OUT+'ipad.png'});
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
