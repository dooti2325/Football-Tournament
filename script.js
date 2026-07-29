'use strict';

/* ─── DOM helper ─── */
const $ = id => document.getElementById(id);

/* ─── State ─── */
let photoData = null;
let currentRole = 'PLAYER';
let registered = false;

/* ─── Tilt on card ─── */
VanillaTilt.init($('playerCard'), { max: 10, speed: 400, glare: true, 'max-glare': 0.18 });

/* ─── Payment QR ─── */
new QRCode($('paymentQR'), {
  text: 'upi://pay?pa=9923088096@upi&pn=Netaji%20Sports%20Club&cu=INR',
  width: 64,
  height: 64,
  colorDark: '#0E1C16',
  colorLight: '#ffffff',
  correctLevel: QRCode.CorrectLevel.L
});

/* ─── Deadline check ─── */
(function checkDeadline() {
  const deadline = new Date('August 6, 2026 00:00:00');
  if (new Date() >= deadline) {
    $('formPanel').style.pointerEvents = 'none';
    $('formPanel').style.opacity = '0.6';
    $('submitBtn').disabled = true;
    $('closedBanner').style.display = 'block';
  }
})();

/* ─── Utilities ─── */
function calcAge(dobStr) {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function fmtDob(dobStr) {
  if (!dobStr) return '—';
  const d = new Date(dobStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function getSelectedPositions() {
  return Array.from(document.querySelectorAll('.pos-check:checked')).map(c => c.value);
}

function setCardPhoto(dataUrl) {
  const el = $('cardPhoto');
  if (dataUrl) {
    el.style.backgroundImage = `url(${dataUrl})`;
    el.textContent = '';
  } else {
    el.style.backgroundImage = 'none';
  }
}

/* ─── Live card update ─── */
function updateCardLive() {
  const name = $('fName').value.trim();
  const dob = $('fDob').value;
  const positions = getSelectedPositions();
  const posStr = positions.length > 0 ? positions.join(', ').toUpperCase() : 'POSITION';

  $('cardName').textContent = name || 'Your Name';
  $('cardPosition').textContent = posStr;
  $('cardAge').textContent = dob ? calcAge(dob) : '—';
  $('cardDob').textContent = fmtDob(dob);
  $('cardRoleBadge').textContent = currentRole;
  $('cardRoleBadge').className = 'role-badge ' + currentRole;

  if (photoData) {
    setCardPhoto(photoData);
  } else {
    $('cardPhoto').style.backgroundImage = 'none';
    $('cardPhoto').textContent = initials(name) || '?';
  }
}

/* ─── Input listeners ─── */
$('fName').addEventListener('input', e => { e.target.classList.remove('input-error'); updateCardLive(); });
$('fDob').addEventListener('input', e => { e.target.classList.remove('input-error'); updateCardLive(); });
$('fPhone').addEventListener('input', e => { e.target.classList.remove('input-error'); });

document.querySelectorAll('.pos-check').forEach(c => {
  c.addEventListener('change', () => {
    document.querySelectorAll('.pos-label').forEach(l => l.style.color = '');
    updateCardLive();
  });
});

document.querySelectorAll('.role-opt').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.role-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    currentRole = el.dataset.role;
    updateCardLive();
  });
});

/* ─── Photo upload with compression ─── */
$('photoPick').addEventListener('click', () => $('photoInput').click());
$('photoBtn').addEventListener('click', () => $('photoInput').click());

$('photoInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    const img = new Image();
    img.onload = () => {
      const MAX = 400;
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
      else { if (h > MAX) { w = w * MAX / h; h = MAX; } }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      photoData = canvas.toDataURL('image/jpeg', 0.72);
      // Show compressed preview in the circle (as background-image for correct crop)
      $('photoPick').style.backgroundImage = `url(${photoData})`;
      $('photoPick').innerHTML = '';
      $('photoPick').style.borderStyle = 'solid';
      $('photoPick').style.borderColor = 'var(--pitch)';
      updateCardLive();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

/* ─── API base URL ─── */
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
const apiBase = isLocal ? 'http://localhost:3000/api' : '/api';

/* ─── Load registration history ─── */
async function loadHistory() {
  try {
    const [statsRes, regRes] = await Promise.all([
      fetch(`${apiBase}/stats`),
      fetch(`${apiBase}/registrations`)
    ]);

    if (statsRes.ok) {
      const stats = await statsRes.json();
      $('statTotal').textContent = stats.totalRegistrations || 0;
    }

    if (regRes.ok) {
      const records = await regRes.json();
      renderList(records);
      return;
    }
  } catch (e) {
    console.warn('Backend unavailable, falling back to localStorage:', e);
  }

  // Fallback: localStorage
  const records = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('reg_')) {
      try { records.push(JSON.parse(localStorage.getItem(key))); } catch (e) { }
    }
  }
  records.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  renderList(records);
}

