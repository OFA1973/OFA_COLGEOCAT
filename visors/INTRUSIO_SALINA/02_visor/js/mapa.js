// Motor cartogràfic: projecció, zoom i desplaçament, fons WMS, escala i capes de referència.
const S=400, K=Math.cos(41.7*Math.PI/180), X=lo=>(lo-0.1)*K*S, Y=la=>(42.9-la)*S, LO=x=>x/(K*S)+0.1, LA=y=>42.9-y/S;
const W=X(3.35), H=Y(40.5);
const svg=$('svg'), vp=$('vp');
const mlbls=[];
const lbls=[];
function colorOf(a){if(state.colby==='qgis')return a.col;const k=state.colby,f=FIX[k];if(f&&f[a[k]])return f[a[k]];
  const vs=[...new Set(AQ.map(x=>x[k]))].sort();return PAL[vs.indexOf(a[k])%PAL.length]}
function paint(){AQ.forEach(a=>a.el.setAttribute('fill',colorOf(a)));
  const L=$('leg2');if(state.colby==='qgis'){L.hidden=true;return}
  const k=state.colby,c={};AQ.filter(a=>typeof inGm!=='function'||inGm(a)).forEach(a=>c[a[k]]=(c[a[k]]||0)+1);
  L.innerHTML='<h4>'+NAMES[k]+'</h4>'+Object.keys(c).sort((x,y)=>c[y]-c[x]).map(v=>{const s=AQ.find(a=>a[k]===v);return `<div><i class="sw" style="background:${colorOf(s)}"></i><span>${esc(v)}</span><em style="margin-left:auto;font-style:normal;color:var(--muted)">${c[v]}</em></div>`}).join('');L.hidden=false}
const inAq=(lo,la,a)=>(geomOf(a)||[]).some(po=>inRing(lo,la,po[0])&&!po.slice(1).some(h=>inRing(lo,la,h)));
function svgUnit(){const m=svg.getScreenCTM();return m?1/m.a:1}
function pt(e){const m=svg.getScreenCTM().inverse();return{x:e.clientX*m.a+m.e,y:e.clientY*m.d+m.f}}
function apply(){vp.setAttribute('transform',`translate(${state.tx} ${state.ty}) scale(${state.k})`);bmQueue();scaleUpd();if(window.ptRad)ptRad();
  const u=svgUnit(),vw=svg.clientWidth*u,vh=svg.clientHeight*u,mr=$('mr');mr.setAttribute('x',((W-vw)/2-state.tx)/state.k);mr.setAttribute('y',((H-vh)/2-state.ty)/state.k);mr.setAttribute('width',vw/state.k);mr.setAttribute('height',vh/state.k);
  const fs=Math.min(Math.max(9.5*u/state.k,3.2/Math.sqrt(state.k)*u*1.6),11*u/state.k*1.4);lbls.forEach(t=>t.setAttribute('font-size',fs));$('gl').style.strokeWidth=fs*.22;
  $('gl').style.visibility=((state.k<1.5&&svg.clientWidth<700)||state.k<.8||state.k>=6)?'hidden':'';
  const mf=10.5*u/state.k;mlbls.forEach(t=>t.setAttribute('font-size',mf));$('gml').style.strokeWidth=mf*.22;
  $('zvpat').setAttribute('patternTransform',`rotate(45) scale(${(2.6*svgUnit()/state.k).toFixed(4)})`);if(typeof mslbls!=='undefined'){const mf2=10.5*svgUnit()/state.k;mslbls.forEach(t=>{t.setAttribute('font-size',mf2);t.style.visibility=(t._a>=250||state.k>=2&&t._a>=60||state.k>=3.5)?'':'hidden'});$('gmsl').style.strokeWidth=mf2*.25}
  {const cf=11*svgUnit()/state.k;CONQ.forEach(c=>{c.lb.setAttribute('font-size',cf);c.lb.style.visibility=(c.a>=700||state.k>=1.8&&c.a>=150||state.k>=3)?'':'hidden'});$('gcql').style.strokeWidth=cf*.25}
  $('gml').style.visibility=state.k>=(svg.clientWidth<700?5:3.2)?'':'hidden'}
