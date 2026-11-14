// CONTROLADOR: render, accions de l'usuari i navegació entre pàgines.
let qT=null;
function qFit(){if(!state.q)return;const b=[1e9,1e9,-1e9,-1e9],ext=(x,y)=>{b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)};let n=0;
  if(state.pon)PV.forEach(p=>{ext(X(p.lo),Y(p.la));n++});
  if(state.aqon&&!n)AQ.filter(match).forEach(a=>{const c=bboxOf(a);ext(c[0],c[1]);ext(c[2],c[3]);n++});
  if(!n)return;const pad=6;b[0]-=pad;b[1]-=pad;b[2]+=pad;b[3]+=pad;const u=svgUnit(),vw=svg.clientWidth*u,vh=svg.clientHeight*u,k=Math.min(40,Math.min(vw/(b[2]-b[0]),vh/(b[3]-b[1]))*.85);
  state.k=k;state.tx=W/2-k*(b[0]+b[2])/2;state.ty=H/2-k*(b[1]+b[3])/2;apply()}
function render(){updCounts();pComp();if(state.psel!==null&&!pVis(PT[state.psel]))state.psel=null;if(state.sel!==null&&!match(AQ[state.sel])){state.sel=null;state.stack=null}PV=pDraw();pLeg();pFxCounts();
  const vis=AQ.filter(match);
  AQ.forEach(a=>{a.el.classList.toggle('off',!shown(a));a.el.classList.toggle('dim',shown(a)&&!match(a));a.el.classList.toggle('sel',a.i===state.sel)});
  const n=state.aqon?FX.reduce((s,[k])=>s+state.fx[k].size,0):0,n2=state.pon?pFxN():0;$('fxn').hidden=!(n+n2);$('fxn').textContent=n+n2;$('fxs1').textContent=n?'· '+n+(n===1?' filtre actiu':' filtres actius'):'';$('fxcount').textContent=[state.aqon?AQ.filter(shown).length+' unitats':'',state.pon?PV.length.toLocaleString('ca-ES')+' punts':''].filter(Boolean).join(' · ')||'—';
  $('scopeT').textContent=state.q?'Cerca «'+$('q').value.trim()+'»':state.gm==='all'?'Catalunya':'Àmbit '+state.gm;
  $('scopeN').textContent=[state.aqon?vis.length+(vis.length===1?' unitat':' unitats'):'',state.pon?PV.length.toLocaleString('ca-ES')+' punts':''].filter(Boolean).join(' · ');$('clear').hidden=!state.q;
  const b=$('body'),a=state.sel!==null?AQ[state.sel]:null,pS=state.psel!==null?PT[state.psel]:null;
  if(pS){b.innerHTML=pointHTML(pS);b.scrollTop=0;if($('pxls')){$('pxls').onclick=()=>doXls(pInfo(pS));$('ppdf').onclick=()=>doPdf(pInfo(pS))}$('back').onclick=()=>{state.psel=null;render()};$('zoomto').onclick=()=>flyPt(pS)}
  else if(a){b.innerHTML=fitxaHTML(a);b.scrollTop=0;if($('axls')){$('axls').onclick=()=>doXls(aqInfo(a));$('apdf').onclick=()=>doPdf(aqInfo(a))}$('back').onclick=()=>{state.sel=null;state.stack=null;render()};$('zoomto').onclick=()=>fitBox(bboxOf(a))}
  else{const st=b.scrollTop;b.innerHTML=dashHTML(vis);b.scrollTop=st;if($('dxls')){const qi=()=>Object.assign(info(),{pt:true,rows:ptList(),cols:EXP(),af:activeFilters(true),title:TITLE+' · Cerca «'+$('q').value.trim()+'» · Punts de control',src:srcTxt(),unit:' punts',file:'punts_cerca_'});$('dxls').onclick=()=>doXls(qi());$('dpdf').onclick=()=>doPdf(qi())}}
  document.querySelector('.app').classList.toggle('has-sel',!!(a||pS));
  if(!state.aqon&&state.pon)state.lm='pt';else if(!state.pon)state.lm='aq';const lpt=state.lm==='pt'&&state.pon;document.querySelectorAll('#lmseg button').forEach(x=>{x.setAttribute('aria-pressed',x.dataset.lm===state.lm);x.disabled=x.dataset.lm==='pt'?!state.pon:!state.aqon;x.hidden=x.dataset.lm==='aq'&&!state.aqon});
  $('lstbn').textContent=[state.aqon?vis.length+(vis.length===1?' unitat':' unitats'):'',state.pon?PV.length.toLocaleString('ca-ES')+' punts':''].filter(Boolean).join(' · ')||'Cap capa activa';$('lstn').textContent=lpt?PV.length.toLocaleString('ca-ES')+' punts':vis.length+(vis.length===1?' unitat':' unitats');
  $('xls').textContent=lpt?'Exporta a Excel (punts i tots els valors)':'Exporta a Excel';const af=activeFilters(lpt);$('fsum').textContent=af.length?af.join('  ·  '):'Sense filtres';$('fsum').title=af.join('\n');
  const L=[...vis].sort((x,y)=>x.n.localeCompare(y.n,'ca'));
  if(!document.querySelector('.app').classList.contains('ls'))$('lstb').innerHTML='';
  else if(lpt){const pp=state.pp,P=PARS[pp],Q=ptList();$('lstb').innerHTML=Q.length?`<table><thead><tr><th>Punt</th><th>Codi</th><th>Municipi</th><th>Comarca</th><th>Massa d'aigua</th><th class="num">Dist. costa (km)</th><th class="num">Valors</th><th>Període</th><th class="num">${P.f} ${PMN[state.pm]}${P.u?' ('+P.u+')':''}</th><th>Darrera data</th></tr></thead><tbody>`+Q.map(p=>`<tr data-pi="${p.i}"${p.i===state.psel?' class="sel"':''}><td><i class="pdot" style="background:${CLC[p.c]}"></i>${esc(p.n)}</td><td>${esc(p.ca||p.id)}</td><td>${esc(p.m||'')}</td><td>${esc(p.k||'')}</td><td>${esc(p.ma||'')}</td><td class="num">${p.dc!=null?nf(p.dc,1):''}</td><td class="num">${p.nn}</td><td>${p.nn?p.ya+'–'+p.yb:''}</td><td class="num">${fv(p.v,P.d,pp)}</td><td>${p.tl?dstr(p.tl):''}</td></tr>`).join('')+'</tbody></table>':'<div class="hint">Cap punt compleix aquests filtres.</div>'}
  else $('lstb').innerHTML=L.length?'<table><thead><tr><th>Unitat</th><th>Codi</th><th>Tipus</th><th>Posició</th><th>Comportament</th><th>Porositat</th><th>Gestió</th><th class="num">Àrea (km²)</th></tr></thead><tbody>'+L.map(a=>`<tr data-i="${a.i}"${a.i===state.sel?' class="sel"':''}><td><i class="sw" style="background:${colorOf(a)};margin-right:6px;vertical-align:-1px"></i>${esc(a.n)}</td><td>${esc(a.id)}</td><td>${esc(a.tp)}</td><td>${esc(a.ps)}</td><td>${esc(a.cp)}</td><td>${esc(a.po)}</td><td>${esc(a.g==='X'?'ACA i CHE':a.g)}</td><td class="num">${fmt(areaOf(a))}</td></tr>`).join('')+'</tbody></table>':'<div class="hint">Cap unitat compleix aquests filtres.</div>';
  apply()}