function parsePosStr(r) {
  if (Array.isArray(r.positions)) return r.positions.join(', ');
  if (typeof r.positions === 'string') {
    try { return JSON.parse(r.positions).join(', '); } catch (e) { return r.positions; }
  }
  if (r.position) return r.position;
  return 'N/A';
}

function renderList(records) {
  const list = $('historyList');
  list.innerHTML = '';

  if (!records || records.length === 0) {
    list.innerHTML = '<div style="padding:20px; text-align:center; font-family:\'Space Mono\',monospace; font-size:12px; color:#8a8370;">No registrations yet. Be the first!</div>';
    return;
  }

  records.forEach(r => {
    const el = document.createElement('div');
    el.className = 'history-item';
    const pos = parsePosStr(r);
    el.innerHTML = `
      <div class="hist-avatar">${initials(r.name)}</div>
      <div class="hist-details">
        <div class="hist-name">${r.name || 'Unknown'}</div>
        <div class="hist-meta">${r.serial || '—'} · ${pos} · ${r.role || 'PLAYER'}</div>
      </div>
      <button class="hist-download" title="Download matchday card for ${r.name}" aria-label="Download card for ${r.name}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    `;
    list.appendChild(el);
    el.querySelector('.hist-download').addEventListener('click', () => downloadAdminCard(r));
  });
}

loadHistory();

