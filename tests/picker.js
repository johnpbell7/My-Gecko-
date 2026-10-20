/* While she is choosing colours he must hold still. He used to turn on the spot
   the whole time, so she was judging a colour by looking at his tail. */
const {chromium}=require('playwright');const fs=require('fs');const OUT=__dirname+'/';
const GAME=process.env.GECKO||__dirname+'/../index.html';
const HOOKS="window.__pk={ang:()=>+pickA.toFixed(3),"+
 "face:()=>{const h=new THREE.Vector3();G.head.getWorldPosition(h);"+
 " const v=h.clone().project(camera);"+
 " return {onScreen:Math.abs(v.x)<1&&Math.abs(v.y)<1,"+
 "  x:+((v.x+1)/2*100).toFixed(0),y:+((1-v.y)/2*100).toFixed(0),"+
 "  toward:+camera.position.clone().sub(h).normalize().dot(new THREE.Vector3(Math.sin(G.root.rotation.y),0,Math.cos(G.root.rotation.y))).toFixed(2)};},"+
 "mine:()=>document.getElementById('mineGo').click(),"+
 "tapCol:i=>{const d=document.querySelectorAll('#dotSkin i');if(d[i])d[i].click();},"+
 "draw:()=>{renderer.render(scene,camera);renderer.render(scene,camera);}};\n";
(async()=>{
 const src=fs.readFileSync(GAME,'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'picker.html';fs.writeFileSync(f,src);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1800);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2800);
 await pg.evaluate(()=>window.__pk.mine());await pg.waitForTimeout(1500);

 const angs=[];
 for(let i=0;i<10;i++){await pg.waitForTimeout(1500);angs.push(await pg.evaluate(()=>window.__pk.ang()));}
 const swing=Math.max(...angs)-Math.min(...angs);
 console.log('  camera angle over 15s: '+JSON.stringify(angs.slice(0,6))+(angs.length>6?' …':''));
 console.log('  total swing: '+swing.toFixed(3)+' rad '+(swing<0.05?'(he holds still)':'*** STILL SPINNING ***'));

 const f1=await pg.evaluate(()=>window.__pk.face());
 console.log('  his face: on screen='+f1.onScreen+'  at '+f1.x+'% across, '+f1.y+'% down'
   +'   (camera is '+(f1.toward>.25?'in front of him':f1.toward<-.25?'*** BEHIND HIM ***':'side on')+')');
 await pg.evaluate(()=>window.__pk.draw());await pg.screenshot({path:OUT+'picker-still.png'});
 /* she scrolls down the long colour list - he must not slide off the top */
 await pg.evaluate(()=>{const sh=document.querySelector('#picker .sheet');if(sh)sh.scrollTop=sh.scrollHeight;});
 await pg.waitForTimeout(2200);
 const f2=await pg.evaluate(()=>window.__pk.face());
 console.log('  after scrolling the colour list: face at '+f2.y+'% down'
   +(f2.onScreen&&f2.y>4&&f2.y<42?'  (still in view)':'  *** SLID OFF THE SCREEN ***'));
 await pg.evaluate(()=>window.__pk.draw());await pg.screenshot({path:OUT+'picker-scrolled.png'});

 /* a tap should give a small turn that settles back, not a spin */
 await pg.evaluate(()=>window.__pk.tapCol(6));
 const after=[];
 for(let i=0;i<8;i++){await pg.waitForTimeout(1200);after.push(await pg.evaluate(()=>window.__pk.ang()));}
 const peak=Math.max(...after.map(a=>Math.abs(a-angs[angs.length-1])));
 const settled=Math.abs(after[after.length-1]-angs[angs.length-1]);
 console.log('  after tapping a colour: moved '+peak.toFixed(2)+' rad, settled back to within '+settled.toFixed(3));
 const good=swing<0.05&&f1.onScreen&&f1.toward>.2&&peak>0.05&&settled<0.12&&f1.y>4&&f1.y<40;
 console.log('\n  '+(good?'he holds a three-quarter view and only nods when she picks'
   :'*** the preview is not right ***'));
 console.log('  ERRORS: '+(errs.length?errs.join(' | '):'none'));
 await b.close();})();