function togCl(k){state.pcl[k]=!state.pcl[k];if(state.psel!==null&&!pVis(PT[state.psel]))state.psel=null;render()}
function ppBtns(){$('psel').value=state.pp;$('psel').classList.toggle('dis',!state.pon)}
function setPP(pp,keep){state.pp=pp;if(!state.pon)togP(true);else{ppBtns();render()}}
function togP(v){state.pon=v;$('pfq').setAttribute('aria-pressed',v);ppBtns();if(!v)state.psel=null;render()}
function selPt(i,fly){state.psel=i;state.sel=null;state.stack=null;if(!state.pon)togP(true);else render();if(fly)flyPt(PT[i])}
function pFxCounts(){const pp=state.pp;$('pexl').textContent='Algun valor '+limTxt(pp);
  $('pexn').textContent=PT.filter(p=>pOk(p,'ex')&&p.ex).length;
  [0,1,3,5,10].forEach(v=>$('pdcn-'+v).textContent=PT.filter(p=>pOk(p,'dc')&&p.nn&&(!v||(p.dc!=null&&p.dc<=v))).length);
  SGS.forEach(g=>{$('srcn-'+g).textContent=PT.reduce((s,p)=>s+(p['s'+pp]||[]).filter(r=>SG[r[2]]===g).length,0).toLocaleString('ca-ES')});
  const n=pFxN();$('fxs2').textContent=n?'· '+n+(n===1?' filtre actiu':' filtres actius'):'';
  document.querySelectorAll('#dcq button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.dc===state.pdc))}
function tInit(){if(TM.init)return;TM.init=true;COM.forEach(c=>{el('path',{d:c.d,fill:'#e9edef',stroke:'none'},$('tland'));el('path',{d:c.d,fill:'none',stroke:'#7d8a93','stroke-width':'.7','vector-effect':'non-scaling-stroke'},$('tcb'))});
  AQ.filter(a=>a.tp==='Aqüífer'||a.tp==='Sistema aqüífer').forEach(a=>el('path',{d:tpath(a.c),'clip-rule':'evenodd'},$('tclip')));
  $('tsrc').innerHTML=SGS.map(g=>`<label><input type="checkbox" data-tsrc="${g}" checked> ${SGN[g]}</label>`).join('');
  const busy=f=>{$('tbusy').hidden=false;setTimeout(()=>{f();$('tbusy').hidden=true},20)};
  $('tpp').innerHTML=$('psel').innerHTML;$('tpp').value=TM.pp;$('tpp').onchange=e=>{TM.pp=e.target.value;busy(tDraw)};$('ty0').min=$('ty1').min=$('ty0').value=Y0;$('ty0').max=$('ty1').max=$('ty1').value=Y1;
  $('tst').onchange=e=>{TM.st=e.target.value;busy(tDraw)};
  $('tun').onchange=e=>{TM.un=e.target.value;TM.sel=null;TM.min=(TM.un==='hex'||TM.un==='heat')?1:3;$('tmin').value=TM.min;$('theatopt').hidden=TM.un!=='heat';busy(tDraw)};
  const yrs=()=>{let a=+$('ty0').value||Y0,b=+$('ty1').value||Y1;a=Math.min(Y1,Math.max(Y0,a));b=Math.min(Y1,Math.max(Y0,b));if(a>b)[a,b]=[b,a];$('ty0').value=TM.y0=a;$('ty1').value=TM.y1=b;busy(tDraw)};$('ty0').onchange=yrs;$('ty1').onchange=yrs;
  $('tsrc').onchange=e=>{const g=e.target.dataset.tsrc;if(!g)return;TM.src[e.target.checked?'add':'delete'](g);busy(tDraw)};
  $('tmin').onchange=e=>{TM.min=Math.min(20,Math.max(1,+e.target.value||1));e.target.value=TM.min;tDraw()};
  $('tclipc').onchange=e=>{TM.clip=e.target.checked;$('theat').setAttribute('clip-path',TM.clip?'url(#tclip)':'');tLeg()};
  $('tshowp').onchange=e=>{TM.showp=e.target.checked;$('tpts').style.display=TM.showp?'':'none';if(TM.showp)tPts()};
  $('tbody').addEventListener('click',e=>{const z=e.target.closest('[data-tz]');if(z){const zz=tZ()[+z.dataset.tz];TM.sel=TM.sel===zz?null:zz;tHL();tPanel(tZ());if(!TM.sel)return;$('tbody').scrollTop=0;tFit(zz);return}
    const p=e.target.closest('[data-tpi]');if(p){go('visor');selPt(+p.dataset.tpi,true)}});
  tDraw()}
function go(p){if(p==='tem')setTimeout(()=>{tInit()},30);['fonts','meto','tem'].forEach(k=>$('pg-'+k).hidden=k!==p);document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.go===p));if(p!=='visor')$('pg-'+p).scrollTop=0;else apply()}

