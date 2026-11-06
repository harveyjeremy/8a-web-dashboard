/* Jadwal PH dan Asesmen Sumatif.
   Semua data di bawah adalah PLACEHOLDER. Ganti dengan jadwal asli.
   type: "PH" atau "Sumatif". Format tanggal: YYYY-MM-DD.
   (Memakai file .js, bukan .json, karena browser memblokir fetch() file lokal
   saat index.html dibuka langsung. Strukturnya sama dengan JSON.) */
window.ASSESSMENTS = [
  { date: '2026-11-10', subject: 'Matematika', type: 'PH',      description: '[CONTOH] Materi SPLDV', placeholder: true },
  { date: '2026-11-12', subject: 'IPA',        type: 'PH',      description: '[CONTOH] Ganti dengan materi asli', placeholder: true },
  { date: '2026-11-17', subject: 'IPA',        type: 'Sumatif', description: '[CONTOH] Ganti dengan materi asli', placeholder: true },
  { date: '2026-11-24', subject: 'Matematika', type: 'Sumatif', description: '[CONTOH] Ganti dengan materi asli', placeholder: true }
];
