// Exportació a Excel i PDF (punts, analítiques i plànols temàtics).
function activeFilters(pt){const a=[];const off=POS.filter(p=>!state.pos[p]);if(off.length)a.push('Nivells amagats: '+off.join(', '));const toff=TPS.filter(v=>!state.tp[v]);if(toff.length)a.push('Tipus amagats: '+toff.join(', '));if(state.gm!=='all')a.push('Gestió: només '+state.gm);if(state.q)a.push('Cerca: «'+$('q').value.trim()+'»');FX.forEach(([k,lab])=>{if(state.fx[k].size)a.push(lab+': '+[...state.fx[k]].join(', '))});return pt?expFilt():a}
const EXC=[['Unitat',a=>a.n],['Codi ICGC',a=>a.id],['Tipus',a=>a.tp],['Posició',a=>a.ps],['Naturalesa',a=>a.na],['Comportament',a=>a.cp],['Porositat',a=>a.po],['Tipus de formació',a=>a.tf],['Subtipus',a=>a.st],['Gestió',a=>gestTxt(a)],['Àrea (km²)',a=>areaOf(a)],['Fitxa ICGC',a=>a.fx]];
const TITLE='Salinitat i intrusió marina en aigües subterrànies a Catalunya';
const EXP=()=>{const pp=state.pp,P=PARS[pp],u=P.u?' ('+P.u+')':'';return [['Punt',p=>p.n],['Codi ACA',p=>p.ca],['Municipi',p=>p.m],['Comarca',p=>p.k],['Gestió',p=>p.g],["Massa d'aigua (SDIM)",p=>p.ma],['Distància a la costa (km)',p=>p.dc],['Fondària del pou (m)',p=>p.f],['Cota (m)',p=>p.z],['X UTM31N ETRS89',p=>p.x],['Y UTM31N ETRS89',p=>p.y],['Valors '+P.f,p=>p.nn],['Primer any',p=>p.ya],['Darrer any',p=>p.yb],[P.f+' '+PMN[state.pm]+u,p=>p.v==null?'':fv(p.v,3,pp)],['Data darrer valor',p=>p.tl?dstr(p.tl):''],['Algun valor '+limTxt(pp),p=>p.nn?(p.ex?'Sí':'No'):''],...(state.aqon?[['Unitats hidrogeològiques',p=>p.aq.map(i=>AQ[i].n).join('; ')]]:[])]};
const vtx=(q,k)=>!q?'':(cen(q[1],k)||q[3]===2||q[3]===3)?fq(q,k).replace(/\s/g,''):q[1], vtp=(q,k)=>q?fq(q,k).replace(/\s/g,''):'';
const ANH=()=>['Punt','Codi ACA','Municipi','Comarca',"Massa d'aigua",'Dist. costa (km)','Data','Any',...AK.map(k=>PA(k).nm+(PA(k).f!==PA(k).nm?' '+PA(k).f:'')+(PA(k).u?' ('+PA(k).u+')':'')),'Font'];
function valSheet(P,title,date,af){const A=anaRows(P),H=ANH();
  const R=A.map(r=>[r.p.n,r.p.ca||'',r.p.m||'',r.p.k||'',r.p.ma||'',r.p.dc,dstr(r.t),yr(r.t),...AK.map(k=>vtx(r.v[k],k)),SRCN[r.s]]);
  const aoa=[[title+' · Tots els valors'],['Data: '+date+'   ·   '+P.length+' punts   ·   '+R.length+' registres (ordenats per punt i data)   ·   '+srcTxt()],['Filtres aplicats:'],...(af&&af.length?af:['Cap filtre']).map(f=>['   '+f]),['   «<x»: inferior al límit analític; «>x»: superior al límit del mètode; «≈»: sodi estimat pel balanç de cations. % mar, Na/Cl, Revelle, Mg/Ca i BEX: càlcul propi a partir dels ions de la mateixa mostra.'],[],H,...R];
  const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=H.map(h=>({wch:Math.max(10,Math.min(26,h.length+2))}));ws['!cols'][0]={wch:38};ws['!cols'][H.length-1]={wch:36};return ws}