// ---------- inicialització (ordre d'execució original) ----------
svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
MUN.forEach(m=>{m.d=m.c.map(po=>po.map(ring2d).join('')).join('');el('path',{d:m.d,class:'munb'},$('gmb'));
  const t=el('text',{x:X(m.lp[0]),y:Y(m.lp[1]),class:'mlbl'},$('gml'));t.textContent=m.n;mlbls.push(t)});
COM.forEach(c=>{let best=null;c.d=polys(c).map(po=>po.map((r,i)=>{if(i===0&&(!best||r.length>best.length))best=r;return ring2d(r)}).join('')).join('');
  el('path',{d:c.d,class:'com'},$('gc'));el('path',{d:c.d,class:'comb'},$('gcb'));
  const xs=best.map(p=>X(p[0])),ys=best.map(p=>Y(p[1]));
  const t=el('text',{x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2,class:'lbl'},$('gl'));t.textContent=c.n;lbls.push(t)});
AQ.forEach((a,i)=>{a.i=i;a.s=norm(a.n+' '+a.id)});
[...AQ].sort((a,b)=>(PORD[a.ps]-PORD[b.ps])||(b.a-a.a)).forEach(a=>{
  a.el=el('path',{d:a.c.map(po=>po.map(ring2d).join('')).join(''),class:'aq','fill-rule':'evenodd'},$('ga'));
  a.el.addEventListener('pointermove',e=>tip(e,a.n+' · '+a.tp));a.el.addEventListener('pointerleave',()=>$('tip').hidden=true)});
$('colby').onchange=e=>{state.colby=e.target.value;paint()};
POS.forEach(p=>state.pos[p]=true);
$('colby').disabled=true;
$('colby').closest('.colsel').classList.add('dis');
$('aqb').onclick=()=>{const on=$('aqb').getAttribute('aria-pressed')!=='true';state.aqon=on;$('fxd1').hidden=!on;$('q').placeholder=on?'Cerca un aqüífer o un punt (nom, codi, municipi)':'Cerca un punt (nom, codi, municipi)';$('aqb').setAttribute('aria-pressed',on);$('map').classList.toggle('hide-aq',!on);$('colby').disabled=!on;$('colby').closest('.colsel').classList.toggle('dis',!on);
  if(!on){state.sel=null;state.stack=null}render()};
