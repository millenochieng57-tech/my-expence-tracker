let receipts = JSON.parse(localStorage.getItem('millen_ultimate_v6')||'[]');
let balance = Number(localStorage.getItem('millen_bal_ultimate')||'0');
let cart = [];
let tab='daily';

function editBalance(){
 let newBal = prompt('Enter NEW Current Balance (e.g. 20000):', balance);
 if(newBal !== null && newBal.trim() !== ''){
   balance = Number(newBal);
   localStorage.setItem('millen_bal_ultimate', balance);
   renderAll();
   alert('✅ Balance updated to KSh ' + balance.toLocaleString());
 }
}

function addToCart(){
 let name=document.getElementById('iName').value.trim();
 let price=Number(document.getElementById('iPrice').value);
 let qty=Number(document.getElementById('iQty').value)||1;
 if(!name||!price) return alert('Enter item and price');
 cart.push({name,price,qty,total:price*qty,id:Date.now()+Math.random()});
 document.getElementById('iName').value='';document.getElementById('iPrice').value='';document.getElementById('iQty').value='1';
 renderCart();
}
function renderCart(){
 let sum=cart.reduce((a,b)=>a+b.total,0);
 document.getElementById('liveTotal').innerText='KSh '+sum.toLocaleString();
 document.getElementById('cartList').innerHTML=cart.map((c,i)=>`
  <div class="cart-item"><div><b style="font-size:12px">${c.name}</b><br><small style="color:#666">${c.qty} x KSh ${c.price.toLocaleString()}</small></div><div style="text-align:right"><b style="font-size:12px">KSh ${c.total.toLocaleString()}</b><br><small onclick="cart.splice(${i},1);renderCart()" style="color:#ff5a5a;cursor:pointer">remove</small></div></div>
 `).join('') || '<small style="color:#555">Cart empty. Add items - total increases live.</small>';
}
function saveReceipt(){
 if(cart.length===0) return alert('Add items first');
 let type=document.getElementById('type').value;
 let note=document.getElementById('note').value|| (type==='spent'?'Purchase':'Income');
 let total=cart.reduce((a,b)=>a+b.total,0);
 let receipt={id:Date.now(),dayKey:new Date().toISOString().slice(0,10),displayDate:new Date().toDateString(),fullTime:new Date().toLocaleString(),timeShort:new Date().toLocaleTimeString(),type,note,items:[...cart],total,locked:true};
 receipts.unshift(receipt);
 if(type==='spent') balance-=total; else balance+=total;
 localStorage.setItem('millen_ultimate_v6',JSON.stringify(receipts));
 localStorage.setItem('millen_bal_ultimate',balance);
 cart=[];document.getElementById('note').value='';
 renderCart(); renderAll();
 alert('✅ PROTECTED SAVE! KSh '+total.toLocaleString()+' Daily calculator updated. History locked.');
}
function groupByDay(){
 let g={};
 receipts.forEach(r=>{if(!g[r.dayKey]) g[r.dayKey]=[]; g[r.dayKey].push(r);});
 return g;
}
function renderAll(){
 document.getElementById('balance').innerText='KSh '+balance.toLocaleString();
 document.getElementById('today').innerText=new Date().toDateString();
 let todayKey=new Date().toISOString().slice(0,10);
 let todayTotal=receipts.filter(r=>r.dayKey===todayKey && r.type==='spent').reduce((a,b)=>a+b.total,0);
 let weekTotal=receipts.filter(r=>r.type==='spent').slice(0,10).reduce((a,b)=>a+b.total,0);
 let totalSpent=receipts.filter(r=>r.type==='spent').reduce((a,b)=>a+b.total,0);
 let totalIncome=receipts.filter(r=>r.type==='income').reduce((a,b)=>a+b.total,0);
 document.getElementById('chipToday').innerText='KSh '+todayTotal.toLocaleString()+' today';
 document.getElementById('chipWeek').innerText='KSh '+weekTotal.toLocaleString()+' week';
 document.getElementById('chipItems').innerText=receipts.reduce((a,b)=>a+b.items.length,0)+' items';
 document.getElementById('chipReceipts').innerText=receipts.length+' receipts';
 document.getElementById('statSpent').innerText='KSh '+totalSpent.toLocaleString();
 document.getElementById('statIncome').innerText='KSh '+totalIncome.toLocaleString();
 document.getElementById('statStock').innerText='KSh '+totalSpent.toLocaleString();
 document.getElementById('updateText').innerText=receipts[0]? `Last: ${receipts[0].fullTime} • ${receipts[0].note} - KSh ${receipts[0].total.toLocaleString()} • Protected: ${receipts.length} receipts` : 'No activity yet • Add first item to start live updates';
 let grouped=groupByDay();
 if(tab==='daily'){
   document.getElementById('mainContent').innerHTML=Object.entries(grouped).map(([day,recs])=>{
     let daySpent=recs.filter(r=>r.type==='spent').reduce((a,b)=>a+b.total,0);
     let dayIncome=recs.filter(r=>r.type==='income').reduce((a,b)=>a+b.total,0);
     let dayItems=recs.reduce((a,b)=>a+b.items.length,0);
     return `<div class="day-card"><div style="display:flex;justify-content:space-between"><div><b style="font-size:14px">${day}</b><br><small style="color:#666">${recs[0].displayDate} • ${recs.length} receipts • ${dayItems} items</small></div><div style="text-align:right"><b style="color:#ff5a5a">-KSh ${daySpent.toLocaleString()}</b><br><b style="color:#00ff88;font-size:11px">+KSh ${dayIncome.toLocaleString()}</b></div></div>
       <div style="margin-top:10px">${recs.map(r=>`<div style="background:#0f0f0f;padding:8px;border-radius:8px;margin-bottom:6px;border:1px solid #1e1e1e"><div style="display:flex;justify-content:space-between;font-size:11px"><span><b>${r.note}</b> • ${r.timeShort} • ${r.type}</span><span style="color:${r.type==='spent'?'#ff5a5a':'#00ff88'}">KSh ${r.total.toLocaleString()}</span></div><div style="margin-top:4px">${r.items.map(it=>`<div class="item-row"><span>${it.name} (${it.qty} x ${it.price.toLocaleString()})</span><b>KSh ${it.total.toLocaleString()}</b></div>`).join('')}</div></div>`).join('')}</div>`;
   }).join('') || '<p style="text-align:center;color:#555;margin-top:30px">No daily data yet. Add items and save.</p>';
 } else if(tab==='receipts'){
   document.getElementById('mainContent').innerHTML=receipts.map(r=>`
     <div class="card"><div class="card-head"><div><b>Receipt #${String(r.id).slice(-6)}</b><br><small style="color:#666">${r.displayDate} ${r.timeShort} • ${r.note}</small></div><div style="text-align:right"><b style="color:${r.type==='spent'?'#ff5a5a':'#00ff88'}">${r.type==='spent'?'-':'+'}KSh ${r.total.toLocaleString()}</b><br><span class="lock">🔒 PROTECTED</span></div></div>
     <div style="margin-top:8px">${r.items.map(it=>`<div class="item-row"><span>${it.name} <small style="color:#666">(${it.qty} x ${it.price.toLocaleString()})</small></span><b>KSh ${it.total.toLocaleString()}</b></div>`).join('')}<div style="display:flex;justify-content:space-between;font-weight:800;margin-top:6px;padding-top:6px;border-top:1px dashed #333"><span>Total</span><span style="color:#ccff00">KSh ${r.total.toLocaleString()}</span></div></div>
     </div>
   `).join('') || '<p style="text-align:center;color:#555">No receipts yet</p>';
 } else if(tab==='items'){
   let all=[];
   receipts.forEach(r=>r.items.forEach(it=>all.push({...it,day:r.displayDate,type:r.type,note:r.note})));
   document.getElementById('mainContent').innerHTML=all.map(it=>`
     <div class="card" style="padding:10px;display:flex;justify-content:space-between"><div><b style="font-size:12px">${it.name}</b><br><small style="color:#666">${it.day} • ${it.note} • ${it.type}</small></div><div style="text-align:right"><b style="font-size:12px">KSh ${it.total.toLocaleString()}</b><br><small style="color:#666">${it.qty} x ${it.price.toLocaleString()}</small></div></div>
   `).join('') || '<p style="text-align:center;color:#555">No items yet</p>';
 } else {
   document.getElementById('mainContent').innerHTML=receipts.map(r=>`
     <div class="card" style="padding:10px"><div style="display:flex;justify-content:space-between"><span style="font-size:11px;color:#666">${r.fullTime}</span><span class="lock">UPDATE</span></div><div style="margin-top:6px"><b style="font-size:13px">${r.type==='spent'?'🛒 Bought':'💰 Received'}: ${r.note}</b><br><small style="color:#888">${r.items.length} items • Total KSh ${r.total.toLocaleString()}</small></div></div>
   `).join('') || '<p style="text-align:center;color:#555">No updates yet</p>';
 }
}
function setTab(t,el){
 tab=t;
 document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
 el.classList.add('active');
 renderAll();
}
if(receipts.length===0 && balance===0){
 setTimeout(()=>{let b=prompt('ULTIMATE VERSION - Enter your current balance to start (e.g. 20000)'); if(b){balance=Number(b); localStorage.setItem('millen_bal_ultimate',balance); renderAll();}},500);
}
renderCart();
renderAll();