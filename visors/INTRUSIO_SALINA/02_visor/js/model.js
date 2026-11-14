// MODEL: dades (punts i capes), paràmetres i llindars, estat de l'aplicació i càlculs
// (sèries filtrades, classes, estadístics per punt i per zona). Sense dibuix.
const state={fx:{},pos:{},q:'',sel:null,stack:null,colby:'tp',k:1,tx:0,ty:0};
const PORD={'Basament3':0,'Basament2':1,'Basament1':2,'Quaternari profund':3,'Quaternari':4};
const PAL=['#2a7fb8','#e08a2c','#3a9e5b','#c0504d','#8064a2','#4bacc6','#b8a22a','#7f7f7f','#d46ab0','#5a6e2c','#9c6b3c','#2c5e7f'];
const FIX={tp:{'Aqüífer':'#2a7fb8','Sistema aqüífer':'#5a3e9b','Aqüitard':'#d9a441','Aqüíclude':'#9c9c9c'},
  cp:{'Lliure':'#2a9d8f','Predominantment lliure':'#8ccfc4','Semiconfinat':'#e9a84c','Confinat':'#c0504d','Artesià':'#7b2d26'},
  ps:{'Quaternari':'#f2c14e','Quaternari profund':'#e07a3f','Basament1':'#6c8ebf','Basament2':'#3f5f8f','Basament3':'#1f3354'}};
const NAMES={tp:'Tipus',na:'Naturalesa',cp:'Comportament',ps:'Posició',po:'Porositat',tf:'Tipus de formació'};
const POS=['Quaternari','Quaternari profund','Basament1','Basament2','Basament3'];
const FX=[['tp','Tipus'],['ps','Posició'],['na','Naturalesa'],['cp','Comportament hidràulic'],['po','Porositat'],['tf','Tipus de formació']];
const fxOk=(a,skip)=>FX.every(([k])=>k===skip||!state.fx[k].size||state.fx[k].has(a[k]));
const TPS=['Aqüífer','Sistema aqüífer','Aqüíclude','Aqüitard'];
const geomOf=a=>state.gm==='all'||a.g===state.gm?a.c:(a.g==='X'?(state.gm==='ACA'?a.cA:a.cC):null);
const areaOf=a=>state.gm==='all'||a.g===state.gm?a.a:(a.g==='X'?(state.gm==='ACA'?a.aA:a.aC):0);
const inGm=a=>{const g=geomOf(a);return !!(g&&g.length)};
const gestTxt=a=>a.g==='X'?`Compartida: ${String(a.pa).replace('.',',')}% ACA · ${String(a.pc).replace('.',',')}% CHE`:a.g;
const shown=a=>state.pos[a.ps]&&state.tp[a.tp]&&inGm(a)&&fxOk(a);
const match=a=>shown(a)&&(!state.q||a.s.includes(state.q));
function tally(k,skip){const c={};AQ.filter(a=>state.pos[a.ps]&&state.tp[a.tp]&&inGm(a)&&fxOk(a,skip)&&(!state.q||a.s.includes(state.q))).forEach(a=>c[a[k]]=(c[a[k]]||0)+1);return c}
const nmSort=(a,b)=>a.n.localeCompare(b.n,'ca')||String(a.id).localeCompare(String(b.id));
function anaRows(P){const out=[];[...P].sort(nmSort).forEach(p=>{const m=new Map();AK.forEach(k=>ser(p,k).forEach(q=>{const key=tkey(q[0])+'|'+q[2];if(!m.has(key))m.set(key,{p,t:q[0],s:q[2],v:{}});m.get(key).v[k]=q}));
  [...m.values()].sort((a,b)=>tkey(a.t)-tkey(b.t)||a.s-b.s).forEach(r=>out.push(r))});return out}