document.querySelectorAll('#legend button[data-l]').forEach(b=>b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);$('map').classList.toggle('hide-'+b.dataset.l,!on)});
FX.forEach(([k])=>state.fx[k]=new Set);
state.tp={};
TPS.forEach(v=>state.tp[v]=(v==='Aqüífer'||v==='Sistema aqüífer'));
state.gm='all';
state.aqon=false;
document.querySelectorAll('#legend button[data-tp]').forEach(b=>{b.querySelector('.tpn').textContent=AQ.filter(a=>a.tp===b.dataset.tp).length;b.onclick=()=>{const v=b.dataset.tp;state.tp[v]=!state.tp[v];b.setAttribute('aria-pressed',state.tp[v]);state.sel=null;state.stack=null;render()}});
{let h='';FX.forEach(([k,lab])=>{const c={};AQ.forEach(a=>c[a[k]]=(c[a[k]]||0)+1);
  h+='<h4>'+lab+'</h4>'+Object.keys(c).sort((x,y)=>c[y]-c[x]).map(v=>`<label><input type="checkbox" data-k="${k}" data-v="${esc(v)}"><span>${esc(v)}</span><em>${c[v]}</em></label>`).join('')});
 $('fx1').innerHTML=h;
 $('fx1').addEventListener('change',e=>{const i=e.target;if(!i.dataset.k)return;state.fx[i.dataset.k][i.checked?'add':'delete'](i.dataset.v);state.sel=null;state.stack=null;render()});
 const tog=v=>{$('fxcol').hidden=!v;document.querySelector('.app').classList.toggle('fx',v);$('fxbtn').setAttribute('aria-pressed',v);apply()};
 $('fxbtn').onclick=()=>tog($('fxcol').hidden);$('fxclose').onclick=()=>tog(false);
 $('fxclear').onclick=()=>{FX.forEach(([k])=>state.fx[k].clear());if(window.pFxReset)pFxReset();document.querySelectorAll('.fxb input').forEach(i=>i.checked=false);render()};}
$('q').oninput=e=>{state.q=norm(e.target.value.trim());state.sel=null;state.stack=null;render();clearTimeout(qT);qT=setTimeout(qFit,700)};
$('clear').onclick=()=>{state.q='';$('q').value='';render()};
svg.addEventListener('click',e=>{if(moved)return;const p=pt(e),vx=(p.x-state.tx)/state.k,vy=(p.y-state.ty)/state.k,lo=LO(vx),la=LA(vy);
  if(document.querySelector('.map').classList.contains('hide-aq'))return;
  const gs=GEST.find(g=>g.c.some(po=>inRing(lo,la,po[0])&&!po.slice(1).some(h=>inRing(lo,la,h))));state.gest=gs?gs.g:null;
  const hit=arr=>arr.find(g=>g.c.some(po=>inRing(lo,la,po[0])&&!po.slice(1).some(h=>inRing(lo,la,h))));const cq=hit(CONQ),zv=hit(ZV);state.conca=cq?cq.n:null;state.zvat=zv?zv.n:null;
  const inP=g=>g.c.some(po=>inRing(lo,la,po[0])&&!po.slice(1).some(h=>inRing(lo,la,h)));state.mas=MAS.filter(inP).sort((x,y)=>x.nv<y.nv?1:-1).map(m=>({m,p:MASP.some(p=>p.id===m.id&&inP(p))}));
  const mu=MUN.find(m=>m.c.some(po=>inRing(lo,la,po[0])&&!po.slice(1).some(h=>inRing(lo,la,h))));state.mun=mu?mu.n+' ('+mu.k+')':null;
  state.psel=null;const hits=AQ.filter(a=>match(a)&&inAq(lo,la,a)).sort((x,y)=>PORD[y.ps]-PORD[x.ps]);
  if(!hits.length){state.sel=null;state.stack=null}else{state.stack=hits.map(a=>a.i);state.sel=hits[0].i}render()});
const mini=$('mini');
let mb;
{const b=[1e9,1e9,-1e9,-1e9];COM.forEach(c=>polys(c).forEach(po=>po[0].forEach(q=>{const x=X(q[0]),y=Y(q[1]);b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)})));mb=[b[0]-15,b[1]-15,b[2]+15,b[3]+15]}
mini.setAttribute('viewBox',`${mb[0]} ${mb[1]} ${mb[2]-mb[0]} ${mb[3]-mb[1]}`);
COM.forEach(c=>el('path',{d:c.d,style:'fill:#cdd8df'},$('mg')));
mini.addEventListener('click',e=>{const m=mini.getScreenCTM().inverse(),wx=e.clientX*m.a+m.e,wy=e.clientY*m.d+m.f;state.tx=W/2-state.k*wx;state.ty=H/2-state.k*wy;apply()});
svg.addEventListener('wheel',e=>{e.preventDefault();const p=pt(e);zoomAt(p.x,p.y,e.deltaY<0?1.25:.8)},{passive:false});
const ptrs=new Map();
svg.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,pt(e));moved=false;last=pt(e);if(ptrs.size===2){const a=[...ptrs.values()];pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}});
svg.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=pt(e);ptrs.set(e.pointerId,p);
  if(ptrs.size===1){const dx=p.x-last.x,dy=p.y-last.y;if(Math.abs(dx)+Math.abs(dy)>3*svgUnit()||moved){moved=true;svg.classList.add('drag');state.tx+=dx;state.ty+=dy;last=p;apply()}}
  else if(ptrs.size===2){moved=true;const a=[...ptrs.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pd>0)zoomAt((a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2,d/pd);pd=d}});
