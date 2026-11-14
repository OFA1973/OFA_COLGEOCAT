// Utilitats generals: DOM, text, nombres i geometria plana.
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>n.toLocaleString('ca-ES',{maximumFractionDigits:1});
const ring2d=r=>'M'+r.map(p=>X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('L')+'Z';
const polys=c=>c.t==='Polygon'?[c.c]:c.c;
function tip(e,txt){const r=$('map').getBoundingClientRect(),t=$('tip');t.textContent=txt;t.style.left=(e.clientX-r.left)+'px';t.style.top=(e.clientY-r.top)+'px';t.hidden=false}
const inRing=(x,y,r)=>{let s=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])s=!s}return s};
const nf=(v,d)=>Math.abs(v).toLocaleString('ca-ES',{maximumFractionDigits:d});
function niceStep(v){if(!(v>0))return 1;const m=Math.pow(10,Math.floor(Math.log10(v)));return [1,2,2.5,5,10].map(f=>f*m).find(s=>s>=v)}
const xdec=t=>{if(t>99999){const y=Math.floor(t/1e4),m=Math.floor(t/100)%100,d=t%100;return y+(m-1)/12+(d-1)/365}return t+.5};
function yScale(vals,lim,neg){let lo=Math.min(0,...vals,lim),hi=Math.max(...vals,lim);if(!neg)lo=0;if(hi-lo<1e-9)hi=lo+1;hi+=(hi-lo)*.06;if(neg&&lo<0)lo-=(hi-lo)*.04;
  const st=niceStep((hi-lo)/4);return {lo:Math.floor(lo/st)*st,hi:Math.ceil(hi/st)*st,st}}
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),h=b.length>>1;return b.length%2?b[h]:(b[h-1]+b[h])/2};
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function pctl(a,q){if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),i=(b.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return b[lo]+(b[hi]-b[lo])*(i-lo)}