const ptList=()=>[...PV].sort((x,y)=>sev(y)-sev(x));
const PT=window.PT_DATA;
const {COM,MUN,AQ,GEST,CONQ,ZV,MAS,MASP}=window.GEO;
const SRCN=['ACA · SDIM (xarxa des del 2007)','ACA · SDIM (xarxes anteriors al 2007)','ACA · dades obertes (nivell piezomètric)'];
const SG=['SDIM','SDIM','DO'], SGS=['SDIM','DO'], SRCS=['SDIM','SDIM <2007','Piezometria'];
const SGC={SDIM:'#0b6b8a',DO:'#7b5ea7'}, SGN={SDIM:'ACA · SDIM (analítiques)',DO:'ACA · dades obertes (piezometria)'};
const PARS={
  c:{nm:'Clorurs',f:'Cl⁻',u:'mg/l',br:[100,250],lim:250,d:0,lt:'250 mg/l, valor paramètric de l’aigua de consum (RD 3/2023)'},
  e:{nm:'Conductivitat',f:'CE',u:'µS/cm',br:[1000,2500],lim:2500,d:0,lt:'2.500 µS/cm a 20 ºC, valor paramètric de l’aigua de consum (RD 3/2023)'},
  o:{nm:'Sodi',f:'Na⁺',u:'mg/l',br:[100,200],lim:200,d:0,lt:'200 mg/l, valor paramètric de l’aigua de consum (RD 3/2023)'},
  s:{nm:'Sulfats',f:'SO₄²⁻',u:'mg/l',br:[150,250],lim:250,d:0,lt:'250 mg/l, valor paramètric de l’aigua de consum (RD 3/2023)'},
  n:{nm:'Nitrats',f:'NO₃⁻',u:'mg/l',br:[25,50],lim:50,d:1,lt:'50 mg/l, llindar de la Directiva de nitrats i de l’aigua de consum'},
  w:{nm:'Aigua de mar',f:'% mar',u:'%',br:[0.5,1.2],lim:1.2,d:2,calc:1,lt:'1,2 % d’aigua de mar ≈ 250 mg/l de clorurs (barreja conservativa)'},
  r:{nm:'Na/Cl',f:'Na/Cl',u:'',br:[0.86,1],lim:0.86,d:2,rev:1,calc:1,lt:'0,86, relació molar de l’aigua de mar. Per sota, bescanvi iònic típic d’una intrusió que avança',
     cn:['Més d’1','De 0,86 a 1','Menys de 0,86 (com l’aigua de mar o inferior)']},
  v:{nm:'Índex de Revelle',f:'Revelle',u:'',br:[1.3,6.6],lim:6.6,d:2,calc:1,lt:'Cl⁻/HCO₃⁻ en meq/l. 1,3 i 6,6 separen l’aigua no o poc afectada, moderadament afectada i fortament afectada per la salinització',
     cn:['No o poc afectada (< 1,3)','Moderadament afectada (1,3–6,6)','Fortament afectada (> 6,6)']},
  m:{nm:'Mg/Ca',f:'Mg/Ca',u:'',br:[1,2],lim:2,d:2,calc:1,lt:'Relació molar. Aigua dolça carbonatada habitualment < 1; aigua de mar ≈ 5,2'},
  x:{nm:'BEX',f:'BEX',u:'meq/l',br:[-0.5,0.5],lim:-0.5,d:2,rev:1,neg:1,calc:1,lt:'Índex de bescanvi de bases (Stuyfzand). Negatiu: l’aqüífer es salinitza; positiu: s’està dessalinitzant',
     cn:['Dolcificació (> 0,5)','Equilibri (−0,5 a 0,5)','Salinització (< −0,5)']},
  h:{nm:'Nivell piezomètric',f:'Nivell',u:'m s.n.m.',br:[0,5],lim:0,d:2,rev:1,neg:1,lt:'0 m: nivell del mar. Per sota, el gradient afavoreix l’entrada d’aigua de mar',
     cn:['Més de 5 m s.n.m.','Entre 0 i 5 m s.n.m.','Per sota del nivell del mar']}};
const PX={k:{nm:'Potassi',f:'K⁺',u:'mg/l',d:1},a:{nm:'Calci',f:'Ca²⁺',u:'mg/l',d:0},g:{nm:'Magnesi',f:'Mg²⁺',u:'mg/l',d:0},i:{nm:'Bicarbonats',f:'HCO₃⁻',u:'mg/l',d:0},
  b:{nm:'Bor',f:'B',u:'µg/l',d:0},t:{nm:'Estronci',f:'Sr',u:'µg/l',d:0},p:{nm:'pH',f:'pH',u:'',d:2},T:{nm:'Temperatura',f:'T',u:'ºC',d:1},z:{nm:'Error del balanç iònic',f:'Error bal.',u:'%',d:1}};
