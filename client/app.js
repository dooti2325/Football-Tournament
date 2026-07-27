// Configuration for Vercel/Render Deployment
// When deploying, change this to your Render backend URL, e.g., 'https://netaji-api.onrender.com/api'
const CONFIG = {
  API_URL: 'http://localhost:3000/api'
};

const $ = id => document.getElementById(id);
let photoData = null;
let currentRole = 'PLAYER';
let registered = false;

// Set up Admin Download URL
$('adminDownloadBtn').href = CONFIG.API_URL + '/export-csv';

VanillaTilt.init($('playerCard'), { max: 10, speed: 400, glare: true, "max-glare": 0.2 });

// Generate Payment QR code
new QRCode($('paymentQR'), {
  text: "upi://pay?pa=9923088096@upi&pn=Netaji%20Sports%20Club&cu=INR",
  width: 62,
  height: 62,
  colorDark : "#0E1C16",
  colorLight : "#ffffff",
  correctLevel : QRCode.CorrectLevel.L
});

// Deadline check
const checkDeadline = () => {
  const deadline = new Date("August 6, 2026 00:00:00");
  if(new Date() >= deadline) {
    $('formPanel').style.pointerEvents = 'none';
    $('formPanel').style.opacity = '0.6';
    $('submitBtn').disabled = true;
    $('closedBanner').style.display = 'block';
  }
};
checkDeadline();

function calcAge(dobStr){
  if(!dobStr) return null;
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if(m < 0 || (m===0 && today.getDate() < dob.getDate())) age--;
  return age;
}
function fmtDob(dobStr){
  if(!dobStr) return '—';
  const d = new Date(dobStr);
  const opts = {day:'2-digit', month:'short', year:'numeric'};
  return d.toLocaleDateString('en-GB', opts).toUpperCase();
}

function initials(name){
  if(!name) return '?';
  return name.trim().split(/\s+/).slice(0,2).map(w=>w[0].toUpperCase()).join('');
}

function getSelectedPositions() {
  const checks = document.querySelectorAll('.pos-check:checked');
  return Array.from(checks).map(c => c.value);
}

function updateCardLive(){
  const name = $('fName').value.trim();
  const dob = $('fDob').value;
  const positions = getSelectedPositions();
  const posStr = positions.length > 0 ? positions.join(', ').toUpperCase() : 'POSITION';

  $('cardName').textContent = name || 'Your Name';
  $('cardPosition').textContent = posStr;
  $('cardAge').textContent = dob ? calcAge(dob) : '—';
  $('cardDob').textContent = fmtDob(dob);

  const photoEl = $('cardPhoto');
  if(photoData){
    photoEl.innerHTML = `<img src="${photoData}">`;
  } else {
    photoEl.innerHTML = initials(name);
  }

  $('cardRoleBadge').textContent = currentRole;
  $('cardRoleBadge').className = 'role-badge ' + currentRole;
}

$('fName').addEventListener('input', (e) => { e.target.classList.remove('input-error'); updateCardLive(); });
$('fDob').addEventListener('input', (e) => { e.target.classList.remove('input-error'); updateCardLive(); });
document.querySelectorAll('.pos-check').forEach(c => {
  c.addEventListener('change', () => {
    document.querySelectorAll('.pos-check').forEach(x => x.parentElement.style.color = 'var(--ink)');
    updateCardLive();
  });
});
$('fPhone').addEventListener('input', (e) => { e.target.classList.remove('input-error'); });

document.querySelectorAll('.role-opt').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelectorAll('.role-opt').forEach(o=>o.classList.remove('active'));
    el.classList.add('active');
    currentRole = el.dataset.role;
    updateCardLive();
  });
});

$('photoPick').addEventListener('click', ()=> $('photoInput').click());
$('photoBtn').addEventListener('click', ()=> $('photoInput').click());
$('photoInput').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    photoData = reader.result;
    $('photoPick').innerHTML = `<img src="${photoData}">`;
    updateCardLive();
  };
  reader.readAsDataURL(file);
});

