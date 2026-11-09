// Ganti dengan URL Web App dari Google Apps Script kamu
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwINQgcLyIgnObggV9N0XhM3NXu6KbqLUlCC1rDWs28oYBwqQ7QLJJriUgbO_z7xejW/exec";

// 1. Ambil Nama Tamu dari URL Parameter ?to=...
function getNamaTamu() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('to') || "Tamu Undangan";
}

// Set Nama di Tampilan & Field Form Input
const namaTamu = getNamaTamu();
document.getElementById('displayNamaTamu').textContent = namaTamu;
document.getElementById('inputNama').value = namaTamu;

// 2. Fetch Daftar Ucapan/Doa dari Google Sheets untuk Credits Jalan
async function loadCreditsDoa() {
  const container = document.getElementById('creditsContainer');
  
  try {
    const res = await fetch(GAS_WEBAPP_URL);
    const result = await res.json();
    
    if (result.status === 'success' && result.data.length > 0) {
      // Susun list ucapan
      const itemsHtml = result.data.map(item => `
        <div class="credit-item">
          <div class="credit-name">${escapeHtml(item.nama)}</div>
          <div class="credit-text">"${escapeHtml(item.doa)}"</div>
        </div>
      `).join('');
      
      // Duplikasi list ucapan agar animasi looping roll credits terlihat mulus tanpa celah
      container.innerHTML = itemsHtml + itemsHtml;
    } else {
      // Fallback default jika sheet masih kosong
      container.innerHTML = `
        <div class="credit-item">
          <div class="credit-name">Keluarga Besar</div>
          <div class="credit-text">"Semoga menjadi pasangan sakinah, mawaddah, warahmah..."</div>
        </div>
      `;
    }
  } catch (err) {
    console.error('Gagal memuat doa:', err);
    container.innerHTML = `<div class="credit-item"><div class="credit-text">Selamat berbahagia Aris & Maya!</div></div>`;
  }
}

// 3. Submit Form RSVP & Doa ke Apps Script
document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = "Mengirim...";

  const payload = {
    nama: document.getElementById('inputNama').value,
    kehadiran: document.getElementById('inputKehadiran').value,
    jumlahTamu: document.getElementById('inputJumlah').value,
    doa: document.getElementById('inputDoa').value
  };

  try {
    await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    alert('Terima kasih! RSVP dan doa Anda telah tersimpan.');
    document.getElementById('inputDoa').value = '';
    loadCreditsDoa(); // Refresh credits ucapan secara instan
  } catch (err) {
    alert('Gagal mengirim konfirmasi, coba lagi.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = "Kirim Konfirmasi & Doa";
  }
});

// Helper XSS Protection
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

// 4. Generator Link WA untuk Admin
function generateWALink() {
  const nama = document.getElementById('genNama').value.trim();
  if (!nama) return alert('Masukkan nama tamu dulu!');
  
  const baseUrl = window.location.origin + window.location.pathname;
  const linkPersonal = `${baseUrl}?to=${encodeURIComponent(nama)}`;
  
  const pesanWA = `Halo ${nama},\n\nKami mengundang Anda untuk hadir di acara pernikahan kami. Detail lengkap & konfirmasi dapat dilihat di link berikut:\n${linkPersonal}\n\nTerima kasih!`;
  
  navigator.clipboard.writeText(pesanWA);
  alert(`Pesan WhatsApp untuk "${nama}" berhasil di-copy ke clipboard! Tinggal paste di WhatsApp.`);
}

// Jalankan load credits saat pertama kali halaman terbuka
document.addEventListener('DOMContentLoaded', loadCreditsDoa);