/* ─── Registration submit ─── */
$('submitBtn').addEventListener('click', async () => {
  const name = $('fName').value.trim();
  const dob = $('fDob').value;
  const positions = getSelectedPositions();
  const phone = $('fPhone').value.trim();
  const errEl = $('formError');

  // Reset errors
  [$('fName'), $('fDob'), $('fPhone')].forEach(i => i.classList.remove('input-error'));
  $('photoPick').style.borderColor = '#b9b19a';
  $('photoPick').style.borderStyle = photoData ? 'solid' : 'dashed';
  document.querySelectorAll('.pos-label').forEach(l => l.style.color = '');

  let hasError = false;
  if (!name) { $('fName').classList.add('input-error'); hasError = true; }
  if (!dob) { $('fDob').classList.add('input-error'); hasError = true; }
  if (positions.length === 0) {
    document.querySelectorAll('.pos-label').forEach(l => l.style.color = 'var(--red)');
    hasError = true;
  }
  if (!phone) { $('fPhone').classList.add('input-error'); hasError = true; }
  if (!photoData) { $('photoPick').style.borderColor = 'var(--red)'; $('photoPick').style.borderStyle = 'solid'; hasError = true; }

  if (hasError) {
    errEl.textContent = 'Please fill all required fields (marked with *).';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  $('submitBtn').disabled = true;
  $('submitBtn').textContent = 'Registering with server…';

  const id = 'reg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const registeredAt = new Date().toISOString();
  const record = { id, name, dob, positions, role: currentRole, phone, photo: photoData, registeredAt };

  let serial = 'AC-' + String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  try {
    const res = await fetch(`${apiBase}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 409) {
        // Duplicate registration — show inline error, stop process
        errEl.textContent = '⚠ ' + (errData.message || 'This phone number is already registered.');
        errEl.style.display = 'block';
        $('submitBtn').disabled = false;
        $('submitBtn').textContent = 'Register & Generate Card';
        return;
      }
      throw new Error(errData.details || errData.error || `Server error ${res.status}`);
    }
    const data = await res.json();
    serial = data.serial;
  } catch (err) {
    console.error('Registration error:', err);
    alert('⚠ Could not save to database:\n' + err.message + '\n\nA temporary ID has been assigned. Check Supabase env vars in Render dashboard.');
  }

  record.serial = serial;
  localStorage.setItem(id, JSON.stringify(record));
  await loadHistory();

  // Update card
  $('cardSerial').textContent = 'SERIAL · ' + serial;
  $('successSerial').textContent = serial;
  $('successStrip').style.display = 'block';
  $('cardHint').textContent = 'Registered! ✓ Tap "Download Card" to save your matchday pass.';
  $('downloadBtn').disabled = false;
  $('resetBtn').disabled = false;
  $('submitBtn').textContent = 'Registered ✓';
  registered = true;

  // Lock form inputs
  document.querySelectorAll('#fName,#fDob,#fPhone,#photoPick,#photoBtn,.role-opt,.pos-check,.pos-label').forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.65';
  });
});

/* ─── Reset button ─── */
$('resetBtn').addEventListener('click', () => {
  $('fName').value = '';
  $('fDob').value = '';
  $('fPhone').value = '';
  document.querySelectorAll('.pos-check').forEach(c => c.checked = false);
  photoData = null;
  $('photoPick').style.backgroundImage = 'none';
  $('photoPick').style.borderColor = '#b9b19a';
  $('photoPick').style.borderStyle = 'dashed';
  $('photoPick').innerHTML = '<span>ADD<br>PHOTO</span>';
  currentRole = 'PLAYER';
  document.querySelectorAll('.role-opt').forEach(o => o.classList.remove('active'));
  document.querySelector('.role-opt[data-role="PLAYER"]').classList.add('active');
  $('successStrip').style.display = 'none';
  $('cardHint').textContent = 'Fill the form — your card updates live as you type.';
  $('downloadBtn').disabled = true;
  $('resetBtn').disabled = true;
  $('submitBtn').disabled = false;
  $('submitBtn').textContent = 'Register & Generate Card';
  registered = false;
  $('qrcode').innerHTML = '';
  $('cardSerial').textContent = 'SERIAL · AC-XXXX';

  document.querySelectorAll('#fName,#fDob,#fPhone,#photoPick,#photoBtn,.role-opt,.pos-check,.pos-label').forEach(el => {
    el.style.pointerEvents = 'auto';
    el.style.opacity = '1';
  });
  updateCardLive();
});

/* ─── Download own card ─── */
$('downloadBtn').addEventListener('click', () => {
  if (!registered) return;
  captureAndDownload($('cardName').textContent);
});

/* ─── Admin card download ─── */
function downloadAdminCard(r) {
  const pos = parsePosStr(r);
  const prevRegistered = registered;

  // Temporarily fill card with this player's data
  $('cardName').textContent = r.name || 'Unknown';
  $('cardPosition').textContent = pos ? pos.toUpperCase() : 'POSITION';

  // Use dob from the database record if available
  if (r.dob) {
    $('cardAge').textContent = calcAge(r.dob) !== null ? String(calcAge(r.dob)) : '—';
    $('cardDob').textContent = fmtDob(r.dob);
  } else {
    $('cardAge').textContent = '—';
    $('cardDob').textContent = '—';
  }

  $('cardRoleBadge').textContent = r.role || 'PLAYER';
  $('cardRoleBadge').className = 'role-badge ' + (r.role || 'PLAYER');
  $('cardSerial').textContent = 'SERIAL · ' + (r.serial || '—');
  $('cardPhoto').style.backgroundImage = 'none';
  $('cardPhoto').textContent = initials(r.name);

  captureAndDownload(r.name, () => {
    // After download, restore the original state
    if (!prevRegistered) {
      updateCardLive();
      $('cardSerial').textContent = 'SERIAL · AC-XXXX';
    }
  });
}


/* ─── Shared capture + download ─── */
function captureAndDownload(playerName, callback) {
  if ($('playerCard').vanillaTilt) $('playerCard').vanillaTilt.destroy();
  $('playerCard').style.transform = 'none';

  setTimeout(() => {
    html2canvas($('playerCard'), { backgroundColor: null, scale: 3, useCORS: true }).then(canvas => {
      const link = document.createElement('a');
      const safeName = (playerName || 'player').replace(/\s+/g, '_');
      link.download = safeName + '_matchday_card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      VanillaTilt.init($('playerCard'), { max: 10, speed: 400, glare: true, 'max-glare': 0.18 });
      if (callback) callback();
    });
  }, 60);
}

/* ─── Initial render ─── */
updateCardLive();