async function loadHistory() {
  try {
    const statsRes = await fetch(`${CONFIG.API_URL}/stats`);
    const stats = await statsRes.json();
    $('statTotal').textContent = stats.totalRegistrations || 0;
  } catch(e) {
    console.warn('Backend not running?', e);
  }

  const list = $('historyList');
  list.innerHTML = '';
  const records = [];
  for(let i=0; i<localStorage.length; i++) {
    const key = localStorage.key(i);
    if(key.startsWith('reg_')) {
      try { records.push(JSON.parse(localStorage.getItem(key))); } catch(e){}
    }
  }
  records.sort((a,b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  
  records.forEach(r => {
    const el = document.createElement('div');
    el.className = 'history-item';
    let avatar = r.photo ? `<img src="${r.photo}">` : initials(r.name);
    let posDisp = Array.isArray(r.positions) ? r.positions.join(', ') : (r.position || 'N/A');
    el.innerHTML = `
      <div class="hist-avatar">${avatar}</div>
      <div class="hist-details">
        <div class="hist-name">${r.name}</div>
        <div class="hist-meta">${r.serial} · ${posDisp} · ${r.role}</div>
      </div>
    `;
    list.appendChild(el);
  });
}

loadHistory();

$('submitBtn').addEventListener('click', async ()=>{
  const name = $('fName').value.trim();
  const dob = $('fDob').value;
  const positions = getSelectedPositions();
  const phone = $('fPhone').value.trim();
  const errEl = $('formError');

  const inputs = [$('fName'), $('fDob'), $('fPhone')];
  inputs.forEach(i => i.classList.remove('input-error'));
  
  let hasError = false;
  if(!name) { $('fName').classList.add('input-error'); hasError = true; }
  if(!dob) { $('fDob').classList.add('input-error'); hasError = true; }
  if(positions.length === 0) { 
    document.querySelectorAll('.pos-check').forEach(x => x.parentElement.style.color = 'var(--red)');
    hasError = true; 
  }
  if(!phone) { $('fPhone').classList.add('input-error'); hasError = true; }

  if(hasError){
    errEl.textContent = 'Please fill all required fields highlighted in red.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  $('submitBtn').disabled = true;
  $('submitBtn').textContent = 'Registering with server…';

  const id = 'reg_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  const registeredAt = new Date().toISOString();

  const record = {
    id, name, dob, positions, role: currentRole, phone,
    photo: photoData, registeredAt
  };

  let serial = 'AC-XXXX';
  try {
    const res = await fetch(`${CONFIG.API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if(!res.ok) throw new Error('Backend failed');
    const data = await res.json();
    serial = data.serial;
  } catch(err) {
    console.error(err);
    alert('Could not connect to live database. Make sure the server is running. Saving locally anyway.');
    serial = 'AC-' + String(Math.floor(Math.random()*9999)).padStart(4,'0');
  }

  record.serial = serial;
  localStorage.setItem(id, JSON.stringify(record));
  await loadHistory();

  $('cardSerial').textContent = 'SERIAL · ' + serial;
  $('successSerial').textContent = serial;
  $('successStrip').style.display = 'block';
  $('cardHint').textContent = 'Registered! Tap "Download card" to save your matchday pass.';
  $('downloadBtn').disabled = false;
  $('resetBtn').disabled = false;
  $('submitBtn').textContent = 'Registered ✓';
  registered = true;

  $('qrcode').innerHTML = '';
  new QRCode($('qrcode'), {
    text: "ID: " + serial + "\nName: " + name + "\nPos: " + positions.join(','),
    width: 36,
    height: 36,
    colorDark : "#0E1C16",
    colorLight : "#F6F3EA",
    correctLevel : QRCode.CorrectLevel.L
  });

  document.querySelectorAll('#fName,#fDob,#fPhone,#photoPick,#photoBtn,.role-opt,.pos-check').forEach(el=>{
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.7';
  });
});

$('resetBtn').addEventListener('click', ()=>{
  $('fName').value=''; $('fDob').value=''; $('fPhone').value='';
  document.querySelectorAll('.pos-check').forEach(c => c.checked = false);
  photoData = null;
  $('photoPick').innerHTML = '<span>ADD<br>PHOTO</span>';
  currentRole = 'PLAYER';
  document.querySelectorAll('.role-opt').forEach(o=>o.classList.remove('active'));
  document.querySelector('.role-opt[data-role="PLAYER"]').classList.add('active');
  $('successStrip').style.display = 'none';
  $('cardHint').textContent = 'Fill the form — your card updates live as you type.';
  $('downloadBtn').disabled = true;
  $('resetBtn').disabled = true;
  $('submitBtn').disabled = false;
  $('submitBtn').textContent = 'Register & generate card';
  registered = false;
  $('qrcode').innerHTML = '';
  
  document.querySelectorAll('#fName,#fDob,#fPhone,#photoPick,#photoBtn,.role-opt,.pos-check').forEach(el=>{
    el.style.pointerEvents = 'auto';
    el.style.opacity = '1';
  });
  updateCardLive();
});

$('downloadBtn').addEventListener('click', ()=>{
  if(!registered) return;
  if($('playerCard').vanillaTilt) $('playerCard').vanillaTilt.destroy();
  $('playerCard').style.transform = 'none';
  
  setTimeout(() => {
    html2canvas($('playerCard'), {backgroundColor:null, scale:3}).then(canvas=>{
      const link = document.createElement('a');
      link.download = ($('cardName').textContent.replace(/\s+/g,'_') || 'player') + '_matchday_card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      VanillaTilt.init($('playerCard'), { max: 10, speed: 400, glare: true, "max-glare": 0.2 });
    });
  }, 50);
});

updateCardLive();