const kMax=()=>Math.max(60,MPU*svgUnit()/(2000*0.00026458));
function zoomAt(x,y,f){const k=Math.min(kMax(),Math.max(.5,state.k*f));f=k/state.k;state.tx=x-(x-state.tx)*f;state.ty=y-(y-state.ty)*f;state.k=k;apply()}
let moved=false,last=null,pd=0;
const up=e=>{ptrs.delete(e.pointerId);svg.classList.remove('drag');setTimeout(()=>moved=false,0)};
function fitBox(b){const u=svgUnit(),vw=svg.clientWidth*u,vh=svg.clientHeight*u,bw=Math.max(b[2]-b[0],8),bh=Math.max(b[3]-b[1],8);const k=Math.min(kMax(),Math.min(vw/bw,vh/bh)*.8);state.k=k;state.tx=W/2-k*(b[0]+bw/2);state.ty=H/2-k*(b[1]+bh/2);apply()}
function bboxOf(a){const b=[1e9,1e9,-1e9,-1e9];(geomOf(a)||a.c).forEach(po=>po[0].forEach(q=>{const x=X(q[0]),y=Y(q[1]);b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)}));return b}
const BMURL='https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:4326&FORMAT=image/jpeg';
let bmT=null,bmSeq=0;
const setImg=(im,x0,y0,x1,y1,href)=>{im.setAttribute('x',x0);im.setAttribute('y',y0);im.setAttribute('width',x1-x0);im.setAttribute('height',y1-y0);im.setAttribute('preserveAspectRatio','none');im.setAttribute('href',href)};
const wms=(l,x0,y0,x1,y1,pw,ph)=>`${BMURL}&LAYERS=${l}&BBOX=${LO(x0).toFixed(5)},${LA(y1).toFixed(5)},${LO(x1).toFixed(5)},${LA(y0).toFixed(5)}&WIDTH=${pw}&HEIGHT=${ph}`;
function bmFull(){const im=$('bfull');if(!state.bm){im.removeAttribute('href');return}const x0=X(0.05),x1=X(3.45),y0=Y(42.95),y1=Y(40.45);setImg(im,x0,y0,x1,y1,wms(state.bm,x0,y0,x1,y1,1400,Math.round(1400*(y1-y0)/(x1-x0))))}
function bmQueue(){if(!state.bm)return;clearTimeout(bmT);bmT=setTimeout(bmView,250)}
function bmView(){if(!state.bm)return;const u=svgUnit(),vw=svg.clientWidth*u,vh=svg.clientHeight*u,x0=((W-vw)/2-state.tx)/state.k,y0=((H-vh)/2-state.ty)/state.k,x1=x0+vw/state.k,y1=y0+vh/state.k;
  const dpr=Math.min(2,devicePixelRatio||1),pw=Math.min(2048,Math.round(svg.clientWidth*dpr)),ph=Math.min(2048,Math.round(svg.clientHeight*dpr));if(pw<10||ph<10)return;
  const href=wms(state.bm,x0,y0,x1,y1,pw,ph),seq=++bmSeq,pre=new Image();pre.onload=()=>{if(seq===bmSeq&&state.bm)setImg($('bimg'),x0,y0,x1,y1,href)};pre.src=href}
function setBm(l){state.bm=l;document.querySelectorAll('#bmseg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.bm===l));$('map').classList.toggle('has-bm',!!l);$('bmorng').classList.toggle('dis',!l);$('bmbtn').setAttribute('aria-pressed',!!l);
  $('bimg').removeAttribute('href');bmFull();bmView()}
const MPU=111320/S;
function scaleUpd(){const u=svgUnit(),mpp=MPU*u/state.k;if(!isFinite(mpp)||mpp<=0)return;
  const den=mpp/0.00026458,mag=Math.pow(10,Math.floor(Math.log10(den))),nice=Math.round(den/(mag/10))*(mag/10);
  $('sclnum').textContent='1:'+Math.round(nice).toLocaleString('ca-ES');
  const target=mpp*100,m10=Math.pow(10,Math.floor(Math.log10(target))),len=[1,2,2.5,5,10].map(f=>f*m10).filter(v=>v<=target).pop()||m10,px=len/mpp,seg=4;
  $('sbar').innerHTML=Array.from({length:seg},()=>`<span style="width:${(px/seg).toFixed(1)}px"></span>`).join('');
  const lab=v=>v>=1000?(v/1000).toLocaleString('ca-ES')+' km':Math.round(v)+' m';
  $('slab').style.width=px+'px';$('slab').style.marginLeft='auto';$('slab').innerHTML=`<span>0</span><span>${lab(len)}</span>`}
const cqlbls=[];
function updLayers(){CONQ.forEach(c=>{const off=state.gm!=='all'&&c.g!==state.gm;c.el.classList.toggle('off',off);c.lb.classList.toggle('off',off)})}
const mslbls=[];
let ptRk='';
function flyPt(p){const k=Math.max(state.k,8);state.k=k;state.tx=W/2-k*X(p.lo);state.ty=H/2-k*Y(p.la);apply()}
const tsvg=$('tsvg'),tvp=$('tvp');
const tpath=c=>c.map(po=>po.map(ring2d).join('')).join('');
function tApply(){tvp.setAttribute('transform',`translate(${TM.tx} ${TM.ty}) scale(${TM.k})`)}
function tpt(e){const m=tsvg.getScreenCTM().inverse();return{x:e.clientX*m.a+m.e,y:e.clientY*m.d+m.f}}
function tZoom(x,y,f){const k=Math.min(80,Math.max(.6,TM.k*f));f=k/TM.k;TM.tx=x-(x-TM.tx)*f;TM.ty=y-(y-TM.ty)*f;TM.k=k;tApply()}
function tFit(z){const b=[1e9,1e9,-1e9,-1e9];z.d.replace(/[ML]([-\d.]+) ([-\d.]+)/g,(m,x,y)=>{x=+x;y=+y;b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)});
  const r=tsvg.getBoundingClientRect(),sc=Math.min(r.width/W,r.height/H),vw=r.width/sc,vh=r.height/sc,k=Math.min(25,Math.min(vw/(b[2]-b[0]+10),vh/(b[3]-b[1]+10))*.6);TM.k=k;TM.tx=W/2-k*(b[0]+b[2])/2;TM.ty=H/2-k*(b[1]+b[3])/2;tApply()}
