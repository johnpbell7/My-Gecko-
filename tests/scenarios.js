const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const base=(x)=>Object.assign({name:'Ziggy',morph:'tangerine',hunger:85,fun:85,clean:85,energy:90,hatched:true,
  born:Date.now()-10*DAY,last:Date.now(),sound:false,coins:120,water:80,warm:80,lamp:true,poops:0,wees:0,
  bg:'desert',stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,
  seenGrowth:9,seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString()},x||{});
const HOOKS="window.__s={S:()=>S,CAVE:CAVE,BED:BED,p:()=>G.root.position,inCave:()=>!!AI.inCave,"+
 "asleep:()=>S.asleep,inBed:()=>!!AI.inBed,sick:()=>S.sick,shed:()=>S.shed,coins:()=>S.coins,"+
 "tank:()=>S.tank,decor:()=>S.decor.length,owned:()=>Object.keys(S.owned),stick:()=>Object.keys(S.stickers).length,"+
 "photos:()=>{try{return JSON.parse(localStorage.getItem(PHOTO_KEY)||'[]').length;}catch(e){return -1;}},"+
 "act:(k)=>moreAction(k),buy:(id)=>{const it=SHOP.find(i=>i.id===id);buy(it);return S.coins;},"+
 "setCoins:(c)=>{S.coins=c;updateCoins();},makeSick:()=>{S.sick=true;updateUI();},"+
 "makeShed:()=>{S.shed=1;updateUI();},present:()=>{spawnPresent();setTimeout(()=>openPresent(),300);},"+
 "cardText:()=>{const t=document.getElementById('cTitle'),x=document.getElementById('cText');"+
 "return t&&!document.getElementById('card').hidden?(t.textContent+' | '+x.textContent).slice(0,120):null;},"+
 "doMove:()=>doMove(),tasks:()=>rollTasks().list.map(t=>t.id+':'+t.n+'/'+t.g),"+
 "fillTasks:()=>{const t=rollTasks();t.list.forEach(x=>{x.n=x.g;});updateUI();},"+
 "claim:()=>claimTasks(),stars:()=>S.stars||0,trick:(k)=>{try{doTrick(k);return true;}catch(e){return 'ERR '+e.message;}},"+
 "photo:()=>photo(),bed:()=>{document.getElementById('bSleep').click();},growAnim:()=>!!growAnim};\n";