function pInfo(p){const I=info(),P=PARS[state.pp];return Object.assign(I,{pt:true,rows:[p],cols:EXP(),af:expFilt().filter(f=>/^(Paràmetre|Període|Fonts)/.test(f)),
  title:TITLE+' · '+p.n,src:srcTxt(),unit:' punt',file:'analitiques_'+String(p.ca||p.id).replace(/[^\w-]/g,'_')+'_'})}
function info(){const now=new Date(),pad=n=>String(n).padStart(2,'0'),pt=state.lm==='pt'&&state.pon,P=PARS[state.pp];
  return{pt,rows:pt?ptList():AQ.filter(match).sort((x,y)=>x.n.localeCompare(y.n,'ca')),cols:pt?EXP():EXC,af:activeFilters(pt),
   title:TITLE+(pt?' · Punts de control: '+P.nm.toLowerCase():' · Aqüífers filtrats'),src:pt?srcTxt():'Font: ICGC',unit:pt?' punts':' unitats',
   file:pt?'punts_'+P.f.replace(/[^\w]/g,'')+'_':'aquifers_filtrats_',date:pad(now.getDate())+'/'+pad(now.getMonth()+1)+'/'+now.getFullYear(),stamp:now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes())}}
function aqInfo(a){const I=info(),P=PARS[state.pp];return Object.assign(I,{pt:true,rows:aqList(a),cols:EXP(),af:[...expFilt().filter(f=>!/^Cerca/.test(f)),'Unitat hidrogeològica: '+a.n+' ('+a.id+')'],
  title:TITLE+' · '+a.n+' · Punts de control: '+P.nm.toLowerCase(),src:srcTxt(),unit:' punts',file:'punts_'+a.id+'_'+P.f.replace(/[^\w]/g,'')+'_'})}
const srcTxt=()=>'Fonts: '+(state.src.size===SGS.length?'ACA (SDIM i dades obertes de piezometria)':SGS.filter(g=>state.src.has(g)).map(g=>SGN[g]).join(', '));
function expFilt(){const pp=state.pp,P=PARS[pp],a=[];
  a.push('Paràmetre representat: '+P.nm+(P.f!==P.nm?' ('+P.f+')':'')+', '+PMN[state.pm]+' del període');
  a.push('Àmbit de gestió: '+(state.gm==='all'?'tot Catalunya (ACA i CHE)':'només '+state.gm));
  if(state.q)a.push('Cerca: «'+$('q').value.trim()+'»');
  a.push('Distància a la costa: '+(state.pdc?'fins a '+state.pdc+' km':'tots els punts'));
  a.push("Massa d'aigua: "+(state.pma||'totes'));a.push('Comarca: '+(state.pcom||'totes'));a.push('Municipi: '+(state.pmun||'tots'));
  a.push('Període: '+state.y0+'–'+state.y1);
  a.push('Fonts de dades: '+SGS.filter(g=>state.src.has(g)).map(g=>SGN[g]).join(', '));
  a.push('Valors de referència: '+(state.pex?'només punts amb algun valor '+limTxt(pp):'tots els punts'));
  const on=[2,1,0,3].filter(k=>state.pcl[k]);a.push('Classes mostrades ('+PMN[state.pm]+'): '+(on.length?on.map(k=>clsName(k,pp)).join('; '):'cap'));
  return a}
function pActive(){const a=[];if(!state.pon)return a;const pp=state.pp,P=PARS[pp];a.push('Punts: '+P.nm+' ('+PMN[state.pm]+')');
  if(state.src.size<SGS.length)a.push('Fonts: '+[...state.src].map(g=>SGN[g]).join(', '));if(state.y0>Y0||state.y1<Y1)a.push('Període: '+state.y0+'–'+state.y1);
  if(state.pex)a.push('Algun valor '+limTxt(pp));if(state.pdc)a.push('Fins a '+state.pdc+' km de la costa');if(state.pma)a.push("Massa d'aigua: "+state.pma);
  if(state.pcom)a.push('Comarca: '+state.pcom);if(state.pmun)a.push('Municipi: '+state.pmun);const off=[0,1,2].filter(k=>!state.pcl[k]);if(off.length)a.push('Classes amagades: '+off.map(k=>clsName(k,pp)).join(', '));if(state.pcl[3])a.push('Inclou punts sense dades al període');return a}
