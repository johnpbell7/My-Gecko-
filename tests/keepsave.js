/* The "Fix it" button must throw away the stale COPY OF THE GAME and nothing
   else. If it takes her gecko with it, it is worse than the crash it fixes. */
const {chromium}=require('playwright');const fs=require('fs');const http=require('http');const OUT=__dirname+'/';
const GAME=process.env.GECKO||__dirname+'/../index.html';
const KEY='gecko-pet-v9-ayla';
function serve(dir,port){const t={'.html':'text/html','.js':'text/javascript','.json':'application/json',
  '.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
 const s=http.createServer((rq,rs)=>{let f=decodeURIComponent(rq.url.split('?')[0]);
  if(f==='/')f='/keepsave.html';
  fs.readFile(dir+f,(e,d)=>{if(e){rs.writeHead(404);return rs.end('no');}
   const x=(dir+f).slice((dir+f).lastIndexOf('.'));
   rs.writeHead(200,{'Content-Type':t[x]||'application/octet-stream','Cache-Control':'no-store'});rs.end(d);});});
 return new Promise(r=>s.listen(port,()=>r(s)));}
(async()=>{
 const src=fs.readFileSync(GAME,'utf8')
   .replace("function updateHatch(dt){","function updateHatch(dt){if(window.__boom)throw new TypeError('boom');");
 fs.writeFileSync(OUT+'keepsave.html',src);
 const srv=await serve(__dirname,8793);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();
 /* a gecko she has had for a fortnight: named, grown, coins, things bought, photos */
 const SAVE={name:'Ziggy',morph:'custom',hatched:true,born:Date.now()-14*864e5,last:Date.now(),
   coins:214,hunger:72,fun:64,clean:88,energy:80,water:70,
   custom:{skin:0x4FA8E8,belly:0xCFE9FF,spot:0x1B4A7A,pattern:'stripes'},
   decor:[{t:'castle',x:0,z:0,r:0},{t:'pond',x:4,z:1,r:0},{t:'tunnel',x:-4,z:-1,r:0}],
   owned:{castle:1,pond:1,tunnel:1},stickers:{feed:1,game:1,toy:1,bigtank:1},
   best:{catch:14},tricks:{spin:9},tank:1,tourDone:true,bg:'desert'};
 await pg.addInitScript('try{localStorage.setItem("'+KEY+'",'+JSON.stringify(JSON.stringify(SAVE))+');'+
   'localStorage.setItem("gecko-photos-v9-ayla",JSON.stringify(["photo1","photo2"]));}catch(e){}');
 await pg.goto('http://127.0.0.1:8793/keepsave.html?p=ayla');await pg.waitForTimeout(1800);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2800);
 /* put something in the cache so there is something to throw away */
 await pg.evaluate(()=>caches.open('gecko-old').then(c=>c.put('/stale.txt',new Response('x'))));
 const before=await pg.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));
   return {name:s.name,coins:s.coins,decor:s.decor.length,stickers:Object.keys(s.stickers).length,
           photos:JSON.parse(localStorage.getItem('gecko-photos-v9-ayla')||'[]').length,
           caches:0};},KEY);
 before.caches=await pg.evaluate(async()=>(await caches.keys()).length);
 console.log('  before: '+JSON.stringify(before));
 /* crash it, then tap the button a child would tap */
 await pg.evaluate(()=>{window.__boom=1;});await pg.waitForTimeout(2500);
 const hasBtn=await pg.evaluate(()=>!!document.querySelector('.errGo'));
 console.log('  crashed, Fix it button shown:',hasBtn);
 await pg.evaluate(()=>document.querySelector('.errGo').click());
 await pg.waitForTimeout(4000);
 const after=await pg.evaluate(async k=>{
   let s=null;try{s=JSON.parse(localStorage.getItem(k)||'null');}catch(e){}
   return {url:location.search,save:s&&{name:s.name,coins:s.coins,decor:s.decor&&s.decor.length,
     stickers:s.stickers&&Object.keys(s.stickers).length},
     photos:JSON.parse(localStorage.getItem('gecko-photos-v9-ayla')||'[]').length,
     caches:(await caches.keys()).length};},KEY);
 console.log('  after : '+JSON.stringify(after));
 const kept=after.save&&after.save.name===before.name&&after.save.coins===before.coins
   &&after.save.decor===before.decor&&after.save.stickers===before.stickers&&after.photos===before.photos;
 console.log('\n  her gecko: '+(kept?'untouched - name, coins, things and photos all still there'
   :'*** WIPED BY THE FIX IT BUTTON ***'));
 console.log('  stale copy of the game: '+(after.caches===0?'thrown away':'*** still cached ***'));
 await b.close();srv.close();})();
