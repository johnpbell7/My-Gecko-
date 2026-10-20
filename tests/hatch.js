/* Every way a child can get out of the picker, including the big rainbow
   "Make my own" button - which threw before the egg existed and left the game
   dead for the rest of the session. */
const {chromium}=require('playwright');const fs=require('fs');const OUT=__dirname+'/';
const GAME=process.env.GECKO||__dirname+'/../index.html';
const HOOKS="window.__h={pick:m=>{chosen=m;applyMorph(m);},"+
 "mine:()=>document.getElementById('mineGo').click(),"+
 "state:()=>({active:hatch.active,egg:!!hatch.egg,hatched:!!S.hatched,morph:S.morph,"+
 "  name:S.name,visible:G.root.visible}),"+
 "err:()=>{const e=document.getElementById('err');return e&&!e.hidden?e.textContent:null;}};\n";
(async()=>{
 const src=fs.readFileSync(GAME,'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'hatch.html';fs.writeFileSync(f,src);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 let bad=0;
 for(const morph of ['tangerine','sunny','snowy','mint','galaxy','berry','custom']){
   const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
   const pg=await ctx.newPage();const errs=[];
   pg.on('pageerror',e=>errs.push(e.message));
   await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1800);
   await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2600);
   /* she chooses, names him and taps Hatch my egg! */
   if(morph==='custom')await pg.evaluate(()=>window.__h.mine());
   else await pg.evaluate(m=>window.__h.pick(m),morph);
   await pg.waitForTimeout(500);
   await pg.evaluate(()=>{const i=document.getElementById('nameIn');if(i)i.value='Spot';});
   await pg.evaluate(()=>document.getElementById('pGo').click());
   await pg.waitForTimeout(1200);
   const mid=await pg.evaluate(()=>window.__h.state());
   /* and the egg wobbles, cracks, and he comes out */
   let out=null;
   for(let i=0;i<40;i++){await pg.waitForTimeout(1200);
     const s=await pg.evaluate(()=>window.__h.state());
     if(s.hatched&&s.visible){out=s;break;}}
   const oops=await pg.evaluate(()=>window.__h.err());
   const ok=!!out&&!errs.length&&!oops;
   if(!ok)bad++;
   console.log('  '+morph.padEnd(10)+(ok?'egg appeared, wobbled, hatched - "'+out.name+'"'
     :'*** '+(errs[0]||oops||('stuck: egg='+mid.egg+' active='+mid.active+' hatched='+mid.hatched))+' ***'));
   await ctx.close();}
 console.log('\n'+(bad?'*** '+bad+' of 7 ways in are broken ***':'all 7 ways in hatch cleanly'));
 await b.close();})();
