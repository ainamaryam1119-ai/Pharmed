var K='pakmed_v1',S={m:[],po:[]},sel=0,DAY=864e5;
function rng(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function hist(avg,tr,seed){var r=rng(seed),h=[];for(var i=0;i<30;i++){h.push(Math.max(0,Math.round(avg*(1+tr*(i-15)/30)*(0.85+r()*0.3))))}return h}
function seed(){var d=Date.now();S={po:[],m:[
{n:'Paracetamol 500mg',st:2000,l:5,sf:500,ex:d+300*DAY,h:hist(500,0.25,3)},
{n:'Amoxicillin 250mg',st:3400,l:7,sf:300,ex:d+200*DAY,h:hist(180,0.05,5)},
{n:'Insulin Glargine',st:420,l:10,sf:100,ex:d+25*DAY,h:hist(40,0.1,8)},
{n:'ORS Sachets',st:1500,l:4,sf:250,ex:d+400*DAY,h:hist(220,0.35,11)},
{n:'Cetirizine 10mg',st:900,l:6,sf:120,ex:d+18*DAY,h:hist(60,-0.1,13)},
{n:'Omeprazole 20mg',st:2600,l:6,sf:200,ex:d+500*DAY,h:hist(110,0,17)}]}}
function load(){try{var j=localStorage.getItem(K);if(j){S=JSON.parse(j);return}}catch(e){}seed()}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function esc(t){var x=document.createElement('div');x.textContent=t;return x.innerHTML}
function fc(m,days){var h=m.h.slice(-14),n=h.length,sx=0,sy=0,sxy=0,sxx=0;
for(var i=0;i<n;i++){sx+=i;sy+=h[i];sxy+=i*h[i];sxx+=i*i}
var b=(n*sxy-sx*sy)/(n*sxx-sx*sx||1),a=(sy-b*sx)/n,w=0,ws=0,l7=h.slice(-7);
l7.forEach(function(v,i){w+=v*(i+1);ws+=i+1});var wma=w/ws,out=[];
for(var d=1;d<=days;d++){var reg=a+b*(n-1+d);out.push(Math.max(0,Math.round(0.5*reg+0.5*(wma+b*d*0.5))))}return out}
function an(m){var f=fc(m,m.l),pred=f.reduce(function(x,y){return x+y},0),avg=Math.round(m.h.slice(-7).reduce(function(x,y){return x+y},0)/7)||1,
need=pred+m.sf,short=Math.max(0,pred-m.st),reorder=Math.max(0,need-m.st-S.po.filter(function(p){return p.m===m.n&&!p.done}).reduce(function(x,p){return x+p.q},0)),
cover=m.st/avg,ed=Math.round((m.ex-Date.now())/DAY),stat=m.st<pred?'b':(m.st<need?'w':'o');
return{f:f,pred:pred,avg:avg,need:need,short:short,reorder:reorder,cover:cover,ed:ed,stat:stat}}
var LB={b:['Shortage risk','s-b'],w:['Low stock','s-w'],o:['Healthy','s-ok']};
function render(){var A=S.m.map(an),cnt={b:0,w:0},exp=0;
A.forEach(function(a){if(a.stat!='o')cnt[a.stat]++;if(a.ed<=30)exp++});
if(sel>=S.m.length)sel=0;
document.getElementById('kpi').innerHTML=[[S.m.length,'Medicines tracked'],[cnt.b,'Shortage risks'],[cnt.w,'Low stock'],[exp,'Expiring ≤30 days'],[S.po.filter(function(p){return!p.done}).length,'Open orders'],['Rs '+Math.round(S.m.reduce(function(x,m){return x+m.st*(m.p||50)},0)/1000)+'k','Inventory value']].map(function(k){return'<div class="k"><b>'+k[0]+'</b><span>'+k[1]+'</span></div>'}).join('');
var al='';S.m.forEach(function(m,i){var a=A[i];
if(a.stat=='b')al+='<div class="al s-b b"><b>⚠ Warning: '+esc(m.n)+'</b> – stock '+m.st+' packs, predicted demand over next '+m.l+' days is '+a.pred+'. Shortage of '+a.short+' packs. Order '+a.reorder+' packs immediately. <button class="g" onclick="mkPO('+i+')">Order now</button></div>';
else if(a.stat=='w')al+='<div class="al s-w b"><b>'+esc(m.n)+'</b> – stock will dip below safety level ('+m.sf+') after delivery window. Plan a purchase of '+a.reorder+' packs. <button class="g" onclick="mkPO('+i+')">Order</button></div>';
if(a.ed<=30)al+='<div class="al s-w b"><b>Expiry:</b> '+esc(m.n)+' expires in '+Math.max(a.ed,0)+' days'+(a.cover>a.ed?' – stock covers '+Math.round(a.cover)+' days, so some may expire unsold. Consider discounts or transfer.':'.')+'</div>'});
document.getElementById('alerts').innerHTML=al||'<div class="al s-ok b">All medicines are healthy. No alerts.</div>';
var t='<tr><th>Medicine</th><th>Stock</th><th>Avg/day</th><th>Predicted</th><th>Cover</th><th>Expiry</th><th>Status</th></tr>';
var qq=document.getElementById('q').value.toLowerCase(),fs=document.getElementById('fs').value;S.m.forEach(function(m,i){var a=A[i];if((qq&&m.n.toLowerCase().indexOf(qq)<0)||(fs&&a.stat!==fs))return;t+='<tr class="r'+(i==sel?' sel':'')+'" onclick="sel='+i+';render()"><td><b>'+esc(m.n)+'</b></td><td>'+m.st+'</td><td>'+a.avg+'</td><td>'+a.pred+' / '+m.l+'d</td><td>'+a.cover.toFixed(1)+'d</td><td>'+a.ed+'d</td><td><span class="b '+LB[a.stat][1]+'">'+LB[a.stat][0]+'</span></td></tr>'});
document.getElementById('tb').innerHTML=t;
document.getElementById('om').innerHTML=S.m.map(function(m,i){return'<option value="'+i+'"'+(i==sel?' selected':'')+'>'+esc(m.n)+'</option>'}).join('');
var m=S.m[sel],a=A[sel];document.getElementById('dt').textContent='Forecast: '+m.n;
document.getElementById('det').innerHTML='<table style="min-width:0"><tr><td>Current stock</td><td><b>'+m.st+' packs</b></td></tr><tr><td>Average daily demand</td><td>'+a.avg+' packs</td></tr><tr><td>Supplier delivery time</td><td>'+m.l+' days</td></tr><tr><td>Safety stock</td><td>'+m.sf+' packs</td></tr><tr><td>Predicted demand (next '+m.l+' days)</td><td><b>'+a.pred+' packs</b></td></tr><tr><td>Recommended order</td><td><b>'+a.reorder+' packs</b></td></tr><tr><td>Result</td><td><span class="b '+LB[a.stat][1]+'">'+(a.stat=='b'?'Shortage of '+a.short+' packs':LB[a.stat][0])+'</span></td></tr></table>';
chart(m,a);donut(A);document.getElementById('lg').innerHTML=(S.log||[]).slice(-8).reverse().map(function(x){return'• '+esc(x)}).join('<br>')||'No activity yet.';
document.getElementById('pos').innerHTML=S.po.length?S.po.slice().reverse().slice(0,8).map(function(p){var i=S.po.indexOf(p);return'<div class="al s-ok b" style="background:var(--bg)">'+esc(p.m)+' · '+p.q+' packs · '+(p.done?'received':'ordered')+(p.done?'':' <button class="g" onclick="rcv('+i+')">Mark received</button>')+'</div>'}).join(''):'<span style="color:var(--mut);font-size:13px">No orders yet.</span>';
save()}
function chart(m,a){var h=m.h.slice(-21),f=a.f,all=h.concat(f),mx=Math.max.apply(null,all)*1.1||1,W=420,H=170,p=22,n=all.length;
function X(i){return p+i*(W-2*p)/(n-1)}function Y(v){return H-p-v/mx*(H-2*p)}
var l1=h.map(function(v,i){return X(i)+','+Y(v)}).join(' '),l2=[X(h.length-1)+','+Y(h[h.length-1])].concat(f.map(function(v,i){return X(h.length+i)+','+Y(v)})).join(' ');
document.getElementById('ch').innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Demand history and forecast"><line x1="'+p+'" y1="'+(H-p)+'" x2="'+(W-p)+'" y2="'+(H-p)+'" stroke="var(--bd)"/><polyline points="'+l1+'" fill="none" stroke="var(--pri)" stroke-width="2"/><polyline points="'+l2+'" fill="none" stroke="var(--bad)" stroke-width="2" stroke-dasharray="5 4"/><text x="'+p+'" y="14" font-size="11" fill="var(--mut)">Daily demand: last 21 days (blue) · forecast (red dashed)</text><text x="'+p+'" y="'+(H-6)+'" font-size="10" fill="var(--mut)">past</text><text x="'+(W-p-30)+'" y="'+(H-6)+'" font-size="10" fill="var(--mut)">+'+m.l+' days</text></svg>'}
function lg(t){S.log=S.log||[];S.log.push(new Date().toLocaleDateString()+' – '+t);if(S.log.length>40)S.log.shift()}
function donut(A){var c={o:0,w:0,b:0},col={o:'var(--ok)',w:'var(--warn)',b:'var(--bad)'},n=A.length||1,C=251.3,off=0,s='';A.forEach(function(a){c[a.stat]++});
['o','w','b'].forEach(function(k){var l=c[k]/n*C;if(l)s+='<circle cx="50" cy="50" r="40" fill="none" stroke="'+col[k]+'" stroke-width="14" stroke-dasharray="'+l+' '+(C-l)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 50 50)"/>';off+=l});
document.getElementById('dn').innerHTML='<svg viewBox="0 0 100 100" style="width:130px">'+s+'<text x="50" y="55" text-anchor="middle" font-size="16" font-weight="700" fill="var(--tx)">'+Math.round(c.o/n*100)+'%</text></svg><ul><li><span class="dt" style="background:var(--ok)"></span>Healthy: '+c.o+'</li><li><span class="dt" style="background:var(--warn)"></span>Low stock: '+c.w+'</li><li><span class="dt" style="background:var(--bad)"></span>Shortage risk: '+c.b+'</li></ul>'}
function rep(){var r=document.getElementById('rp'),t='Medicine,Stock,AvgDaily,PredictedDemand,SafetyStock,Reorder,Status,ExpiryDays';S.m.forEach(function(m){var a=an(m);t+='\n'+m.n+','+m.st+','+a.avg+','+a.pred+','+m.sf+','+a.reorder+','+LB[a.stat][0]+','+a.ed});r.value=t;r.style.display=r.style.display=='none'?'block':'none'}
function del(){if(S.m.length<2)return;lg('Removed '+S.m[sel].n);S.m.splice(sel,1);sel=0;render()}
function qty(){var q=parseInt(document.getElementById('oq').value);return q>0?q:0}
function pick(){return parseInt(document.getElementById('om').value)||0}
function sale(){var q=qty(),m=S.m[pick()];if(!q)return;m.h.push(q);m.st=Math.max(0,m.st-q);lg(q+' packs of '+m.n+' sold');sel=pick();render()}
function recv(){var q=qty(),m=S.m[pick()];if(!q)return;m.st+=q;lg(q+' packs of '+m.n+' received');sel=pick();render()}
function mkPO(i){var m=S.m[i],a=an(m);if(!a.reorder){lg('No order needed for '+m.n);render();return}S.po.push({m:m.n,q:a.reorder,done:false});lg('Purchase order: '+a.reorder+' packs of '+m.n);render()}
function rcv(i){var p=S.po[i];if(p.done)return;p.done=true;lg('Order received: '+p.q+' packs of '+p.m);S.m.forEach(function(m){if(m.n===p.m)m.st+=p.q});render()}
function spike(){var m=S.m[sel];lg('Simulated +50% demand spike for '+m.n);for(var i=1;i<=5;i++){m.h[m.h.length-i]=Math.round(m.h[m.h.length-i]*1.5)}render()}
function add(){var g=function(i){return parseFloat(document.getElementById(i).value)||0},n=document.getElementById('n').value.trim();
if(!n||g('a')<=0)return;var r=rng(Date.now()%1000+1),h=[];for(var i=0;i<30;i++)h.push(Math.round(g('a')*(0.85+r()*0.3)));
S.m.push({n:n,st:g('s'),l:Math.max(1,g('l')),sf:g('sf'),ex:Date.now()+g('e')*DAY,p:g('p')||50,h:h});lg('Added medicine '+n);sel=S.m.length-1;document.getElementById('n').value='';render()}
function reset(){seed();sel=0;render()}
load();render();