(async()=>{
 let s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'scen.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const allErrs=[];
 const boot=async(state,wait)=>{
   const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
   const pg=await ctx.newPage();pg.on('pageerror',e=>allErrs.push(e.message));
   await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify(state))+')}catch(e){}');
   await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1600);
   await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(wait||3000);
   return {pg,ctx};};

 console.log('=== 1. bedtime: he must walk into the cave through the mouth ===');
 {const {pg,ctx}=await boot(base({energy:20}));
  await pg.evaluate(()=>{const P=window.__s.p();P.set(2.5,0,2.4);});
  await pg.evaluate(()=>window.__s.bed());
  let scraped=0,arrived=false;const C=await pg.evaluate(()=>window.__s.CAVE);
  for(let i=0;i<30;i++){await pg.waitForTimeout(2200);
    const d=await pg.evaluate(()=>({x:+window.__s.p().x.toFixed(2),z:+window.__s.p().z.toFixed(2),
      inC:window.__s.inCave(),bed:window.__s.inBed(),as:window.__s.asleep()}));
    const dist=Math.hypot(d.x-C.x,d.z-C.z),ang=Math.abs(Math.atan2(d.x-C.x,d.z-C.z));
    if(!d.inC&&dist<C.rOut+.06&&ang>C.mouth)scraped++;
    if(d.inC){arrived=true;console.log('  reached the cave at step '+i+' -> ('+d.x+','+d.z+')  asleep='+d.as);break;}}
  console.log('  got into the cave to sleep :',arrived);
  console.log('  frames pressed on the wall :',scraped);
  await pg.screenshot({path:OUT+'sc-bed.png'});await ctx.close();}

 console.log('=== 2. coming back after a long time away ===');
 for(const hrs of [1,5,24,24*7]){
  const {pg,ctx}=await boot(base({last:Date.now()-hrs*36e5,hunger:60,fun:60,clean:60,energy:60}),3500);
  const st=await pg.evaluate(()=>{const S=window.__s.S();return {h:Math.round(S.hunger),f:Math.round(S.fun),
    c:Math.round(S.clean),e:Math.round(S.energy),poo:S.poops,wee:S.wees,sick:S.sick};});
  console.log('  away '+String(hrs).padStart(4)+'h ->',JSON.stringify(st));
  await ctx.close();}

 console.log('=== 3. poorly, then medicine ===');
 {const {pg,ctx}=await boot(base());
  await pg.evaluate(()=>window.__s.makeSick());await pg.waitForTimeout(600);
  console.log('  poorly:',await pg.evaluate(()=>window.__s.sick()));
  await pg.$eval('#bMed',el=>el.click());await pg.waitForTimeout(2500);
  console.log('  after medicine:',await pg.evaluate(()=>window.__s.sick()));await ctx.close();}

 console.log('=== 4. shedding ===');
 {const {pg,ctx}=await boot(base());
  await pg.evaluate(()=>window.__s.makeShed());await pg.waitForTimeout(800);
  console.log('  shedding started:',await pg.evaluate(()=>window.__s.shed())>0);await ctx.close();}

 console.log('=== 5. the shop ===');
 {const {pg,ctx}=await boot(base({coins:5}));
  console.log('  with 5 coins, buying a 45-coin helmet ->',await pg.evaluate(()=>window.__s.buy('helmet')),'coins left (unchanged = refused)');
  await pg.evaluate(()=>window.__s.setCoins(300));
  console.log('  with 300, hat  ->',await pg.evaluate(()=>window.__s.buy('helmet')),'coins left');
  console.log('  with 300, bg   ->',await pg.evaluate(()=>window.__s.buy('snow')),'coins left');
  console.log('  with 300, decor->',await pg.evaluate(()=>window.__s.buy('treasure')),'coins left');
  console.log('  owned now      :',JSON.stringify(await pg.evaluate(()=>window.__s.owned())));
  console.log('  decorations    :',await pg.evaluate(()=>window.__s.decor()));await ctx.close();}

 console.log('=== 6. the daily present ===');
 {const {pg,ctx}=await boot(base({presentDay:''}));
  await pg.evaluate(()=>window.__s.present());await pg.waitForTimeout(2500);
  console.log('  card says:',await pg.evaluate(()=>window.__s.cardText()));
  console.log('  owned/decor after:',JSON.stringify(await pg.evaluate(()=>window.__s.owned())),
    await pg.evaluate(()=>window.__s.decor()));await ctx.close();}

 console.log('=== 7. daily jobs and the star ===');
 {const {pg,ctx}=await boot(base());
  console.log('  today:',JSON.stringify(await pg.evaluate(()=>window.__s.tasks())));
  await pg.evaluate(()=>window.__s.fillTasks());await pg.waitForTimeout(500);
  const before=await pg.evaluate(()=>window.__s.stars());
  await pg.evaluate(()=>window.__s.claim());await pg.waitForTimeout(1500);
  console.log('  stars '+before+' -> '+await pg.evaluate(()=>window.__s.stars()));await ctx.close();}

 console.log('=== 8. moving to the big tank ===');
 {const {pg,ctx}=await boot(base({born:Date.now()-13*DAY,decor:[{t:'cactus',x:3,z:1,r:0}]}));
  await pg.evaluate(()=>window.__s.doMove());await pg.waitForTimeout(4000);
  await pg.waitForTimeout(3000);
  console.log('  tank now:',await pg.evaluate(()=>window.__s.tank()),' decorations kept:',await pg.evaluate(()=>window.__s.decor()));
  await pg.screenshot({path:OUT+'sc-bigtank.png'});await ctx.close();}

 console.log('=== 9. photos ===');
 {const {pg,ctx}=await boot(base());
  await pg.evaluate(()=>window.__s.photo());await pg.waitForTimeout(1800);
  await pg.evaluate(()=>window.__s.photo());await pg.waitForTimeout(1800);
  console.log('  photos in the album:',await pg.evaluate(()=>window.__s.photos()));
  console.log('  save-to-phone button:',await pg.evaluate(()=>!!document.getElementById('photoSave')));
  await ctx.close();}

 console.log('=== 10. growth spurt on the next day ===');
 {const {pg,ctx}=await boot(base({born:Date.now()-6*DAY,seenGrowth:.75,seenDay:'Mon Jan 01 2024'}),5000);
  console.log('  growth animation played:',await pg.evaluate(()=>window.__s.growAnim())||'(already finished)');
  console.log('  stickers so far       :',await pg.evaluate(()=>window.__s.stick()));await ctx.close();}

 console.log('\nPAGE ERRORS:',allErrs.length?('\n  '+allErrs.join('\n  ')):'none');
 await b.close();})();