const tFile=()=>'tematic_'+PARS[TM.pp].f.replace(/[^\w]/g,'')+'_'+TM.st+'_'+TM.un+'_'+TM.y0+'-'+TM.y1;
const tTitle=()=>TITLE+' · Plànol temàtic: '+PARS[TM.pp].nm+', '+TST[TM.st]+', '+TUN[TM.un].toLowerCase();
const tFilt=()=>['Paràmetre: '+PARS[TM.pp].nm,'Estadístic: '+TSTL[TM.st]+' ('+tunit()+')','Representació: '+TUN[TM.un]+(TM.un==='heat'?' (IDW, radi 15 km'+(TM.clip?', retallat als aqüífers':'')+'); taula per comarques':''),'Període: '+TM.y0+'–'+TM.y1,'Fonts de dades: '+SGS.filter(g=>TM.src.has(g)).map(g=>SGN[g]).join(', '),'Mínim de punts per zona: '+TM.min];
const tRows=Z=>[...Z].filter(z=>z.np).sort((a,b)=>(b.val??-1)-(a.val??-1));
function tXls(Z){if(typeof XLSX==='undefined')return alert('Cal connexió a internet per exportar.');const now=new Date(),pad=n=>String(n).padStart(2,'0'),u=tunit(),un=TM.un==='heat'?'Comarca':TUN1[TM.un][0].toUpperCase()+TUN1[TM.un].slice(1);
  const H=[un,'Codi',TST[TM.st][0].toUpperCase()+TST[TM.st].slice(1)+' ('+u+')','Punts amb dades','Valors utilitzats','Valor de punt mínim','Valor de punt màxim','Dades suficients'];
  const aoa=[[tTitle()],['Data: '+pad(now.getDate())+'/'+pad(now.getMonth()+1)+'/'+now.getFullYear()],['Filtres aplicats:'],...tFilt().map(f=>['   '+f]),[],H,...tRows(Z).map(z=>[z.n,z.id,z.val==null?'':Math.round(z.val*100)/100,z.np,z.na,z.mn==null?'':Math.round(z.mn*100)/100,z.mx==null?'':Math.round(z.mx*100)/100,z.ok?'Sí':'No'])];
  const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=H.map((h,i)=>({wch:i?Math.max(12,h.length+2):40}));XLSX.utils.book_append_sheet(wb,ws,'Zones');
  const PH=['Punt','ID unificat','Codi ACA','Municipi','Comarca',un,'Valor del punt ('+(TM.st==='pct'?'supera la referència':tunit())+')','Valors utilitzats'],PR=[];tRows(Z).forEach(z=>z.pts.filter(p=>p.tv!=null).forEach(p=>PR.push([p.n,p.id,p.ca||'',p.m||'',p.k||'',z.n,TM.st==='pct'?(p.tv?'Sí':'No'):Math.round(p.tv*100)/100,p.tn])));
  const ws2=XLSX.utils.aoa_to_sheet([[tTitle()+' · Valor de cada punt'],[],PH,...PR]);ws2['!cols']=PH.map((h,i)=>({wch:i?Math.max(12,h.length+2):40}));XLSX.utils.book_append_sheet(wb,ws2,'Punts');XLSX.writeFile(wb,tFile()+'.xlsx')}
