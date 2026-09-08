// MY MANAGER - 100% FREE VERSION - NO PAYWALL

// --- CORE DATA ---
let balance = parseFloat(localStorage.getItem('my_manager_balance')) || 0;
let sales = JSON.parse(localStorage.getItem('my_manager_sales') || '[]');

function save(){
  localStorage.setItem('my_manager_balance', balance);
  localStorage.setItem('my_manager_sales', JSON.stringify(sales));
  render();
}

function render(){
  const balEl = document.getElementById('balance');
  if(balEl) balEl.textContent = 'KSh ' + balance.toLocaleString();

  const today = sales.filter(s=> new Date(s.date).toDateString() === new Date().toDateString())
                    .reduce((a,b)=> a+b.amount, 0);
  const week = sales.filter(s=> new Date(s.date) > new Date(Date.now()-7*86400000))
                   .reduce((a,b)=> a+b.amount, 0);

  if(document.getElementById('chipToday')) document.getElementById('chipToday').textContent = 'KSh '+today.toLocaleString()+' today';
  if(document.getElementById('chipWeek')) document.getElementById('chipWeek').textContent = 'KSh '+week.toLocaleString()+' week';
  if(document.getElementById('chipItems')) document.getElementById('chipItems').textContent = sales.length + ' items';
  if(document.getElementById('chipReceipts')) document.getElementById('chipReceipts').textContent = sales.length + ' receipts';
}

// --- BALANCE ---
function editBalance(){
  const newBal = prompt('Enter current cash balance:', balance);
  if(newBal!== null &&!isNaN(newBal)){
    balance = parseFloat(newBal);
    save();
  }
}

// --- EXPORT / IMPORT ---
function exportBackup(){
  const data = {balance, sales, date: new Date().toISOString()};
  const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'MY_MANAGER_backup_'+Date.now()+'.json';
  a.click();
}
function importBackup(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try{
      const data = JSON.parse(ev.target.result);
      balance = data.balance || 0;
      sales = data.sales || [];
      save();
      alert('Backup restored!');
    }catch(err){ alert('Invalid file'); }
  };
  reader.readAsText(file);
}

// --- PASSWORD ---
function setPassword(){
  const p = prompt('Set 4-digit PIN (leave empty to remove):');
  if(p!==null){
    if(p==='') localStorage.removeItem('my_manager_pin');
    else localStorage.setItem('my_manager_pin', p);
    alert(p? 'PIN set!' : 'PIN removed');
  }
}

// --- HELP ---
function openHelp(){
  alert('MY MANAGER HELP\n\n1. Tap balance to edit cash\n2. Add sales to track profit\n3. EXPORT to save data\n4. INSTALL to add to home screen\n5. Works OFFLINE!');
}

// Init
render();