svg.addEventListener('pointerup',up);
svg.addEventListener('pointercancel',up);
svg.addEventListener('pointerleave',up);
$('zin').onclick=()=>zoomAt(W/2,H/2,1.5);
$('zout').onclick=()=>zoomAt(W/2,H/2,1/1.5);
$('zre').onclick=()=>{state.k=1;state.tx=state.ty=0;apply()};
addEventListener('resize',apply);
$('body').addEventListener('click',e=>{const s=e.target.closest('[data-si]');if(s){state.psel=null;state.sel=+s.dataset.si;render();return}
  const ai=e.target.closest('[data-ai]');if(ai){const i=+ai.dataset.ai;state.psel=null;state.stack=null;state.mun=null;state.sel=i;render();fitBox(bboxOf(AQ[i]));return}
  const px=e.target.closest('[data-px]');if(px){pxTog(px);return}
  const pa=e.target.closest('[data-pxall]');if(pa){const op=pa.dataset.pxall==='0';pa.closest('div').parentElement.querySelectorAll('[data-px]').forEach(x=>pxTog(x,op));pa.dataset.pxall=op?'1':'0';pa.textContent=op?'Plega les analítiques':'Desplega les analítiques';return}
  const pi=e.target.closest('[data-pi]');if(pi){selPt(+pi.dataset.pi,true);return}
  const pp=e.target.closest('[data-pp]');if(pp){setPP(pp.dataset.pp,true);return}
  const pc=e.target.closest('[data-pc]');if(pc){togCl(+pc.dataset.pc);return}
  const b=e.target.closest('[data-dk]');if(!b)return;const k=b.dataset.dk,v=b.dataset.dv,set=state.fx[k];set.has(v)?set.delete(v):set.add(v);
  const i=[...document.querySelectorAll('.fxb input')].find(i=>i.dataset.k===k&&i.dataset.v===v);if(i)i.checked=set.has(v);render()});
$('lstb').addEventListener('click',e=>{const rp=e.target.closest('tr[data-pi]');if(rp){const st=$('lstb').scrollTop,i=+rp.dataset.pi;if(state.psel===i){state.psel=null;render()}else selPt(i,true);$('lstb').scrollTop=st;return}
  const r=e.target.closest('tr[data-i]');if(!r)return;const i=+r.dataset.i;state.stack=null;state.mun=null;state.psel=null;state.sel=state.sel===i?null:i;const st=$('lstb').scrollTop;render();$('lstb').scrollTop=st;if(state.sel!==null)fitBox(bboxOf(AQ[i]))});
{const tl=v=>{document.querySelector('.app').classList.toggle('ls',v);render()};$('lstbtn').onclick=()=>tl(true);$('lstclose').onclick=()=>tl(false);
 $('lmseg').onclick=e=>{const b=e.target.closest('[data-lm]');if(!b||b.disabled)return;state.lm=b.dataset.lm;$('lstb').scrollTop=0;render()}}
{const msg=m=>{if(!document.querySelector('.app').classList.contains('ls'))return alert(m);$('expmsg').textContent=m;setTimeout(()=>$('expmsg').textContent='',5000)};
 let framed=false;try{framed=window.self!==window.top}catch(e){framed=true}if(framed)$('exp').hidden=true;window.EXPOK=!framed;window.expMsg=msg;
 window.doXls=I=>{if(typeof XLSX==='undefined')return msg('Cal connexió a internet per exportar.');
   const aoa=[[I.title],['Data: '+I.date+'   ·   '+I.rows.length+I.unit+'   ·   '+I.src],['Filtres aplicats:'],...(I.af.length?I.af:['Cap filtre']).map(f=>['   '+f]),[],I.cols.map(c=>c[0]),...I.rows.map(a=>I.cols.map(c=>c[1](a)??''))];
   const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=I.cols.map(c=>({wch:Math.max(12,c[0].length+4)}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,I.pt?'Punts':'Aqüífers');if(I.pt)XLSX.utils.book_append_sheet(wb,valSheet(I.rows,I.title,I.date,I.af),'Analítiques');XLSX.writeFile(wb,I.file+I.stamp+'.xlsx')};
 $('xls').onclick=()=>doXls(info());
 window.doPdf=I=>{if(typeof jspdf==='undefined'||!jspdf.jsPDF.API.autoTable)return msg('Cal connexió a internet per exportar.');const doc=new jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
   const ps=s=>typeof s==='string'?s.replace(/₃/g,'3').replace(/₂/g,'2').replace(/₄/g,'4').replace(/[⁻−]/g,'-').replace(/⁺/g,'+').replace(/²/g,'2').replace(/µ/g,'u').replace(/≈/g,'~').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/≥/g,'>=').replace(/≤/g,'<='):s,_tx=doc.text.bind(doc),_at=doc.autoTable.bind(doc);
   doc.text=(s,...r)=>_tx(Array.isArray(s)?s.map(ps):ps(s),...r);doc.autoTable=o=>{['head','body'].forEach(k=>{if(o[k])o[k]=o[k].map(row=>row.map(ps))});return _at(o)};
   const C=I.pt?I.cols.filter((c,i)=>[0,1,2,3,5,6,11,12,13,14,15,16].includes(i)):I.cols.slice(0,10);
   doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text(I.title,14,15);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('Data: '+I.date+'   ·   '+I.rows.length+I.unit+'   ·   '+I.src,14,21);
   let y=28;(I.af.length?I.af:['Cap filtre']).forEach(f=>{doc.text('• '+f,14,y);y+=4.3});
   doc.autoTable({startY:y+2,head:[C.map(c=>c[0])],body:I.rows.map(a=>C.map(c=>String(c[1](a)??'—'))),styles:{fontSize:7,cellPadding:1.2},headStyles:{fillColor:[48,49,48]},margin:{left:14,right:14}});
   if(I.pt){const A=anaRows(I.rows);if(A.length>8000&&!confirm('El PDF tindrà '+A.length.toLocaleString('ca-ES')+' analítiques i pot trigar una estona a generar-se. Vols continuar?'))return;
    doc.addPage();doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Tots els valors ('+A.length.toLocaleString('ca-ES')+'), ordenats per punt i data',14,15);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('«<x»: inferior al límit analític; «>x»: superior al límit del mètode. En vermell, valors que superen la referència de cada paràmetre.',14,20);
    const K=['c','e','o','s','n','w','r','v','m','x','h'];
    doc.autoTable({startY:24,head:[['Punt','Codi','Data',...K.map(k=>PARS[k].f+(PARS[k].u?' ('+PARS[k].u+')':'')),'Font']],
     body:A.map(r=>[r.p.n,r.p.ca||r.p.id,dstr(r.t),...K.map(k=>vtp(r.v[k],k)),SRCS[r.s]]),
     styles:{fontSize:6.3,cellPadding:.9},headStyles:{fillColor:[48,49,48]},margin:{left:10,right:10},
     didParseCell:d=>{if(d.section!=='body'||d.column.index<3||d.column.index>2+K.length)return;const k=K[d.column.index-3],q=A[d.row.index].v[k];if(q&&exc(q[1],k)){d.cell.styles.textColor=[192,57,43];d.cell.styles.fontStyle='bold'}}})}
   doc.save(I.file+I.stamp+'.pdf')};
 $('pdf').onclick=()=>doPdf(info());}
