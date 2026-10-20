/* A child staring at "Oops" has nowhere to go. There must be one button that
   gets her out of it - and it must survive the crash that put it there. */
const {chromium}=require('playwright');const fs=require('fs');const http=require('http');const OUT=__dirname+'/';
/* the Cache API refuses to work on file:// urls, so serve it properly */
function serve(dir,port){const types={'.html':'text/html','.js':'text/javascript','.json':'application/json',
  '.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
 const srv=http.createServer((rq,rs)=>{
  let f=decodeURIComponent(rq.url.split('?')[0]);if(f==='/')f='/recover-broken.html';
  const path=dir+f;
  fs.readFile(path,(e,d)=>{if(e){rs.writeHead(404);return rs.end('no');}
   const ext=path.slice(path.lastIndexOf('.'));
   rs.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});rs.end(d);});});
 return new Promise(r=>srv.listen(port,()=>r(srv)));}
const GAME=process.env.GECKO||__dirname+'/../index.html';
(async()=>{
 const src=fs.readFileSync(GAME,'utf8');
 const f=OUT+'recover.html';fs.writeFileSync(f,src);
 /* a copy that throws part-way through, the way a bad build does */
 const broke=src.replace("function updateHatch(dt){","function updateHatch(dt){if(window.__boom)throw new TypeError(\"Cannot read properties of null (reading 'rotation')\");");
 const g=OUT+'recover-broken.html';fs.writeFileSync(g,broke);
 const srv=await serve(__dirname,8791);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();
 await pg.goto('http://127.0.0.1:8791/recover-broken.html?p=ayla');await pg.waitForTimeout(1800);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2600);
 await pg.evaluate(()=>{window.__boom=1;});await pg.waitForTimeout(2500);

 const e=await pg.evaluate(()=>{const d=document.getElementById('err');
   if(!d||d.hidden)return null;
   const btn=d.querySelector('.errGo');
   return {msg:(d.querySelector('.errMsg')||{}).textContent,
           why:(d.querySelector('.errWhy')||{}).textContent,
           button:btn?btn.textContent:null,
           big:btn?Math.round(btn.getBoundingClientRect().height):0};});
 console.log('  the banner says :',e?JSON.stringify(e.msg):'*** NO BANNER ***');
 console.log('  the way out     :',e&&e.button?JSON.stringify(e.button)+' ('+e.big+'px tall)':'*** NO BUTTON ***');
 console.log('  the detail      :',e?JSON.stringify((e.why||'').slice(0,46)):'-');

 /* does the button actually clear the cache and reload? */
 const purged=await pg.evaluate(async()=>{
   await caches.open('gecko-old').then(c=>c.put('/stale.txt',new Response('stale')));
   const before=(await caches.keys()).length;
   window.__geckoFresh=new Proxy(window.__geckoFresh,{apply(t,th,a){window.__called=1;return t.apply(th,a);}});
   return before;});
 await pg.evaluate(()=>document.querySelector('.errGo').click());
 await pg.waitForTimeout(3000);
 const after=await pg.evaluate(()=>({url:location.search,caches:typeof caches!=='undefined'?null:null})).catch(()=>null);
 const left=await pg.evaluate(async()=>(await caches.keys()).length).catch(()=>-1);
 console.log('  after tapping it: url='+(after?after.url:'?')+'   caches left='+left+(left===0?'  (all thrown away)':''));
 const ok=!!(e&&e.button)&&left===0&&/fresh=/.test((after&&after.url)||'');
 console.log('\n  '+(ok?'a child can get herself out of a crash':'*** SHE IS STUCK ***'));
 await b.close();srv.close();})();
