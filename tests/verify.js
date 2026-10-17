const {chromium}=require('playwright');const DAY=864e5;
const OUT='/tmp/claude-0/-home-user-My-Gecko-/c26ad7ac-5a79-5fca-b6ae-a98e412f7240/scratchpad/';
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[],ok=[];
 // 1. FRESH BOOT: old v2 save present -> must be wiped, splash -> picker
 {const ctx=await b.newContext({viewport:{width:430,height:860}});const pg=await ctx.newPage();
  pg.on('pageerror',e=>errs.push('fresh: '+e.message));
  await pg.addInitScript(`try{localStorage.setItem('gecko-pet-v5',JSON.stringify({name:'OldPet',hatched:true,coins:500}));
    localStorage.setItem('gecko-photos-v2','[]');}catch(e){}`);
  await pg.goto('file:///home/user/My-Gecko-/index.html?p=ayla');
  await pg.waitForTimeout(2200);
  const st=await pg.evaluate(()=>({intro:!document.getElementById('intro').hidden,
     btn:document.getElementById('introGo').textContent,
     picker:!document.getElementById('picker').hidden,
     oldV3:localStorage.getItem('gecko-pet-v5'),oldPhotos:localStorage.getItem('gecko-photos-v2')}));
  ok.push('fresh boot: splash='+st.intro+' btn="'+st.btn+'" pickerBeforeTap='+st.picker+' oldSaveWiped='+(st.oldV3===null)+' oldPhotosWiped='+(st.oldPhotos===null));
  /* the splash fades at once (.gone) and is display:none 550ms later; booting
     frames run about 1fps in here, so give that timer room */
  await pg.$eval('#introGo',el=>el.click()); await pg.waitForTimeout(2600);
  const after=await pg.evaluate(()=>({intro:document.getElementById('intro').hidden,picker:!document.getElementById('picker').hidden}));
  ok.push('after tap: introHidden='+after.intro+' pickerOpen='+after.picker);
  await pg.screenshot({path:OUT+'v-picker.png'}); await ctx.close();}

 // 1b. THE PLAIN LINK asks whose turn it is, and sends her to her own one
 {const ctx=await b.newContext({viewport:{width:430,height:860}});const pg=await ctx.newPage();
  pg.on('pageerror',e=>errs.push('chooser: '+e.message));
  await pg.goto('file:///home/user/My-Gecko-/index.html');await pg.waitForTimeout(2600);
  const c=await pg.evaluate(()=>({ask:!document.getElementById('whoBox').hidden,
    play:document.getElementById('introGo').hidden,
    names:[...document.querySelectorAll('.who b')].map(b=>b.textContent).join('/')}));
  ok.push('plain link: asksWho='+c.ask+' playHidden='+c.play+' names='+c.names);
  await pg.$eval('.who[data-p="fleur"]',el=>el.click());await pg.waitForTimeout(2200);
  const went=await pg.evaluate(()=>({url:location.search,title:document.title,
    head:document.getElementById('introTitle').textContent}));
  ok.push('picked Fleur -> '+went.url+'  title="'+went.title+'"  headline="'+went.head+'"');
  if(went.url!=='?p=fleur')errs.push('chooser did not send her to her own link: '+went.url);
  await ctx.close();}

 // 2. MESSY TANK: clean badge + glow + mood face
 {const ctx=await b.newContext({viewport:{width:430,height:860}});const pg=await ctx.newPage();
  pg.on('pageerror',e=>errs.push('mess: '+e.message));
  await pg.addInitScript(`try{localStorage.setItem('gecko-pet-v9-ayla',${JSON.stringify(JSON.stringify({
    name:'Ziggy',morph:'tangerine',hunger:80,fun:80,clean:30,energy:85,hatched:true,born:Date.now()-6*DAY,
    last:Date.now(),sound:false,coins:20,water:80,warm:70,lamp:true,poops:6,wees:6,bg:'desert',
    stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1}))})}catch(e){}`);
  await pg.goto('file:///home/user/My-Gecko-/index.html?p=ayla');
  await pg.waitForTimeout(1400); await pg.evaluate(()=>window.__geckoSkipIntro());
  await pg.waitForTimeout(2600);
  const m=await pg.evaluate(()=>({badge:document.getElementById('cleanN').textContent,
    badgeShown:!document.getElementById('cleanN').hidden,
    glow:document.getElementById('bClean').classList.contains('glow'),
    mood:document.getElementById('mood').textContent}));
  ok.push('messy tank: badge="'+m.badge+'" visible='+m.badgeShown+' glowing='+m.glow+' mood='+m.mood);
  await pg.screenshot({path:OUT+'v-mess.png'});
  // tap Clean and confirm it clears
  await pg.$eval('#bClean',el=>el.click()); await pg.waitForTimeout(700);
  const c=await pg.evaluate(()=>({badgeShown:!document.getElementById('cleanN').hidden,
    glow:document.getElementById('bClean').classList.contains('glow')}));
  ok.push('after Clean: badgeVisible='+c.badgeShown+' glowing='+c.glow);
  await ctx.close();}

 // 3. long soak: run 60s of game time, exercise sleep/wake + menu, watch for errors
 {const ctx=await b.newContext({viewport:{width:430,height:860}});const pg=await ctx.newPage();
  pg.on('pageerror',e=>errs.push('soak: '+e.message));
  await pg.addInitScript(`try{localStorage.setItem('gecko-pet-v9-ayla',${JSON.stringify(JSON.stringify({
    name:'<b>Zig&Zag</b>',morph:'galaxy',hunger:60,fun:60,clean:60,energy:60,hatched:true,born:Date.now()-9*DAY,
    last:Date.now()-5*36e5,sound:false,coins:60,water:40,warm:50,lamp:true,poops:2,wees:2,bg:'jungle',
    stickers:{},best:{},tricks:{},decor:[{t:'cactus',x:2,z:1,r:0}],owned:{wizard:1},bedtime:23.9,tank:1}))})}catch(e){}`);
  await pg.goto('file:///home/user/My-Gecko-/index.html?p=ayla');
  await pg.waitForTimeout(1400); await pg.evaluate(()=>window.__geckoSkipIntro());
  await pg.waitForTimeout(2000);
  const nm=await pg.evaluate(()=>{document.getElementById('bMore').click();
    return document.getElementById('menuCards').innerHTML;});
  ok.push('name escaping in menu: '+(nm.includes('&lt;b&gt;')?'ESCAPED ok':'RAW HTML LEAK -> '+((nm.match(/.{0,60}Zig.{0,20}/)||['name not rendered'])[0])));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  await pg.$eval('#bSleep',el=>el.click()); await pg.waitForTimeout(1500);
  await pg.$eval('#bSleep',el=>el.click()); await pg.waitForTimeout(1200);
  await pg.$eval('#bFeed',el=>el.click()); await pg.waitForTimeout(2500);
  await pg.$eval('#bPlay',el=>el.click()); await pg.waitForTimeout(2500);
  await pg.$eval('#bClean',el=>el.click()); await pg.waitForTimeout(1200);
  const away=await pg.evaluate(()=>({poops:document.getElementById('cleanN').textContent}));
  ok.push('5h-away catch-up then Clean -> mess count now '+away.poops);
  await pg.waitForTimeout(3000);
  const e=await pg.evaluate(()=>{const d=document.getElementById('err');return d&&!d.hidden?d.textContent:null;});
  if(e)errs.push('soak ERRBOX '+e);
  await pg.screenshot({path:OUT+'v-soak.png'}); await ctx.close();}

 await b.close();
 console.log(ok.join('\n'));
 console.log('--- ERRORS ---');console.log(errs.length?errs.join('\n'):'NONE');
})();
