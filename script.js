// PAYWALL + PASSWORD SYSTEM
let savedPass = localStorage.getItem('_pass');
let hasPaid = localStorage.getItem('MANAGER_paid') === 'yes';
function checkPay(){
 const el=document.getElementById('payWall');
 if(!el) return;
 if(!hasPaid){ el.style.display='flex'; }
 else{ el.style.display='none'; }
}
function unlockAfterPay(){
 let code = document.getElementById('mpesaCode').value.trim();
 if(code.length < 4) return alert('Enter valid M-Pesa code e.g. THJ...');
 localStorage.setItem('MANAGER_paid','yes');
 localStorage.setItem('MANAGER_mpesa',code);
 document.getElementById('payWall').style.display='none';
 hasPaid=true;
 alert('Asante! App unlocked 🔓 Karibu!');
}
function checkLock(){
 const el=document.getElementById('lockScreen');
 if(!el) return;
 if(savedPass){ el.style.display='flex'; document.body.style.overflow='hidden'; }
 else{ el.style.display='none'; }
}
function unlockApp(){
 let p=document.getElementById('passInput').value;
 if(p===localStorage.getItem('MANAGER_pass')){
  document.getElementById('lockScreen').style.display='none';
  document.body.style.overflow='auto';
 }else{ alert('Wrong password!'); }
}
function setPassword(){
 let curr=localStorage.getItem('MANAGER_pass');
 if(curr){
  let oldP=prompt('Enter current password:');
  if(oldP!==curr) return alert('Wrong current password');
 }
 let np=prompt('Set new password (leave empty to remove):');
 if(np===null) return;
 if(np===''){localStorage.removeItem('MANAGER_pass'); alert('Password removed'); savedPass=null; checkLock(); return;}
 localStorage.setItem('MANAGER_pass',np); savedPass=np; alert('Password set! 🔒'); checkLock();
}
function resetPass(){
 if(confirm('Reset password?')){
  localStorage.removeItem('MANAGER_pass'); savedPass=null; document.getElementById('lockScreen').style.display='none'; document.body.style.overflow='auto';
 }
}
function openHelp(){document.getElementById('helpModal').style.display='flex';}
function closeHelp(){document.getElementById('helpModal').style.display='none';}
setTimeout(()=>{checkPay(); checkLock();},400);

// MAIN APP DATA
let balance = parseFloat(localStorage.getItem('MANAGER_balance')||'0');
let receipts = JSON.parse(localStorage.getItem('MANAGER_receipts')||'[]');
let cart = [];
let currentTab='daily';

document.getElementById('today').innerText = new Date().toDateString();

function saveAll(){
 localStorage.setItem('MANAGER_balance', balance.toString());
 localStorage.setItem('MANAGER_receipts', JSON.stringify(receipts));
 localStorage.setItem('MANAGER_paid','yes'); // auto mark paid once they use app
 hasPaid=true;
 updateUI();
}

function editBalance(){
 let nb=prompt('Enter new current balance KSh:', balance);
 if(nb===null) return;
 let v=parseFloat(nb);
 if(isNaN(v)) return alert('Invalid number');
 balance=v;
 saveAll();
}

function addToCart(){
 let name=document.getElementById('iName').value.trim();
 let price=parseFloat(document.getElementById('iPrice').value);
 let qty=parseInt(document.getElementById('iQty').value)||1;
 if(!name) return alert('Enter item name');
 if(isNaN(price)||price<=0) return alert('Enter valid price');
 cart.push({name,price,qty,total:price*qty});
 document.getElementById('iName').value='';
 document.getElementById('iPrice').value='';
 document.getElementById('iQty').value='1';
 renderCart();
}

function renderCart(){
 let list=document.getElementById('cartList');
 let sum=0;
 list.innerHTML='';
 cart.forEach((c,i)=>{
  sum+=c.total;
  list.innerHTML+=`<div style="display:flex;justify-content:space-between;background:#111;padding:6px 10px;border-radius:8px;margin-top:5px;font-size:13px"><span>${c.name} x${c.qty}</span><span>KSh ${c.total} <b onclick="cart.splice(${i},1);renderCart()" style="color:#ff5a5a;cursor:pointer;margin-left:8px">✕</b></span></div>`;
 });
 document.getElementById('liveTotal').innerText='KSh '+sum.toLocaleString();
}

function saveReceipt(){
 if(cart.length===0) return alert('Add at least 1 item');
 let type=document.getElementById('type').value;
 let note=document.getElementById('note').value.trim();
 let total=cart.reduce((s,c)=>s+c.total,0);
 let rec={
  id:Date.now(),
  date:new Date().toISOString(),
  day:new Date().toDateString(),
  items:[...cart],
  total,
  type,
  note
 };
 if(type==='spent'){ balance-=total; }else{ balance+=total; }
 receipts.unshift(rec);
 cart=[];
 document.getElementById('note').value='';
 renderCart();
 saveAll();
 setTab('daily', document.querySelector('.tab'));
}