const PK=['c','e','o','s','n','w','r','v','m','x','h'], AK=[...PK.filter(k=>k!=='h'),'k','a','g','i','b','t','p','T','z','h'];
const PA=k=>PARS[k]||PX[k];
const CLC=['#2f9e5b','#f2b134','#d7301f','#a7b1b8'];
const PMN={last:'darrer valor',max:'valor més desfavorable',mean:'mitjana'};
const yr=t=>t>99999?Math.floor(t/1e4):t, tkey=t=>t>99999?t:t*1e4+701;
const dstr=t=>t>99999?String(t%100).padStart(2,'0')+'/'+String(Math.floor(t/100)%100).padStart(2,'0')+'/'+Math.floor(t/1e4):'any '+t;
const cen=(v,pp)=>v!=null&&v<0&&!(PA(pp)||{}).neg;
const val=(v,pp)=>cen(v,pp)?-v:v;
const fv=(v,d,pp)=>v==null?'—':cen(v,pp||'c')?'< '+nf(v,d):(v<0?'−':'')+nf(v,d);
const fq=(q,k)=>{const P=PA(k);return (q[3]===2?'> ':q[3]===3?'≈ ':'')+fv(q[1],P.d+(Math.abs(q[1])<10&&P.d<2?1:0),k)};
const un=pp=>PA(pp).u?' '+PA(pp).u:'';
const exc=(v,pp)=>{if(v==null||cen(v,pp))return false;const P=PARS[pp];return P.rev?v<P.lim:v>P.lim};
const cmpS=pp=>PARS[pp].rev?'<':'>';
const limTxt=pp=>cmpS(pp)+' '+(PARS[pp].lim<0?'−':'')+nf(PARS[pp].lim,2)+un(pp);
const clsName=(c,pp)=>{const P=PARS[pp];if(c===3)return 'Sense dades al període';if(P.cn)return P.cn[c];const b=P.br.map(v=>nf(v,2)),u=un(pp);
  const t=[(P.rev?'Més de '+b[1]:'Menys de '+b[0])+u,'De '+b[0]+' a '+b[1]+u,(P.rev?'Menys de '+b[0]:'Més de '+b[1])+u];return t[c]};
let Y0=2026,Y1=1900;
const ser=(p,pp)=>(p['s'+pp]||[]).filter(r=>state.src.has(SG[r[2]])&&yr(r[0])>=state.y0&&yr(r[0])<=state.y1);
function clsOf(v,pp){if(v==null)return 3;const P=PARS[pp];if(cen(v,pp))return P.rev?2:0;const b=P.br;
  return P.rev?(v<b[0]?2:v<=b[1]?1:0):(v<b[0]?0:v<=b[1]?1:2)}
function pStat(r,pp,mode){if(!r.length)return null;const P=PARS[pp];let v;
  if(mode==='last')v=r[r.length-1][1];
  else if(mode==='max'){const q=r.filter(x=>!cen(x[1],pp)).map(x=>x[1]);v=q.length?(P.rev?Math.min(...q):Math.max(...q)):r[r.length-1][1]}
  else v=r.reduce((s,x)=>s+(cen(x[1],pp)?-x[1]/2:x[1]),0)/r.length;
  return v}
const sev=p=>p.v==null?-1e12:(p.c===3?-1:p.c)*1e9+(PARS[state.pp].rev?-val(p.v,state.pp):val(p.v,state.pp));
let PV=[];
function pQ(){const q=state.q;PT.forEach(p=>p.qm=true);if(!q)return;
  const qk=PT.filter(p=>p.kn===q),qm=qk.length?qk:PT.filter(p=>p.mn===q),tx=qm.length?qm:PT.filter(p=>p.s.includes(q));
  if(tx.length){PT.forEach(p=>p.qm=false);tx.forEach(p=>p.qm=true);return}
  if(state.aqon){const qa=new Set(AQ.filter(match).map(a=>a.i));PT.forEach(p=>p.qm=qa.size>0&&p.aq.some(i=>qa.has(i)))}else PT.forEach(p=>p.qm=false)}
