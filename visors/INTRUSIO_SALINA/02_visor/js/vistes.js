// VISTES: generació de l'HTML i dels SVG (resum, fitxes, gràfics, llegendes, plànols temàtics).
function hbars(k,title,top){const c=tally(k,k),vs=Object.keys(c).sort((x,y)=>c[y]-c[x]).slice(0,top),mx=Math.max(1,...vs.map(v=>c[v]));
  return `<div class="dch${state.fx[k].size?' has-on':''}"><h3>${title}</h3>`+vs.map(v=>`<button class="hb${state.fx[k].has(v)?' on2':''}" data-dk="${k}" data-dv="${esc(v)}" title="${esc(v)}: ${c[v]} unitats"><span>${esc(v)}</span><span class="tr"><i style="width:${c[v]/mx*100}%"></i></span><em>${c[v]}</em></button>`).join('')+'</div>'}
function dashHTML(vis){const area=vis.reduce((s,a)=>s+(areaOf(a)||0),0),aqf=vis.filter(a=>a.tp==='Aqüífer'||a.tp==='Sistema aqüífer').length,ll=vis.filter(a=>/lliure/i.test(a.cp)).length;
  if(!state.aqon)return `<div class="dash">${state.pon?pDashHTML(PV)+'<div class="dnote">Clica un punt per veure\'n la sèrie temporal i la font de cada valor.</div>':'<div class="hint" style="padding:0">Activa els <b>Punts de control</b> (i tria un paràmetre) o la capa d\'<b>Aqüífers</b> per veure informació.</div>'}</div>`;
  return `<div class="dash">${pDashHTML(PV)}<h3 class="h3b">Unitats hidrogeològiques</h3><div class="kpis">
   <div class="kpi"><b>${vis.length}</b><span>unitats hidrogeològiques</span></div>
   <div class="kpi"><b>${fmt(area)}</b><span>km² (superposats inclosos)</span></div>
   <div class="kpi"><b>${aqf}</b><span>aqüífers i sistemes aqüífers</span></div>
   <div class="kpi"><b>${vis.length?Math.round(ll/vis.length*100):0}%</b><span>de comportament lliure</span></div>
</div>
   ${hbars('tp','Tipus d’unitat',6)}${hbars('cp','Comportament hidràulic',6)}${hbars('po','Porositat',6)}${hbars('na','Naturalesa',6)}
   <div class="dnote">Clica un punt per veure'n la sèrie temporal i la font de cada valor. Clica un aqüífer per veure'n la fitxa i el resum dels punts que hi ha a dins; si hi ha unitats superposades (quaternari sobre basament) les veuràs totes. Clica una barra per filtrar.</div></div>`}