state.bm='';
$('bmseg').onclick=e=>{const b=e.target.closest('[data-bm]');if(b)setBm(b.dataset.bm)};
$('bmo').oninput=e=>{$('gb').style.opacity=e.target.value/100;$('bmov').textContent=e.target.value+'%'};
$('aqt').oninput=e=>{$('ga').style.setProperty('--aqop',(1-e.target.value/100).toFixed(2));$('aqtv').textContent=e.target.value+'%'};
$('bmbtn').onclick=()=>{const o=$('bmp').hidden;$('bmp').hidden=!o;$('bmbtn').setAttribute('aria-expanded',o)};
document.addEventListener('pointerdown',e=>{if(!$('bmp').hidden&&!e.target.closest('#bmp,#bmbtn')){$('bmp').hidden=true;$('bmbtn').setAttribute('aria-expanded',false)}});
GEST.forEach(g=>{g.el=el('path',{d:g.c.map(po=>po.map(ring2d).join('')).join(''),class:'gest g-'+g.g},$('gg'))});
GEST.forEach(g=>el('path',{d:g.el.getAttribute('d'),class:'gmask g-'+g.g,'fill-rule':'evenodd'},$('gmk')));
document.querySelectorAll('#legend button[data-gest]').forEach(b=>b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);$('map').classList.toggle('hide-'+b.dataset.gest,!on);
  const a=document.querySelector('#legend [data-gest=ACA]').getAttribute('aria-pressed')==='true',c=document.querySelector('#legend [data-gest=CHE]').getAttribute('aria-pressed')==='true';
  state.gm=a&&!c?'ACA':c&&!a?'CHE':'all';$('map').classList.toggle('gm-ACA',state.gm==='ACA');$('map').classList.toggle('gm-CHE',state.gm==='CHE');
  AQ.filter(x=>x.g==='X').forEach(x=>{const g=geomOf(x)||x.c;x.el.setAttribute('d',g.map(po=>po.map(ring2d).join('')).join(''))});
  if(state.sel!==null&&!inGm(AQ[state.sel])){state.sel=null;state.stack=null}paint();render()});