function pComp(){pQ();const pp=state.pp;PT.forEach(p=>{const r=ser(p,pp);p.nn=r.length;p.v=pStat(r,pp,state.pm);p.c=clsOf(p.v,pp);p.ex=r.some(x=>exc(x[1],pp));p.ya=r.length?yr(r[0][0]):null;p.yb=r.length?yr(r[r.length-1][0]):null;p.tl=r.length?r[r.length-1][0]:null})}
const pOk=(p,skip)=>p.qm!==false&&(state.gm==='all'||p.g===state.gm)&&(skip==='dc'||!state.pdc||(p.dc!=null&&p.dc<=state.pdc))&&(!state.pma||p.ma===state.pma)&&(!state.pmun||p.m===state.pmun)&&(!state.pcom||p.k===state.pcom)&&(skip==='ex'||!state.pex||p.ex);
const pVis=p=>pOk(p)&&state.pcl[p.c];
const pFxN=()=>(state.src.size<SGS.length?1:0)+(state.y0>Y0||state.y1<Y1?1:0)+(state.pex?1:0)+(state.pdc?1:0)+(state.pma?1:0)+(state.pmun?1:0)+(state.pcom?1:0)+(state.pm!=='last'?1:0);
const PATK=['c','e','o','s','n','w','r','v','h'];
const aqList=a=>PT.filter(p=>p.aq.includes(a.i)&&pVis(p)).sort((x,y)=>sev(y)-sev(x));
const TST={mean:'mitjana',median:'mediana',last:'darrer valor',max:'valor més desfavorable',p90:'percentil 90',pct:'% de punts que superen la referència'};
const TSTL={mean:'Mitjana de les mitjanes de cada punt',median:'Mediana de les medianes de cada punt',last:'Mitjana del darrer valor de cada punt',max:'Valor més desfavorable registrat a la zona',p90:'Percentil 90 de les mitjanes de cada punt',pct:'% de punts amb algun valor que supera la referència'};
const TUN={com:'Comarques',mun:'Municipis',aq:'Aqüífers (unitats ICGC)',mas:"Masses d'aigua subterrània",hex:'Hexàgons de 5 km',heat:'Mapa de calor'};
const TUN1={com:'comarca',mun:'municipi',aq:'aqüífer',mas:"massa d'aigua",hex:'hexàgon',heat:'comarca'};
const TUNP={com:'comarques',mun:'municipis',aq:'aqüífers',mas:"masses d'aigua",hex:'hexàgons',heat:'comarques'};
const trev=()=>TM.st!=='pct'&&!!PARS[TM.pp].rev,tpal=i=>TPAL[trev()?TPAL.length-1-i:i];
const tZ=()=>TM.Z[TM.un==='heat'?'com':TM.un];
const TBR={c:[50,100,250,500,1000,2500],e:[500,1000,2500,5000,10000,20000],o:[50,100,200,500,1000,2500],s:[50,100,250,500,1000,2000],n:[10,25,40,50,75,100],w:[.1,.5,1.2,3,10,25],r:[.5,.7,.86,1,1.5,2],v:[.5,1.3,2.8,6.6,15.5,50],m:[.5,1,2,3,4,5],x:[-5,-2,-.5,.5,2,5],h:[-10,-5,0,5,20,50],pct:[5,10,25,50,75,90]};
const TPAL=['#fff3c4','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026','#67000d'];
const tbr=()=>TM.st==='pct'?TBR.pct:TBR[TM.pp], tunit=()=>TM.st==='pct'?'%':(PARS[TM.pp].u||'—');
const tvv=v=>cen(v,TM.pp)?-v/2:v;
const tser=p=>(p['s'+TM.pp]||[]).filter(r=>TM.src.has(SG[r[2]])&&yr(r[0])>=TM.y0&&yr(r[0])<=TM.y1);
function tPointVal(r){const pp=TM.pp,R=PARS[pp].rev;switch(TM.st){
  case 'mean':case 'p90':return r.reduce((s,x)=>s+tvv(x[1]),0)/r.length;
  case 'median':return pctl(r.map(x=>tvv(x[1])),.5);
  case 'last':return tvv(r[r.length-1][1]);
  case 'max':{const q=r.map(x=>tvv(x[1]));return R?Math.min(...q):Math.max(...q)}
  case 'pct':return r.some(x=>exc(x[1],pp))?1:0}}