function fitxaHTML(a){const row=(t,v)=>v?`<dt>${t}</dt><dd>${esc(v)}</dd>`:'';
  const st=state.stack&&state.stack.length>1?`<div><h3>Unitats en aquest punt (${state.stack.length})</h3><div class="stack">`+state.stack.map(i=>{const b=AQ[i];return `<button data-si="${i}" class="${i===a.i?'cur':''}"><i class="sw" style="background:${colorOf(b)}"></i><span>${esc(b.n)}</span><em>${esc(b.ps)}</em></button>`}).join('')+'</div></div>':'';
  return `<div class="fitxa"><button class="link" id="back" style="align-self:flex-start">× Tanca la fitxa</button>
   <div><span class="tag"><i class="sw" style="background:${colorOf(a)}"></i>${esc(a.tp)} · ${esc(a.ps)}</span><h2>${esc(a.n)}</h2><div class="where">Codi ICGC ${esc(a.id)} · ${fmt(areaOf(a))} km²${state.gm!=='all'&&a.g==='X'?' (part '+state.gm+' de '+fmt(a.a)+' km²)':''}</div></div>
   ${st}
   ${state.mun&&state.stack?`<div class="where" style="margin-top:-6px">Punt clicat a <b>${esc(state.mun)}</b>${state.gest?' · gestió <b>'+state.gest+'</b>':''}${state.conca?' · conca <b>'+esc(state.conca)+'</b>':''}</div>`:''}
   ${state.stack&&state.mas&&state.mas.length?`<div><h3>Massa d'aigua subterrània en aquest punt (PdG 2022-2027)</h3>`+state.mas.map(({m,p})=>`<div class="mbox"><div><b>${esc(m.n)}</b> · ${esc(m.id)} · nivell ${esc(m.nv.toLowerCase())}</div><div>Estat químic 2021 <span class="est ${m.qui}">${esc(m.qui)}</span> · quantitatiu <span class="est ${m.qua}">${esc(m.qua)}</span> · global <span class="est ${m.fin}">${esc(m.fin)}</span></div><div>${p?'<b>Amb mesures específiques de protecció</b>':'Sense mesures específiques de protecció'}${m.zv==='Sí'?' · zona protegida per ZV':''}</div></div>`).join('')+'</div>':''}
   <div><h3>Característiques hidrogeològiques</h3><dl>${row('Gestió',gestTxt(a))}${row('Naturalesa',a.na)}${row('Comportament',a.cp)}${row('Porositat',a.po)}${row('Posició',a.ps)}${row('Formació',a.tf)}${row('Subtipus',a.st)}</dl></div>
   <div><h3>${PARS[state.pp].nm} en aquesta unitat (${PARS[state.pp].f})</h3>${aqPtsHTML(a)}</div>
   ${a.fx?`<a href="${esc(a.fx)}" target="_blank" rel="noopener">Obre la fitxa de la unitat a l'ICGC (PDF)</a>`:''}
   <button class="link" id="zoomto" style="align-self:flex-start">Apropa el mapa a la unitat</button></div>`}
function updCounts(){document.querySelectorAll('#legend button[data-tp]').forEach(b=>b.querySelector('.tpn').textContent=AQ.filter(a=>a.tp===b.dataset.tp&&inGm(a)).length);}
function pDraw(){gp.style.display=state.pon?'':'none';const vis=[];
  PT.forEach(p=>{const v=pVis(p);p.el.style.display=v?'':'none';if(v){p.el.setAttribute('fill',CLC[p.c]);vis.push(p)}p.el.classList.toggle('sel',p.i===state.psel)});
  [...vis].sort((a,b)=>sev(a)-sev(b)).forEach(p=>gp.appendChild(p.el));
  if(state.psel!==null)gp.appendChild(PT[state.psel].el);return vis}
function pLeg(){const L=$('legp');L.hidden=!state.pon;if(!state.pon)return;const pp=state.pp,P=PARS[pp],c=[0,0,0,0];PT.filter(p=>pOk(p)).forEach(p=>c[p.c]++);
  L.innerHTML=`<h4>${P.nm}${P.f!==P.nm?' ('+P.f+')':''} · ${PMN[state.pm]}</h4>`+[2,1,0,3].map(k=>`<button data-pc="${k}" aria-pressed="${state.pcl[k]}" title="Mostra o amaga aquests punts"><i style="background:${CLC[k]}"></i><span>${clsName(k,pp)}</span><b>${c[k].toLocaleString('ca-ES')}</b></button>`).join('')+
  `<div class="lgn">${P.calc?'Indicador calculat amb les analítiques de l’SDIM. ':''}Referència: ${esc(P.lt)}</div>`}
function chartSVG(r,pp){const P=PARS[pp];if(!r.length)return '<div class="hint" style="padding:4px 0">Cap valor amb els filtres actuals.</div>';
  const Wc=330,Hc=180,L=42,R=10,T=10,B=22;let x0=Math.floor(Math.min(...r.map(q=>xdec(q[0])))),x1=Math.ceil(Math.max(...r.map(q=>xdec(q[0])))+.01);if(x1-x0<3){x0--;x1++}
  const vs=r.map(q=>val(q[1],pp)),ys=yScale(vs,P.lim,P.neg);
  const sx=v=>L+(v-x0)/(x1-x0)*(Wc-L-R),sy=v=>T+(1-(v-ys.lo)/(ys.hi-ys.lo))*(Hc-T-B);let s=`<svg class="ch" viewBox="0 0 ${Wc} ${Hc}" role="img" aria-label="Sèrie temporal de ${esc(P.nm.toLowerCase())}">`;
  for(let v=ys.lo;v<=ys.hi+1e-9;v+=ys.st)s+=`<line x1="${L}" x2="${Wc-R}" y1="${sy(v)}" y2="${sy(v)}" class="gl"/><text x="${L-4}" y="${sy(v)+3.5}" class="ty">${(v<-1e-9?'−':'')+nf(v,2)}</text>`;
  const sp=x1-x0,xs=sp<=6?1:sp<=12?2:sp<=25?5:10;for(let v=Math.ceil(x0/xs)*xs;v<=x1;v+=xs)s+=`<line x1="${sx(v)}" x2="${sx(v)}" y1="${Hc-B}" y2="${Hc-B+3}" class="ax"/><text x="${sx(v)}" y="${Hc-6}" class="tx">${v}</text>`;
  s+=`<line x1="${L}" x2="${Wc-R}" y1="${sy(Math.max(ys.lo,0))}" y2="${sy(Math.max(ys.lo,0))}" class="ax"/>`;
  s+=`<line x1="${L}" x2="${Wc-R}" y1="${sy(P.lim)}" y2="${sy(P.lim)}" class="lim"/><text x="${L+4}" y="${sy(P.lim)-4}" class="liml">${(P.lim<0?'−':'')+nf(P.lim,2)+un(pp)}</text>`;
  if(r.length>1)s+=`<path d="M${r.map(q=>sx(xdec(q[0])).toFixed(1)+' '+sy(val(q[1],pp)).toFixed(1)).join('L')}" class="sl"/>`;
  if(r.length<400)r.forEach(q=>{const c=SGC[SG[q[2]]],tt=`<title>${dstr(q[0])} · ${fq(q,pp)}${un(pp)} · ${SRCN[q[2]]}</title>`,y=sy(val(q[1],pp));
    s+=`<circle cx="${sx(xdec(q[0])).toFixed(1)}" cy="${y.toFixed(1)}" r="${r.length>150?1.6:2.6}" fill="${cen(q[1],pp)?'#fff':c}" stroke="${q[3]===2?'#000':c}" stroke-width="1.2">${tt}</circle>`});
  return s+'</svg>'}
function annualSVG(V){const pp=state.pp,m=new Map();
  V.forEach(p=>{const ym=new Map();ser(p,pp).forEach(q=>{const y=yr(q[0]);ym.set(y,(ym.get(y)||false)||exc(q[1],pp))});ym.forEach((v,y)=>{const a=m.get(y)||[0,0];a[0]++;if(v)a[1]++;m.set(y,a)})});
  if(!m.size)return '';const ys=[...m.keys()],a0=Math.min(...ys),a1=Math.max(...ys),mx=Math.max(...[...m.values()].map(a=>a[0])),Wc=330,Hc=130,L=34,R=6,T=8,B=20,bw=(Wc-L-R)/(a1-a0+1);
  const st=niceStep(mx/3),top=Math.ceil(mx/st)*st,sy=v=>T+(1-v/top)*(Hc-T-B);let s=`<svg class="ch" viewBox="0 0 ${Wc} ${Hc}" role="img" aria-label="Punts mostrejats cada any">`;
  for(let v=0;v<=top+1e-9;v+=st)s+=`<line x1="${L}" x2="${Wc-R}" y1="${sy(v)}" y2="${sy(v)}" class="gl"/><text x="${L-4}" y="${sy(v)+3.5}" class="ty">${v.toLocaleString('ca-ES')}</text>`;
  for(let y=a0;y<=a1;y++){const a=m.get(y)||[0,0],x=L+(y-a0)*bw;
    s+=`<g><title>${y}: ${a[0]} punts mesurats, ${a[1]} amb algun valor ${esc(limTxt(pp))} (${a[0]?Math.round(a[1]/a[0]*100):0}%)</title><rect x="${(x+bw*.1).toFixed(1)}" y="${sy(a[0]).toFixed(1)}" width="${(bw*.8).toFixed(1)}" height="${(sy(0)-sy(a[0])).toFixed(1)}" fill="#c9d3da"/><rect x="${(x+bw*.1).toFixed(1)}" y="${sy(a[1]).toFixed(1)}" width="${(bw*.8).toFixed(1)}" height="${(sy(0)-sy(a[1])).toFixed(1)}" fill="${CLC[2]}"/></g>`;
    if((y-a0)%((a1-a0)>30?10:(a1-a0)>12?5:2)===0)s+=`<text x="${(x+bw/2).toFixed(1)}" y="${Hc-6}" class="tx">${y}</text>`}
  return s+'</svg>'}
function pDashHTML(V){if(!state.pon)return '';const pp=state.pp,P=PARS[pp],D=V.filter(p=>p.nn),na=D.reduce((s,p)=>s+p.nn,0),ov=D.filter(p=>exc(p.v,pp)).length,ex=D.filter(p=>p.ex).length,c=[0,0,0,0],sc={};
  PT.filter(p=>pOk(p)).forEach(p=>c[p.c]++);D.forEach(p=>ser(p,pp).forEach(q=>{const g=SG[q[2]];sc[g]=(sc[g]||0)+1}));const cm=Math.max(1,...c),sm=Math.max(1,...Object.values(sc));
  let qh='';if(state.q&&V.length)qh=`<div>${ptListHTML(ptList(),'d')}</div>`;
  return `${qh}<div class="psec"><h3 class="h3b">Punts de control · ${P.nm}${P.f!==P.nm?' ('+P.f+')':''}</h3><div class="kpis">
   <div class="kpi"><b>${D.length.toLocaleString('ca-ES')}</b><span>punts amb dades (${state.y0}–${state.y1})</span></div>
   <div class="kpi"><b>${na.toLocaleString('ca-ES')}</b><span>${pp==='h'?'mesures de nivell':P.calc?'valors calculats':'analítiques de '+P.f}</span></div>
   <div class="kpi"><b>${D.length?Math.round(ov/D.length*100):0}%</b><span>punts amb ${PMN[state.pm]} ${esc(limTxt(pp))}</span></div>
   <div class="kpi"><b>${ex.toLocaleString('ca-ES')}</b><span>punts amb algun valor ${esc(limTxt(pp))}</span></div></div></div>
   <div class="dch${state.pcl.some(x=>!x)?' has-on':''}"><h3>Punts segons el ${PMN[state.pm]}</h3>`+[2,1,0,3].map(k=>`<button class="hb${state.pcl[k]?' on2':''}" data-pc="${k}" title="Mostra o amaga aquests punts"><span><i class="pdot" style="background:${CLC[k]}"></i>${clsName(k,pp)}</span><span class="tr"><i style="width:${c[k]/cm*100}%;background:${CLC[k]}"></i></span><em>${c[k]}</em></button>`).join('')+`</div>
   <div><h3>Punts mesurats cada any</h3>${annualSVG(V.filter(p=>p.nn))}<div class="dnote"><i class="pdot" style="background:#c9d3da"></i> punts amb dades l'any · <i class="pdot" style="background:${CLC[2]}"></i> amb algun valor ${esc(limTxt(pp))}</div></div>
   <div class="dch"><h3>Valors per font</h3>`+SGS.filter(g=>sc[g]).map(g=>`<div class="hb" style="cursor:default"><span>${SGN[g]}</span><span class="tr"><i style="width:${sc[g]/sm*100}%"></i></span><em>${sc[g].toLocaleString('ca-ES')}</em></div>`).join('')+`</div>
   ${P.calc?`<div class="dnote"><b>${esc(P.nm)}</b>: indicador calculat per a cada mostra a partir dels ions analitzats (vegeu Metodologia). ${esc(P.lt)}.</div>`:''}`}
function lastAnaHTML(p){const A=anaRows([p]).filter(r=>r.s!==2&&r.v.c!=null);if(!A.length)return '';const r=A[A.length-1],K=['c','o','k','a','g','i','s','n','e','p','w','r','v','m','x'];
  return `<div><h3>Darrera analítica amb clorurs · ${dstr(r.t)}</h3><div class="vtab"><table><tbody>`+K.filter(k=>r.v[k]).map(k=>`<tr${PARS[k]&&exc(r.v[k][1],k)?' class="ov"':''}><td>${esc(PA(k).nm)}${PA(k).f!==PA(k).nm?' ('+PA(k).f+')':''}</td><td class="num">${fq(r.v[k],k)}${un(k)}</td></tr>`).join('')+'</tbody></table></div></div>'}
function pointHTML(p){const pp=state.pp,P=PARS[pp],r=ser(p,pp),row=(t,v)=>v!=null&&v!==''?`<dt>${t}</dt><dd>${esc(v)}</dd>`:'';
  const ok=r.filter(x=>!cen(x[1],pp)),wq=ok.length?ok.reduce((a,b)=>(P.rev?b[1]<a[1]:b[1]>a[1])?b:a):null,last=r.length?r[r.length-1]:null,ne=r.filter(x=>exc(x[1],pp)).length,mean=pStat(r,pp,'mean');
  const tabs='<div class="ptabs">'+PK.map(k=>{const q=ser(p,k),l=q.length?q[q.length-1]:null;return `<button data-pp="${k}" aria-pressed="${k===pp}"><b>${PARS[k].nm}</b><span>${q.length?q.length+' valors · darrer '+fq(l,k)+un(k):'sense dades'}</span></button>`}).join('')+'</div>';
  const sc={};r.forEach(q=>sc[q[2]]=(sc[q[2]]||0)+1);
  const tbl=r.length?`<div class="vtab"><table><thead><tr><th>Data</th><th class="num">${P.f}${P.u?' ('+P.u+')':''}</th><th>Font</th></tr></thead><tbody>`+[...r].reverse().map(q=>`<tr${exc(q[1],pp)?' class="ov"':''}><td>${dstr(q[0])}</td><td class="num">${fq(q,pp)}</td><td>${SRCS[q[2]]}</td></tr>`).join('')+'</tbody></table></div>':'';
  const aqs=state.aqon?p.aq.filter(i=>inGm(AQ[i])):[];
  return `<div class="fitxa"><button class="link" id="back" style="align-self:flex-start">× Tanca la fitxa</button>
   <div><span class="tag"><i class="pdot" style="background:${CLC[p.c]}"></i>Punt de control · gestió ${esc(p.g)}${p.dc!=null?' · '+nf(p.dc,1)+' km de la costa':''}</span><h2>${esc(p.n)}</h2><div class="where">${esc(p.m||'')}${p.k?' ('+esc(p.k)+')':''} · ${esc(p.id)}</div></div>
   ${tabs}
   <div class="kpis">
    <div class="kpi"><b>${last?fq(last,pp):'—'}</b><span>darrer valor${last?' · '+dstr(last[0]):''}</span></div>
    <div class="kpi"><b>${wq?fq(wq,pp):'—'}</b><span>${P.rev?'mínim':'màxim'}${wq?' · '+dstr(wq[0]):''}</span></div>
    <div class="kpi"><b>${r.length}</b><span>valors${r.length?' · '+yr(r[0][0])+'–'+yr(last[0]):''}</span></div>
    <div class="kpi"><b>${r.length?Math.round(ne/r.length*100)+'%':'—'}</b><span>valors ${esc(limTxt(pp))}${r.length?' ('+ne+')':''}</span></div></div>
   <div><h3>Sèrie temporal: ${esc(P.nm.toLowerCase())}${P.u?' ('+P.u+')':''}</h3>${chartSVG(r,pp)}
    <div class="srcl">${Object.keys(sc).map(k=>`<span><i class="pdot" style="background:${SGC[SG[k]]}"></i>${SRCN[k]} <b>${sc[k]}</b></span>`).join('')}${r.some(q=>cen(q[1],pp))?'<span><i class="pdot" style="background:#fff;border:1.2px solid #555"></i>inferior al límit analític</span>':''}${r.some(q=>q[3]===2)?'<span><i class="pdot" style="background:#0b6b8a;border:1.2px solid #000"></i>superior al límit del mètode («&gt; x»)</span>':''}</div>
    ${mean!=null?`<div class="dnote">Mitjana del període: ${fv(mean,P.d,pp)}${un(pp)}${P.neg?'':' (els valors «&lt; x» compten com x/2)'}. Línia vermella: ${esc(P.lt)}.${r.some(q=>q[3]===3)?' «≈»: sodi estimat pel balanç de cations perquè l’analítica el dona com a «&gt; x».':''}</div>`:''}</div>
   ${lastAnaHTML(p)}
   ${tbl?`<div><h3>Valors registrats (${r.length})</h3>${tbl}</div>`:''}
   <div><h3>Dades del punt</h3><dl>${row('Codi ACA',p.ca)}${row('Municipi',p.m)}${row('Comarca',p.k)}${row('Gestió',p.g)}${row('Massa d’aigua',p.ma?(p.mc?p.mc+' · ':'')+p.ma:'')}${row('Distància a la costa (km)',p.dc!=null?nf(p.dc,1):'')}${row('Cota (m)',p.z!=null?nf(p.z,1):'')}${row('Fondària del pou (m)',p.f!=null?nf(p.f,1):'')}${row('UTM 31N ETRS89',p.x+' / '+p.y)}</dl></div>
   ${aqs.length?`<div><h3>Unitats hidrogeològiques on és el punt</h3><div class="stack">`+aqs.map(i=>{const b=AQ[i];return `<button data-ai="${i}"><i class="sw" style="background:${colorOf(b)}"></i><span>${esc(b.n)}</span><em>${esc(b.ps)}</em></button>`}).join('')+'</div></div>':''}
   ${window.EXPOK?'<button class="pxls" id="pxls">Analítiques del punt · Excel</button><button class="pxls" id="ppdf">PDF</button>':''}<button class="link" id="zoomto" style="align-self:flex-start">Apropa el mapa al punt</button></div>`}
function ptListHTML(L,ids){const pp=state.pp,P=PARS[pp];
  return `<div class="aqlh"><b>Punts de control (${L.length})</b><span><button class="xb" data-pxall="0">Desplega les analítiques</button>${window.EXPOK?`<button class="xb" id="${ids}xls">Excel</button><button class="xb" id="${ids}pdf">PDF</button>`:''}</span></div><div class="aql">`+
   L.map(p=>`<div class="pli"><div class="plh"><button class="plb" data-pi="${p.i}" title="Obre la fitxa del punt"><i class="pdot" style="background:${CLC[p.c]}"></i><span>${esc(p.n)}<small>${esc([p.ca||p.id,p.m].filter(Boolean).join(' · '))}</small></span><em>${fv(p.v,P.d,pp)}${un(pp)}</em></button><button class="pxp" data-px="${p.i}" aria-expanded="false" title="Mostra o amaga les analítiques del punt">${anaRows([p]).length} reg. <b>▾</b></button></div><div class="pat" hidden></div></div>`).join('')+'</div>'}
function patHTML(p){const A=anaRows([p]);
  if(!A.length)return '<div class="dnote" style="padding:6px 8px">Cap valor amb els filtres de font i període.</div>';
  const c=(r,k)=>{const q=r.v[k];return q?`<td class="num${PARS[k]&&exc(q[1],k)?' ov':''}">${fq(q,k).replace('<','&lt;').replace('>','&gt;')}</td>`:'<td class="num">–</td>'};
  return `<table><thead><tr><th>Data</th>${PATK.map(k=>`<th class="num">${PARS[k].f}</th>`).join('')}<th>Font</th></tr></thead><tbody>`+A.map(r=>`<tr><td>${dstr(r.t)}</td>${PATK.map(k=>c(r,k)).join('')}<td class="src">${SRCS[r.s]}</td></tr>`).join('')+'</tbody></table>'}
function pxTog(btn,open){const box=btn.closest('.pli').querySelector('.pat');if(open==null)open=box.hidden;if(open&&!box.innerHTML)box.innerHTML=patHTML(PT[+btn.dataset.px]);box.hidden=!open;btn.setAttribute('aria-expanded',open)}
function aqPtsHTML(a){const pp=state.pp,P=PARS[pp];if(!state.pon)return '<div class="dnote">Activa «Punts de control» per veure els punts d’aquesta unitat.</div>';
  const A=aqList(a),D=A.filter(p=>p.nn),na=D.reduce((s,p)=>s+p.nn,0),vs=D.map(p=>val(p.v,pp)),c=[0,0,0,0];A.forEach(p=>c[p.c]++);
  if(!A.length)return '<div class="dnote">Cap punt de control dins aquesta unitat amb els filtres actuals.</div>';
  return `<div class="kpis">
    <div class="kpi"><b>${D.length}</b><span>punts amb dades (de ${A.length})</span></div>
    <div class="kpi"><b>${na.toLocaleString('ca-ES')}</b><span>valors de ${esc(P.f)}</span></div>
    <div class="kpi"><b>${D.length?fv(median(vs),P.d,pp):'—'}</b><span>mediana del ${PMN[state.pm]}${P.u?' ('+P.u+')':''}</span></div>
    <div class="kpi"><b>${D.length?Math.round(D.filter(p=>exc(p.v,pp)).length/D.length*100)+'%':'—'}</b><span>punts amb ${PMN[state.pm]} ${esc(limTxt(pp))}</span></div></div>
   <div class="cbar">${[2,1,0,3].filter(k=>c[k]).map(k=>`<i style="flex:${c[k]};background:${CLC[k]}" title="${esc(clsName(k,pp))}: ${c[k]} punts"></i>`).join('')}</div>
   ${ptListHTML(A,'a')}
   <div class="dnote">Ordenats del més al menys desfavorable. L'Excel inclou el resum dels punts i tots els seus valors. Valor de cada punt: ${PMN[state.pm]} del període ${state.y0}–${state.y1}. Punts situats dins el polígon de la unitat.</div>`}
const tcolP=v=>{const b=TBR[TM.pp];let i=b.findIndex(x=>v<x);if(i<0)i=b.length;return tpal(i)};
const tcol=v=>{const b=tbr();let i=b.findIndex(x=>v<x);if(i<0)i=b.length;return tpal(i)};
const tfv=v=>v==null?'—':TM.st==='pct'?Math.round(v)+'%':(v<0?'−':'')+nf(v,Math.max(PARS[TM.pp].d,Math.abs(v)<10?2:0));
function thc(v){const b=tbr(),st=[Math.min(0,b[0]-(b[1]-b[0])),...b];if(v>=st[st.length-1])return hex2rgb(tpal(TPAL.length-1));let i=st.findIndex(x=>v<x);if(i<=0)return hex2rgb(tpal(0));const f=(v-st[i-1])/(st[i]-st[i-1]),a=hex2rgb(tpal(i-1)),c=hex2rgb(tpal(i));return a.map((x,j)=>Math.round(x+(c[j]-x)*f))}
function tDraw(){const Z=tCompute(),heat=TM.un==='heat';
  if($('tz').dataset.un!==TM.un){$('tz').innerHTML='';$('tz').dataset.un=TM.un;
    if(!heat)Z.forEach(z=>{z.el=el('path',{d:z.d,'fill-rule':'evenodd',class:'tzp',stroke:'#ffffff','stroke-width':TM.un==='hex'?'.6':'.8'},$('tz'));z.el._z=z})}
  if(!heat)Z.forEach(z=>{z.el.setAttribute('fill',z.val!=null?tcol(z.val):z.np?'url(#thatch)':(TM.un==='hex'?'none':'#e9edef'));z.el.style.display=(TM.un==='hex'&&!z.np)?'none':''});
  $('theat').style.display=heat?'':'none';if(heat)tHeat();
  $('tcb').style.display=TM.un==='mun'||TM.un==='com'?'none':'';
  $('tpts').style.display=TM.showp?'':'none';if(TM.showp)tPts();
  tHL();tLeg();tPanel(Z);
  $('ttitle').innerHTML=`<b>${PARS[TM.pp].nm}${PARS[TM.pp].f!==PARS[TM.pp].nm?' ('+PARS[TM.pp].f+')':''} · ${TST[TM.st]}</b><span>${TUN[TM.un]} · ${TM.y0}–${TM.y1}</span>`}
function tPts(){const g=$('tpts');if(!g.childElementCount)PT.forEach(p=>{p.tel=el('circle',{cx:X(p.lo).toFixed(2),cy:Y(p.la).toFixed(2),r:1.2,fill:'#1d2a33','fill-opacity':'.75',stroke:'#fff','stroke-width':'.3'},g)});
  PT.forEach(p=>p.tel.style.display=p.tv!=null?'':'none')}
function tHL(){const g=$('thl');g.innerHTML='';const z=TM.sel;if(!z)return;el('path',{d:z.d,'fill-rule':'evenodd',fill:'none',stroke:'#000','stroke-width':'2.6','vector-effect':'non-scaling-stroke'},g)}
function tHeat(){const pts=PT.filter(p=>p.tv!=null).map(p=>({x:X(p.lo),y:Y(p.la),v:TM.st==='pct'?p.tv*100:p.tv}));
  const R=15000/MPU,R2=R*R,cs=2.2,x0=mb[0],y0=mb[1],nx=Math.ceil((mb[2]-mb[0])/cs),ny=Math.ceil((mb[3]-mb[1])/cs),B={};
  pts.forEach(p=>{const k=Math.floor(p.x/R)+','+Math.floor(p.y/R);(B[k]=B[k]||[]).push(p)});
  const cv=document.createElement('canvas');cv.width=nx;cv.height=ny;const cx=cv.getContext('2d'),im=cx.createImageData(nx,ny),G=new Float32Array(nx*ny).fill(NaN);
  for(let j=0;j<ny;j++){const y=y0+(j+.5)*cs,by=Math.floor(y/R);for(let i=0;i<nx;i++){const x=x0+(i+.5)*cs,bx=Math.floor(x/R);let sw=0,sv=0,ex=null;
    for(let a=-1;a<=1&&ex==null;a++)for(let b=-1;b<=1;b++){const L=B[(bx+a)+','+(by+b)];if(!L)continue;for(const p of L){const d2=(p.x-x)**2+(p.y-y)**2;if(d2>R2)continue;if(d2<1e-6){ex=p.v;break}const w=1/d2;sw+=w;sv+=w*p.v}if(ex!=null)break}
    const v=ex!=null?ex:sw?sv/sw:NaN;if(v!==v)continue;G[j*nx+i]=v;const c=thc(v),o=(j*nx+i)*4;im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=225}}
  cx.putImageData(im,0,0);const img=$('thimg');img.setAttribute('x',x0);img.setAttribute('y',y0);img.setAttribute('width',nx*cs);img.setAttribute('height',ny*cs);img.setAttribute('preserveAspectRatio','none');img.setAttribute('href',cv.toDataURL());
  TM.grid={G,nx,ny,x0,y0,cs};$('theat').setAttribute('clip-path',TM.clip?'url(#tclip)':'')}
function tLeg(){const b=tbr(),u=tunit(),f=v=>TM.st==='pct'?v:(v<0?'−':'')+nf(v,2),L=[];
  for(let i=b.length;i>=0;i--)L.push([tpal(i),i===b.length?'> '+f(b[i-1]):i===0?'< '+f(b[0]):f(b[i-1])+' – '+f(b[i])]);
  $('tleg').innerHTML=`<h4>${TM.st==='pct'?'% de punts amb algun valor '+limTxt(TM.pp):PARS[TM.pp].f+' · '+TST[TM.st]+(PARS[TM.pp].u?' ('+u+')':'')}</h4>`+L.map(([c,t])=>`<div><i style="background:${c}"></i>${t}${TM.st==='pct'?' %':''}</div>`).join('')+
   (TM.un!=='heat'?(TM.min>1?`<div><i style="background:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%225%22 height=%225%22><rect width=%225%22 height=%225%22 fill=%22%23eef1f3%22/><path d=%22M0 5L5 0%22 stroke=%22%23a9b4bb%22 stroke-width=%221.4%22/></svg>')"></i>Menys de ${TM.min} punts</div>`:'')+(TM.un!=='hex'?'<div><i style="background:#e9edef"></i>Sense punts</div>':''):'<div class="lgn">Interpolació (IDW) amb radi de 15 km'+(TM.clip?', només dins dels aqüífers':'')+'. Orientatiu.</div>')}
function tPanel(Z){const P=PARS[TM.pp],heat=TM.un==='heat',ok=Z.filter(z=>z.ok),used=new Set(),u=tunit();Z.forEach(z=>z.pts.forEach(p=>{if(p.tv!=null)used.add(p)}));
  const na=[...used].reduce((s,p)=>s+p.tn,0),over=ok.filter(z=>TM.st==='pct'?z.val>=50:exc(z.val,TM.pp)).length,rk=z=>z.val==null?-1e12:(trev()?-z.val:z.val),R=[...Z].filter(z=>z.np).sort((a,b)=>rk(b)-rk(a)||b.np-a.np),vmn=Math.min(0,...ok.map(z=>z.val)),mx=Math.max(...ok.map(z=>z.val),1e-9),bw=v=>trev()?(mx-v)/Math.max(1e-9,mx-vmn)*100:(v-vmn)/Math.max(1e-9,mx-vmn)*100;
  const zl=TUNP[TM.un];
  let h='';
  if(TM.sel)h+=tDetail(TM.sel);
  h+=`<div class="tsum"><div class="kpis">
   <div class="kpi"><b>${ok.length}</b><span>${zl} amb dades suficients (de ${Z.filter(z=>z.np).length} amb punts)</span></div>
   <div class="kpi"><b>${used.size.toLocaleString('ca-ES')}</b><span>punts amb dades al període</span></div>
   <div class="kpi"><b>${na.toLocaleString('ca-ES')}</b><span>valors de ${esc(P.f)} utilitzats</span></div>
   <div class="kpi"><b>${over}</b><span>${zl} ${TM.st==='pct'?'amb ≥ 50% de punts que superen la referència':'amb valor '+esc(limTxt(TM.pp))}</span></div></div>
   ${window.EXPOK?'<div class="texp"><button class="xb" id="txls">Excel</button><button class="xb" id="tpdf">PDF</button><button class="xb" id="tpng">Imatge PNG</button></div>':''}
   <h3>Rànquing ${heat?'per comarques':''} · ${TSTL[TM.st].toLowerCase()}</h3><div class="trk">`+
   R.map((z,i)=>`<button data-tz="${z.i}" title="${esc(z.n)}${z.sub?' · '+esc(z.sub):''}" class="${z===TM.sel?'cur':''}${z.ok?'':' ins'}"><em>${z.ok?i+1:''}</em><span>${esc(z.n)}${z.sub&&TM.un==='mun'?'<small>'+esc(z.sub)+'</small>':''}</span><i class="tbar"><i style="width:${z.ok?Math.max(2,bw(z.val)):0}%;background:${z.ok?tcol(z.val):'transparent'}"></i></i><b>${z.ok?tfv(z.val):'—'}</b><small>${z.np} p.</small></button>`).join('')+`</div>
   <div class="dnote">${esc(TSTL[TM.st])} (${u}), calculat en dos passos: primer un sol valor per punt amb les analítiques del període i després el valor de la zona. Les zones amb menys de ${TM.min} punts surten ratllades. La xarxa té més punts allà on hi ha problemes coneguts (deltes i aqüífers costaners sobreexplotats): els valors agregats poden ser més desfavorables que la realitat de tot el territori.</div></div>`;
  $('tbody').innerHTML=h;
  if($('txls')){$('txls').onclick=()=>tXls(Z);$('tpdf').onclick=()=>tPdf(Z);$('tpng').onclick=()=>tImg().then(u=>{const a=document.createElement('a');a.href=u;a.download=tFile()+'.png';a.click()})}
  if($('tdclose'))$('tdclose').onclick=()=>{TM.sel=null;tHL();tPanel(tZ())}}
function tDetail(z){const P=PARS[TM.pp],A=tAnnual(z.pts.filter(p=>p.tv!=null));let ch='';
  if(A.length>1){const Wc=330,Hc=150,L=36,R=8,T=10,B=20,x0=A[0][0],x1=A[A.length-1][0],ysc=yScale(A.map(a=>a[1]),P.lim,P.neg),st=ysc.st,sx=v=>L+(v-x0)/Math.max(1,x1-x0)*(Wc-L-R),sy=v=>T+(1-(v-ysc.lo)/(ysc.hi-ysc.lo))*(Hc-T-B);
    ch=`<svg class="ch" viewBox="0 0 ${Wc} ${Hc}">`;for(let v=ysc.lo;v<=ysc.hi+1e-9;v+=st)ch+=`<line x1="${L}" x2="${Wc-R}" y1="${sy(v)}" y2="${sy(v)}" class="gl"/><text x="${L-4}" y="${sy(v)+3.5}" class="ty">${(v<-1e-9?'−':'')+nf(v,2)}</text>`;
    const xs=(x1-x0)>20?5:(x1-x0)>8?2:1;for(let v=Math.ceil(x0/xs)*xs;v<=x1;v+=xs)ch+=`<text x="${sx(v)}" y="${Hc-5}" class="tx">${v}</text>`;
    ch+=`<line x1="${L}" x2="${Wc-R}" y1="${sy(P.lim)}" y2="${sy(P.lim)}" class="lim"/><path d="M${A.map(a=>sx(a[0]).toFixed(1)+' '+sy(a[1]).toFixed(1)).join('L')}" fill="none" stroke="#1d2a33" stroke-width="1.6"/>`+A.map(a=>`<circle cx="${sx(a[0]).toFixed(1)}" cy="${sy(a[1]).toFixed(1)}" r="2.6" fill="${tcolP(a[1])}" stroke="#1d2a33" stroke-width=".8"><title>${a[0]}: ${fv(a[1],2,TM.pp)}${un(TM.pp)} · ${a[2]} punts</title></circle>`).join('')+'</svg>'}
  const D=z.pts.filter(p=>p.tv!=null).sort((a,b)=>trev()?a.tv-b.tv:b.tv-a.tv);
  return `<div class="tdet"><div class="tdh"><div><span class="tag">${esc(TUN1[TM.un])}</span><h2>${esc(z.n)}</h2>${z.sub?`<div class="where">${esc(z.sub)}</div>`:''}</div><button class="x" id="tdclose" aria-label="Tanca">×</button></div>
   <div class="kpis"><div class="kpi"><b style="color:${z.ok?'inherit':'var(--muted)'}">${z.ok?tfv(z.val):'—'}</b><span>${esc(TST[TM.st])} (${tunit()})${z.ok?'':' · menys de '+TM.min+' punts'}</span></div><div class="kpi"><b>${z.np}</b><span>punts amb dades · ${z.na.toLocaleString('ca-ES')} valors</span></div>
   ${TM.st!=='pct'&&z.np?`<div class="kpi"><b>${tfv(z.mn)}</b><span>punt amb el valor més baix</span></div><div class="kpi"><b>${tfv(z.mx)}</b><span>punt amb el valor més alt</span></div>`:''}</div>
   ${ch?`<h3>Evolució anual (mitjana dels punts, ${esc(P.f)}${P.u?' '+P.u:''})</h3>${ch}`:''}
   ${D.length?`<h3>Punts de la zona (${D.length})</h3><div class="stack tpl">`+D.map(p=>`<button data-tpi="${p.i}" title="Obre el punt al visor"><i class="pdot" style="background:${TM.st==='pct'?(p.tv?CLC[2]:CLC[0]):tcol(p.tv)}"></i><span>${esc(p.n)}</span><em>${TM.st==='pct'?(p.tv?'supera':'no supera'):tfv(p.tv)+un(TM.pp)}</em></button>`).join('')+'</div>':''}</div>`}
function tHover(e){const t=$('ttip'),r=$('tmap').getBoundingClientRect();let txt='';
  if(TM.un==='heat'&&TM.grid){const p=tpt(e),x=(p.x-TM.tx)/TM.k,y=(p.y-TM.ty)/TM.k,g=TM.grid,i=Math.floor((x-g.x0)/g.cs),j=Math.floor((y-g.y0)/g.cs);if(i>=0&&j>=0&&i<g.nx&&j<g.ny){const v=g.G[j*g.nx+i];if(v===v)txt='Valor interpolat: '+(TM.st==='pct'?Math.round(v)+'%':tfv(v)+un(TM.pp))}}
  else{const z=e.target._z;if(z)txt=z.n+' · '+(z.ok?tfv(z.val)+' '+tunit():z.np?'menys de '+TM.min+' punts':'sense punts')+(z.np?' · '+z.np+' punts':'')}
  if(!txt){t.hidden=true;return}t.textContent=txt;t.style.left=(e.clientX-r.left)+'px';t.style.top=(e.clientY-r.top)+'px';t.hidden=false}
