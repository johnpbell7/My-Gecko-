/* "Every eventuality." Not a promise anyone can keep by reading 4,000 lines -
   but this presses every button on every screen, from several different lives,
   and shouts if anything throws. It is the check that would have caught the
   hatch crash, because it taps the big rainbow button rather than the one a
   grown-up would reach for. */
const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const GAME=process.env.GECKO||__dirname+'/../index.html';
const KEY='gecko-pet-v9-ayla';
const base=o=>Object.assign({name:'Ziggy',morph:'tangerine',hunger:70,fun:70,clean:80,energy:75,
  hatched:true,born:Date.now()-9*DAY,last:Date.now(),sound:false,coins:300,water:70,thirst:70,warm:80,
  lamp:true,poops:0,wees:0,bg:'desert',stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,
  tank:1,seenGrowth:9,tourDone:true,seenDay:new Date().toDateString(),
  tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()},o||{});
const LIVES=[
 ['a fresh egg',                null],
 ['an ordinary day',            base({})],
 ['a full tank',                base({decor:[{t:'tunnel',x:-4,z:-1,r:0},{t:'hammock',x:3,z:-1,r:0},
                                           {t:'digbox',x:-1,z:-2,r:0},{t:'mirror',x:5,z:-1,r:0},
                                           {t:'castle',x:0,z:2,r:0},{t:'pond',x:-6,z:1,r:0}],
                                    owned:{tunnel:1,hammock:1,digbox:1,mirror:1,castle:1,pond:1}})],
 ['poorly and filthy',          base({sick:true,hunger:5,clean:4,water:0,thirst:3,warm:8,lamp:false,poops:6,wees:4})],
 ['fast asleep',                base({asleep:true,energy:12})],
 ['grown up, big tank',         base({born:Date.now()-40*DAY,tank:2,coins:900,
                                      stickers:{feed:1,game:1,toy:1,bigtank:1,trick10:1}})],
 ['her own colours',            base({morph:'custom',custom:{skin:0x4FA8E8,belly:0xCFE9FF,spot:0x1B4A7A,pattern:'stripes'}})],
 ['out on the table',           base({decor:[{t:'castle',x:13,z:3,r:0},{t:'cactus',x:11,z:6,r:0}],owned:{castle:1,cactus:1}})]];
(async()=>{
 const src=fs.readFileSync(GAME,'utf8');
 const f=OUT+'everything.html';fs.writeFileSync(f,src);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 let total=0,bad=0;
 for(const [label,save] of LIVES){
  const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
  const pg=await ctx.newPage();const errs=[];
  pg.on('pageerror',e=>errs.push(e.message));
  if(save)await pg.addInitScript('try{localStorage.setItem("'+KEY+'",'+JSON.stringify(JSON.stringify(save))+')}catch(e){}');
  await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1600);
  await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2600);
  /* press everything that is on the screen, close whatever it opened, repeat */
  let pressed=0;
  for(let round=0;round<7;round++){
    const ids=await pg.evaluate(()=>[...document.querySelectorAll('button,.card,.act,.who,#dotSkin i,#dotBelly i,#dotSpot i,#patRow button')]
      .filter(b=>{const r=b.getBoundingClientRect();
        return r.width>4&&r.height>4&&r.top<innerHeight&&r.bottom>0&&!b.disabled;})
      .map((b,i)=>i));
    for(const i of ids){
      const clicked=await pg.evaluate(j=>{
        const all=[...document.querySelectorAll('button,.card,.act,.who,#dotSkin i,#dotBelly i,#dotSpot i,#patRow button')]
          .filter(b=>{const r=b.getBoundingClientRect();
            return r.width>4&&r.height>4&&r.top<innerHeight&&r.bottom>0&&!b.disabled;});
        const el=all[j];if(!el)return null;
        const what=(el.id||el.textContent||'').trim().slice(0,22);
        /* never the one that throws her gecko away, and never the one that leaves the page */
        if(/setReset|pReset|Start again|setBackup|setRestore|bkFile/.test(el.id+' '+what))return 'skipped';
        el.click();return what;},i);
      if(clicked&&clicked!=='skipped'){pressed++;total++;}
      await pg.waitForTimeout(220);
    }
    /* back out of whatever is open so the next round sees something new */
    await pg.evaluate(()=>{['card','more','shop','photo','album','stickers','settings','hats']
      .forEach(id=>{const e=document.getElementById(id);if(e)e.hidden=true;});
      const s=document.getElementById('gbStop');if(s&&!document.getElementById('gameBar').hidden)s.click();});
    await pg.waitForTimeout(600);
  }
  await pg.waitForTimeout(2500);
  /* and a few taps on the tank itself */
  for(const [x,y] of [[215,560],[120,620],[330,500],[215,430]]){
    await pg.evaluate(a=>{const c=document.querySelector('canvas');
      const o={bubbles:true,clientX:a[0],clientY:a[1],pointerId:1,isPrimary:true};
      c.dispatchEvent(new PointerEvent('pointerdown',o));
      window.dispatchEvent(new PointerEvent('pointerup',o));},[x,y]);
    await pg.waitForTimeout(400);}
  await pg.waitForTimeout(2000);
  const oops=await pg.evaluate(()=>{const e=document.getElementById('err');
    return e&&!e.hidden?((e.querySelector('.errWhy')||e).textContent||'').trim():null;});
  const uniq=[...new Set(errs)];
  if(uniq.length||oops)bad++;
  console.log('  '+label.padEnd(22)+pressed+' things pressed  '+
    (uniq.length||oops?'*** '+(uniq[0]||oops)+' ***':'nothing broke'));
  await ctx.close();}
 console.log('\n  '+total+' presses across '+LIVES.length+' different lives');
 console.log('  '+(bad?'*** '+bad+' of them hit an error ***':'nothing threw, anywhere'));
 await b.close();})();