function tZoneVal(v){switch(TM.st){case 'mean':case 'last':return v.reduce((a,b)=>a+b,0)/v.length;case 'median':return pctl(v,.5);case 'max':return PARS[TM.pp].rev?Math.min(...v):Math.max(...v);case 'p90':return pctl(v,PARS[TM.pp].rev?.1:.9);case 'pct':return v.reduce((a,b)=>a+b,0)/v.length*100}}
function tZones(un){if(TM.Z[un])return TM.Z[un];let Z=[];
  if(un==='com')Z=COM.map(c=>({id:c.n,n:c.n,d:c.d,pts:PT.filter(p=>p.k===c.n)}));
  else if(un==='mun'){const by={};PT.forEach(p=>{const k=p.m+'|'+p.k;(by[k]=by[k]||[]).push(p)});Z=MUN.map(m=>({id:m.id,n:m.n,sub:m.k,d:m.d,pts:by[m.n+'|'+m.k]||[]}))}
  else if(un==='aq')Z=[...AQ].sort((a,b)=>b.a-a.a).map(a=>({id:a.id,n:a.n,sub:a.tp,d:tpath(a.c),pts:PT.filter(p=>p.aq.includes(a.i))}));
  else if(un==='mas'){const inP=(g,p)=>g.c.some(po=>inRing(p.lo,p.la,po[0])&&!po.slice(1).some(h=>inRing(p.lo,p.la,h)));
    Z=[...MAS].sort((a,b)=>b.a-a.a).map(m=>({id:m.id,n:m.n,sub:'nivell '+m.nv.toLowerCase(),d:tpath(m.c),pts:PT.filter(p=>inP(m,p))}))}
  else if(un==='hex'){const s=5000/MPU/Math.sqrt(3),by={};
    PT.forEach(p=>{const x=X(p.lo),y=Y(p.la),q=(Math.sqrt(3)/3*x-y/3)/s,r=(2/3*y)/s;let rx=Math.round(q),rz=Math.round(r),ry=Math.round(-q-r);const dx=Math.abs(rx-q),dz=Math.abs(rz-r),dy=Math.abs(ry+q+r);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dz>=dy)rz=-rx-ry;
      const k=rx+','+rz;(by[k]=by[k]||{q:rx,r:rz,pts:[]}).pts.push(p)});
    Z=Object.values(by).map(h=>{const cx=s*Math.sqrt(3)*(h.q+h.r/2),cy=s*1.5*h.r,d='M'+[0,1,2,3,4,5].map(i=>{const a=Math.PI/180*(60*i-30);return (cx+s*Math.cos(a)).toFixed(1)+' '+(cy+s*Math.sin(a)).toFixed(1)}).join('L')+'Z';
      const cnt={};h.pts.forEach(p=>{const k=p.m+' ('+p.k+')';cnt[k]=(cnt[k]||0)+1});const top=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
      return {id:'H'+h.q+'_'+h.r,n:'Hexàgon de '+top,d,pts:h.pts}})}
  Z.forEach((z,i)=>z.i=i);return TM.Z[un]=Z}
function tCompute(){PT.forEach(p=>{const r=tser(p);p.tn=r.length;p.tv=r.length?tPointVal(r):null});
  const un=TM.un==='heat'?'com':TM.un,Z=tZones(un);
  Z.forEach(z=>{const D=z.pts.filter(p=>p.tv!=null),v=D.map(p=>p.tv);z.np=D.length;z.na=D.reduce((s,p)=>s+p.tn,0);z.ok=D.length>=TM.min;z.val=z.ok?tZoneVal(v):null;
    const pv=D.map(p=>TM.st==='pct'?null:p.tv).filter(x=>x!=null);z.mn=pv.length?Math.min(...pv):null;z.mx=pv.length?Math.max(...pv):null});return Z}
function tAnnual(pts){const m=new Map();pts.forEach(p=>{const ym=new Map();tser(p).forEach(q=>{const y=yr(q[0]);const a=ym.get(y)||[0,0];a[0]+=tvv(q[1]);a[1]++;ym.set(y,a)});ym.forEach((a,y)=>{const b=m.get(y)||[0,0];b[0]+=a[0]/a[1];b[1]++;m.set(y,b)})});
  return [...m.entries()].sort((a,b)=>a[0]-b[0]).map(([y,[s,n]])=>[y,s/n,n])}