function tImg(){return new Promise(res=>{const c=tsvg.cloneNode(true),wpx=1600,hpx=Math.round(1600*H/W);c.setAttribute('width',wpx);c.setAttribute('height',hpx);c.querySelector('#tvp').setAttribute('transform','');c.querySelector('#thl').innerHTML=TM.sel?$('thl').innerHTML.replace('vector-effect="non-scaling-stroke"',''):'';
  c.querySelectorAll('[vector-effect]').forEach(e=>e.removeAttribute('vector-effect'));
  const s=new XMLSerializer().serializeToString(c),img=new Image();img.onload=()=>{const cv=document.createElement('canvas'),lw=330;cv.width=wpx;cv.height=hpx;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,wpx,hpx);g.drawImage(img,0,0,wpx,hpx);
    g.fillStyle='#1d2a33';g.font='bold 26px Helvetica,Arial';g.fillText(PARS[TM.pp].nm+' · '+TST[TM.st],30,46);g.font='18px Helvetica,Arial';g.fillText(TUN[TM.un]+' · '+TM.y0+'–'+TM.y1,30,74);
    const b=tbr(),f=v=>TM.st==='pct'?v+'%':nf(v,2);let y=hpx-50-(b.length+1)*26;const lx=wpx-lw-30;g.fillStyle='rgba(255,255,255,.92)';g.fillRect(lx,y-34,lw,(b.length+1)*26+50);g.fillStyle='#1d2a33';g.font='bold 15px Helvetica,Arial';g.fillText(TM.st==='pct'?'% de punts que superen la referència':PARS[TM.pp].f+(PARS[TM.pp].u?' ('+PARS[TM.pp].u+')':''),lx+12,y-12);g.font='15px Helvetica,Arial';
    for(let i=b.length;i>=0;i--){g.fillStyle=tpal(i);g.fillRect(lx+12,y,22,16);g.strokeStyle='#999';g.strokeRect(lx+12,y,22,16);g.fillStyle='#1d2a33';g.fillText(i===b.length?'> '+f(b[i-1]):i===0?'< '+f(b[0]):f(b[i-1])+' – '+f(b[i]),lx+44,y+13);y+=26}
    g.font='13px Helvetica,Arial';g.fillStyle='#5d6b75';g.fillText('Colgeocat · Comissió Tècnica de l’Aigua · Fonts: '+SGS.filter(x=>TM.src.has(x)).map(x=>SGN[x]).join(', '),30,hpx-14);res(cv.toDataURL('image/png'))};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)})}
function tPdf(Z){if(typeof jspdf==='undefined'||!jspdf.jsPDF.API.autoTable)return alert('Cal connexió a internet per exportar.');tImg().then(u=>{const doc=new jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4'}),ps=s=>String(s).replace(/₃/g,'3').replace(/₂/g,'2').replace(/₄/g,'4').replace(/[‘’]/g,"'");
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(ps(tTitle()),14,13);doc.setFont('helvetica','normal');doc.setFontSize(8.5);let y=19;tFilt().forEach(f=>{doc.text(ps('• '+f),14,y);y+=4});
  const ih=180-y,iw=ih*W/H;doc.addImage(u,'PNG',14,y+1,Math.min(iw,180),Math.min(iw,180)*H/W);
  const R=tRows(Z),u2=tunit();doc.autoTable({startY:y+1,margin:{left:200,right:10},head:[[ps(TM.un==='heat'?'Comarca':TUN1[TM.un]),ps(TST[TM.st]+' ('+u2+')'),'Punts']],body:R.slice(0,60).map(z=>[ps(z.n),z.ok?ps(tfv(z.val)):'—',z.np]),styles:{fontSize:7,cellPadding:.9},headStyles:{fillColor:[48,49,48]}});
  if(R.length>60){doc.addPage();doc.autoTable({startY:12,head:[[ps(TUN1[TM.un]),ps(TST[TM.st]+' ('+u2+')'),'Punts','Valors']],body:R.map(z=>[ps(z.n),z.ok?ps(tfv(z.val)):'—',z.np,z.na]),styles:{fontSize:7,cellPadding:1},headStyles:{fillColor:[48,49,48]}})}
  doc.save(tFile()+'.pdf')})}
