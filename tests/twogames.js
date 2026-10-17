/* Two girls on one iPad. Everything one of them does must be invisible to the
   other - her gecko, her colours, her coins, her things, her photos. */
const {chromium}=require('playwright');const fs=require('fs');const OUT=__dirname+'/';
const HOOKS="window.__g={"+
 "who:()=>({player:PLAYER,key:KEY,photos:PHOTO_KEY,owner:ME.name}),"+
 "state:()=>({name:S.name,morph:S.morph,coins:S.coins,decor:(S.decor||[]).map(d=>d.t),"+
 "  stickers:Object.keys(S.stickers||{}).length,hatched:!!S.hatched,day:Math.floor((Date.now()-S.born)/864e5)+1}),"+
 "play:(nm,morph)=>{S.name=nm;S.morph=morph;S.hatched=true;S.coins=137;"+
 "  S.decor=[{t:'castle',x:0,z:0,r:0},{t:'pond',x:3,z:1,r:0}];S.stickers={feed:1,game:1,toy:1};"+
 "  applyMorph(morph);buildDecor();save();updateUI();return S.name;},"+
 "keys:()=>Object.keys(localStorage).filter(k=>k.indexOf('gecko')===0).sort(),"+
 "sess:()=>{const o=[];for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(k.indexOf('gecko')===0)o.push(k);}return o.sort();},"+
 "hud:()=>document.getElementById('gday').textContent};\n";
(async()=>{
 const src=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8')
   .replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'twogames.html';fs.writeFileSync(f,src);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 /* leave some old gameplay lying about, the way a real device would have it */
 await pg.addInitScript(`try{
   localStorage.setItem('gecko-pet-v7',JSON.stringify({name:'OldOne',coins:999,hatched:true}));
   localStorage.setItem('gecko-pet-v8-ayla',JSON.stringify({name:'AlsoOld',coins:888,hatched:true}));
   localStorage.setItem('gecko-photos-v8-ayla','["x"]');
   localStorage.setItem('gecko-build','22');
 }catch(e){}`);
 const open=async who=>{await pg.goto('file://'+f+(who?'?p='+who:''));await pg.waitForTimeout(1800);
   await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2600);};

 console.log('=== everything from before is forgotten ===');
 await open('ayla');
 console.log('  keys left on the device:',JSON.stringify(await pg.evaluate(()=>window.__g.keys())));
 const a0=await pg.evaluate(()=>window.__g.state());
 console.log('  Ayla opens on          :',JSON.stringify(a0),a0.hatched?'*** NOT A FRESH EGG ***':'a fresh egg');

 console.log('\n=== Ayla plays ===');
 console.log('  her slot:',JSON.stringify(await pg.evaluate(()=>window.__g.who())));
 await pg.evaluate(()=>window.__g.play('Ziggy','tangerine'));await pg.waitForTimeout(600);
 console.log('  after playing:',JSON.stringify(await pg.evaluate(()=>window.__g.state())));
 console.log('  her dashboard says:',JSON.stringify(await pg.evaluate(()=>window.__g.hud())));

 console.log('\n=== Fleur opens her own link ===');
 await open('fleur');
 console.log('  her slot:',JSON.stringify(await pg.evaluate(()=>window.__g.who())));
 const f0=await pg.evaluate(()=>window.__g.state());
 console.log('  Fleur opens on:',JSON.stringify(f0),f0.hatched?"*** SHE GOT AYLA'S GAME ***":"her own fresh egg");
 await pg.evaluate(()=>window.__g.play('Pip','galaxy'));await pg.waitForTimeout(600);
 console.log('  after playing:',JSON.stringify(await pg.evaluate(()=>window.__g.state())));
 console.log('  her dashboard says:',JSON.stringify(await pg.evaluate(()=>window.__g.hud())));

 console.log('\n=== back to Ayla - untouched? ===');
 await open('ayla');
 const a1=await pg.evaluate(()=>window.__g.state());
 console.log('  Ayla still has:',JSON.stringify(a1));
 const ok=a1.name==='Ziggy'&&a1.morph==='tangerine'&&a1.coins===137&&a1.decor.join()==='castle,pond';
 console.log("  "+(ok?"her game is exactly as she left it":"*** FLEUR CHANGED AYLA'S GAME ***"));

 console.log('\n=== nothing is shared ===');
 const keys=await pg.evaluate(()=>window.__g.keys());
 const sess=await pg.evaluate(()=>window.__g.sess());
 console.log('  saved keys  :',JSON.stringify(keys));
 console.log('  session keys:',JSON.stringify(sess));
 const shared=keys.concat(sess).filter(k=>!/-(ayla|fleur)$/.test(k));
 console.log('  '+(shared.length?'*** SHARED BETWEEN THEM: '+JSON.stringify(shared)+' ***':'every single key carries a name'));
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