CONQ.forEach(c=>{c.el=el('path',{d:c.c.map(po=>po.map(ring2d).join('')).join(''),class:'cq'},$('gcq'));c.lb=el('text',{x:X(c.lp[0]),y:Y(c.lp[1]),class:'cql'},$('gcql'));c.lb.textContent=c.n;cqlbls.push(c.lb)});
ZV.forEach(z=>el('path',{d:z.c.map(po=>po.map(ring2d).join('')).join(''),class:'zv','fill-rule':'evenodd'},$('gzv')));
$('lycq').onchange=e=>$('map').classList.toggle('on-cq',e.target.checked);
$('lyzv').onchange=e=>$('map').classList.toggle('on-zv',e.target.checked);
$('lyms').onchange=e=>$('map').classList.toggle('on-ms',e.target.checked);
$('lymp').onchange=e=>$('map').classList.toggle('on-mp',e.target.checked);
MASP.forEach(m=>el('path',{d:m.c.map(po=>po.map(ring2d).join('')).join(''),class:'mp','fill-rule':'evenodd'},$('gmp')));
MAS.forEach(m=>{el('path',{d:m.c.map(po=>po.map(ring2d).join('')).join(''),class:'ms'+(m.nv==='INFERIOR'?' inf':'')},$('gms'));if(m.nv!=='INFERIOR'){const t=el('text',{x:X(m.lp[0]),y:Y(m.lp[1]),class:'msl'},$('gmsl'));t.textContent=m.n;t._a=m.a;mslbls.push(t)}});
document.querySelectorAll('#legend button[data-gest]').forEach(b=>b.addEventListener('click',updLayers));
updLayers();
PT.forEach(p=>AK.forEach(k=>(p['s'+k]||[]).forEach(q=>{const y=yr(q[0]);if(y<Y0)Y0=y;if(y>Y1)Y1=y})));
Object.assign(state,{pon:true,pp:'c',pm:'last',psel:null,src:new Set(SGS),y0:Y0,y1:Y1,pex:false,pdc:0,pma:'',pmun:'',pcom:'',pcl:[true,true,true,false],lm:'aq'});
PT.forEach((p,i)=>{p.i=i;p.aq=p.aq||[];p.s=norm([p.n,p.id,p.ca,p.m,p.k,p.ma].filter(Boolean).join(' '));p.kn=norm(p.k);p.mn=norm(p.m);AK.forEach(k=>{const s=p['s'+k];if(s)s.sort((a,b)=>tkey(a[0])-tkey(b[0]))})});
const gp=$('gp');
PT.forEach(p=>{p.el=el('circle',{cx:X(p.lo).toFixed(2),cy:Y(p.la).toFixed(2),r:1,class:'pt'},gp);p.el._i=p.i});
gp.addEventListener('pointermove',e=>{const c=e.target.closest('circle');if(!c)return;const p=PT[c._i],P=PARS[state.pp];tip(e,p.n+' · '+P.f+': '+(p.v==null?'sense dades':fv(p.v,P.d,state.pp)+un(state.pp))+(p.tl&&state.pm==='last'?' ('+dstr(p.tl)+')':''))});
gp.addEventListener('pointerleave',()=>$('tip').hidden=true);
gp.addEventListener('click',e=>{const c=e.target.closest('circle');if(!c)return;e.stopPropagation();if(moved)return;selPt(c._i,false)});
window.ptRad=()=>{const u=svgUnit(),key=state.k+'_'+u;if(key===ptRk)return;ptRk=key;const r=((state.k<1.5?2.7:state.k<4?3.4:state.k<10?4.4:5.6)*u/state.k).toFixed(4);PT.forEach(p=>p.el.setAttribute('r',r))};
$('legp').addEventListener('click',e=>{const b=e.target.closest('[data-pc]');if(b)togCl(+b.dataset.pc)});
$('pfq').onclick=()=>togP(!state.pon);
$('psel').onchange=e=>setPP(e.target.value,true);
{const coms=[...new Set(PT.map(p=>p.k).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ca')),muns=[...new Set(PT.map(p=>p.m).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ca')),mas=[...new Set(PT.map(p=>p.ma).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ca'));
 $('fx2').innerHTML=`<h4>Font de la dada</h4>`+SGS.map(g=>`<label><input type="checkbox" data-src="${g}" checked><span>${SGN[g]}</span><em id="srcn-${g}"></em></label>`).join('')+
  `<h4>Període</h4><div class="yrs"><input type="number" id="py0" min="${Y0}" max="${Y1}" value="${Y0}" aria-label="Any inicial"><span>a</span><input type="number" id="py1" min="${Y0}" max="${Y1}" value="${Y1}" aria-label="Any final"></div>
  <h4>Valor representat al mapa</h4><div class="seg" id="pmseg"><button data-pm="last" aria-pressed="true">Darrer</button><button data-pm="max" aria-pressed="false">Més desfavorable</button><button data-pm="mean" aria-pressed="false">Mitjana</button></div>
  <h4>Valors de referència</h4><label><input type="checkbox" id="pex"><span id="pexl"></span><em id="pexn"></em></label>
  <h4>Distància a la costa</h4>`+[[0,'Tots els punts'],[1,'Fins a 1 km'],[3,'Fins a 3 km'],[5,'Fins a 5 km'],[10,'Fins a 10 km']].map(([v,t])=>`<label><input type="radio" name="pdc" value="${v}"${v?'':' checked'}><span>${t}</span><em id="pdcn-${v}"></em></label>`).join('')+
  `<h4>Massa d'aigua (SDIM)</h4><select id="pma"><option value="">Totes les masses</option>${mas.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
  <h4>Comarca</h4><select id="pcom"><option value="">Totes les comarques</option>${coms.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
  <h4>Municipi</h4><input id="pmun" list="pmunl" placeholder="Tots els municipis" autocomplete="off"><datalist id="pmunl">${muns.map(m=>`<option value="${esc(m)}">`).join('')}</datalist>`;
 const re=()=>{if(state.psel!==null&&!pVis(PT[state.psel]))state.psel=null;render()};
 $('fx2').addEventListener('change',e=>{const t=e.target;
  if(t.dataset.src){state.src[t.checked?'add':'delete'](t.dataset.src)}
  else if(t.id==='py0'||t.id==='py1'){let a=+$('py0').value||Y0,b=+$('py1').value||Y1;a=Math.min(Y1,Math.max(Y0,a));b=Math.min(Y1,Math.max(Y0,b));if(a>b)[a,b]=[b,a];$('py0').value=state.y0=a;$('py1').value=state.y1=b}
  else if(t.id==='pex')state.pex=t.checked;else if(t.name==='pdc')state.pdc=+t.value;else if(t.id==='pma')state.pma=t.value;else if(t.id==='pcom'){state.pcom=t.value;munDL();if(state.pmun&&!munsOk().includes(state.pmun)){state.pmun='';$('pmun').value=''}}
  else if(t.id==='pmun'){state.pmun=munsOk().includes(t.value)?t.value:'';if(!state.pmun)t.value=''}else return;re()});
 const munsOk=()=>state.pcom?[...new Set(PT.filter(p=>p.k===state.pcom).map(p=>p.m).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ca')):muns;
 window.munDL=()=>{$('pmunl').innerHTML=munsOk().map(m=>`<option value="${esc(m)}">`).join('');$('pmun').placeholder=state.pcom?'Tots els municipis · '+state.pcom:'Tots els municipis'};
 $('pmun').addEventListener('input',e=>{if(munsOk().includes(e.target.value)){state.pmun=e.target.value;re()}else if(!e.target.value&&state.pmun){state.pmun='';re()}});
 $('pmseg').onclick=e=>{const b=e.target.closest('[data-pm]');if(!b)return;state.pm=b.dataset.pm;document.querySelectorAll('#pmseg button').forEach(x=>x.setAttribute('aria-pressed',x===b));re()};
 window.pFxReset=()=>{state.src=new Set(SGS);state.y0=Y0;state.y1=Y1;state.pex=false;state.pdc=0;state.pma='';state.pmun='';state.pcom='';state.pm='last';
  document.querySelectorAll('#fx2 [data-src]').forEach(i=>i.checked=true);$('py0').value=Y0;$('py1').value=Y1;$('pex').checked=false;document.querySelector('#fx2 [name=pdc][value="0"]').checked=true;$('pma').value='';$('pcom').value='';$('pmun').value='';munDL();
  document.querySelectorAll('#pmseg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.pm==='last'))};
 window.setDc=v=>{state.pdc=v;const i=document.querySelector(`#fx2 [name=pdc][value="${v}"]`);if(i)i.checked=true;re()};}
$('dcq').onclick=e=>{const b=e.target.closest('[data-dc]');if(b)setDc(+b.dataset.dc)};
const TM={pp:'c',st:'mean',un:'com',y0:Y0,y1:Y1,src:new Set(SGS),min:3,clip:true,showp:false,sel:null,k:1,tx:0,ty:0,init:false,Z:{},grid:null};
tsvg.setAttribute('viewBox',`0 0 ${W} ${H}`);
{let drag=null,mv=false;tsvg.addEventListener('wheel',e=>{e.preventDefault();const p=tpt(e);tZoom(p.x,p.y,e.deltaY<0?1.25:.8)},{passive:false});
 tsvg.addEventListener('pointerdown',e=>{drag=tpt(e);mv=false});
 tsvg.addEventListener('pointermove',e=>{if(drag){const p=tpt(e),dx=p.x-drag.x,dy=p.y-drag.y;if(mv||Math.abs(dx)+Math.abs(dy)>4){mv=true;TM.tx+=dx;TM.ty+=dy;drag=p;tApply();return}}tHover(e)});
 const up=()=>{drag=null;setTimeout(()=>mv=false,0)};tsvg.addEventListener('pointerup',up);tsvg.addEventListener('pointerleave',()=>{up();$('ttip').hidden=true});
 tsvg.addEventListener('click',e=>{if(mv)return;const z=e.target._z;if(z){TM.sel=TM.sel===z?null:z;tHL();tPanel(tZ());$('tbody').scrollTop=0}});
 $('tzin').onclick=()=>tZoom(W/2,H/2,1.5);$('tzout').onclick=()=>tZoom(W/2,H/2,1/1.5);$('tzre').onclick=()=>{TM.k=1;TM.tx=TM.ty=0;tApply()}}
document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(a){e.preventDefault();go(a.dataset.go)}});
paint();
render();
// dades de l'actualització (window.META, generat per 03_eines/actualitza.py)
document.querySelectorAll('[data-m]').forEach(e=>{const v=(window.META||{})[e.dataset.m];e.textContent=v==null?'—':typeof v==='number'&&!/^any_/.test(e.dataset.m)?v.toLocaleString('ca-ES'):v});
window.go=go;document.body.classList.add('ready');