function updateUI(){
 document.getElementById('balance').innerText='KSh '+balance.toLocaleString();
 let todayStr=new Date().toDateString();
 let todayTotal=0, weekTotal=0, itemCount=0;
 let spent=0,income=0,stock=0;
 receipts.forEach(r=>{
  if(r.day===todayStr) todayTotal+= r.type==='income'? r.total : -r.total;
  // simple week = last 7 days
  let d=new Date(r.date);
  if((Date.now()-d.getTime())<7*24*3600*1000) weekTotal+= r.type==='income'? r.total : -r.total;
  r.items.forEach(it=>{ itemCount++; });
  if(r.type==='spent') spent+=r.total; else income+=r.total;
 });
 document.getElementById('chipToday').innerText='KSh '+todayTotal.toLocaleString()+' today';
 document.getElementById('chipWeek').innerText='KSh '+weekTotal.toLocaleString()+' week';
 document.getElementById('chipItems').innerText=itemCount+' items';
 document.getElementById('chipReceipts').innerText=receipts.length+' receipts';
 document.getElementById('statSpent').innerText='KSh '+spent.toLocaleString();
 document.getElementById('statIncome').innerText='KSh '+income.toLocaleString();
 document.getElementById('statStock').innerText='KSh '+balance.toLocaleString();
 document.getElementById('updateText').innerText='Last save: '+new Date().toLocaleTimeString()+' | '+receipts.length+' receipts protected';
 renderTab();
}

function setTab(tab, el){
 currentTab=tab;
 document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
 if(el) el.classList.add('active');
 renderTab();
}

function renderTab(){
 let main=document.getElementById('mainContent');
 if(currentTab==='daily'){
  let groups={};
  receipts.forEach(r=>{ if(!groups[r.day]) groups[r.day]=[]; groups[r.day].push(r); });
  let html='';
  for(let day in groups){
   let dayTotal=groups[day].reduce((s,r)=>s+(r.type==='income'?r.total:-r.total),0);
   html+=`<div style="background:#111;margin:10px;border-radius:12px;padding:10px"><b>${day}</b> <span style="float:right;color:${dayTotal>=0?'#00ff88':'#ff5a5a'}">KSh ${dayTotal.toLocaleString()}</span>`;
   groups[day].forEach(r=>{
    html+=`<div style="font-size:12px;border-top:1px solid #222;padding:5px 0;display:flex;justify-content:space-between"><span>${r.note||r.items.map(i=>i.name).join(', ')} (${r.type})</span><span>KSh ${r.total}</span></div>`;
   });
   html+='</div>';
  }
  main.innerHTML=html||'<p style="text-align:center;color:#555;padding:20px">No sales yet</p>';
 }
 else if(currentTab==='receipts'){
  let html='';
  receipts.forEach(r=>{
   html+=`<div style="background:#111;margin:10px;border-radius:12px;padding:10px"><small style="color:#666">${new Date(r.date).toLocaleString()} | ${r.type}</small><br><b>${r.note||'No note'}</b><br><small>${r.items.map(i=>`${i.name} x${i.qty} = ${i.total}`).join('<br>')}</small><div style="text-align:right;font-weight:800;margin-top:5px">KSh ${r.total.toLocaleString()}</div></div>`;
  });
  main.innerHTML=html||'<p style="text-align:center;color:#555;padding:20px">No receipts</p>';
 }
 else if(currentTab==='items'){
  let all=[];
  receipts.forEach(r=> r.items.forEach(it=> all.push({...it, date:r.date, note:r.note})));
  let html='';
  all.forEach(it=>{
   html+=`<div style="background:#111;margin:6px 10px;border-radius:10px;padding:8px 10px;display:flex;justify-content:space-between;font-size:13px"><span>${it.name} x${it.qty}<br><small style="color:#666">${new Date(it.date).toLocaleDateString()} ${it.note||''}</small></span><span>KSh ${it.total}</span></div>`;
  });
  main.innerHTML=html||'<p style="text-align:center;color:#555;padding:20px">No items</p>';
 }
 else if(currentTab==='updates'){
  main.innerHTML=`<div style="background:#111;margin:10px;border-radius:12px;padding:15px;font-size:13px;color:#ccc"><b>Updates</b><br>✔ Offline support<br>✔ Password lock<br>✔ Paywall KSh 3 to 0707714020<br>✔ Export/Import backup<br>✔ PC install<br>Keep EXPORTING weekly!</div>`;
 }
}

function exportBackup(){
 let data={balance, receipts, date:new Date().toISOString()};
 let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 let url=URL.createObjectURL(blob);
 let a=document.createElement('a'); a.href=url; a.download='MANAGER_backup_'+Date.now()+'.json'; a.click();
}

function importBackup(e){
 let file=e.target.files[0];
 if(!file) return;
 let reader=new FileReader();
 reader.onload=function(ev){
  try{
   let data=JSON.parse(ev.target.result);
   if(data.balance!==undefined) balance=data.balance;
   if(data.receipts) receipts=data.receipts;
   saveAll();
   alert('Backup restored!');
  }catch(err){ alert('Invalid file'); }
 };
 reader.readAsText(file);
}

renderCart();
updateUI();
