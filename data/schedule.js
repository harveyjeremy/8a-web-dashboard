/* Jadwal bel sekolah. SEMUA JAM ADALAH PLACEHOLDER: ganti dengan jadwal asli.
   Jam memakai format 24 jam "HH:MM", zona waktu Asia/Jakarta.
   - templates : pola jadwal (boleh tambah, mis. "pendek").
   - week      : pola yang dipakai tiap hari. null = tidak ada kegiatan sekolah.
   - holidays  : tanggal libur khusus (YYYY-MM-DD). */
window.SCHEDULE = {
  templates: {
    regular: [
      { label: 'Bel masuk',                     time: '06:45' },
      { label: 'Istirahat 1',                   time: '09:25' },
      { label: 'Bel masuk setelah istirahat 1', time: '09:55' },
      { label: 'Istirahat 2',                   time: '11:55' },
      { label: 'Bel masuk setelah istirahat 2', time: '12:25' },
      { label: 'Pulang',                        time: '14:25' }
    ],
    friday: [
      { label: 'Bel masuk',                     time: '06:45' },
      { label: 'Istirahat 1',                   time: '09:25' },
      { label: 'Bel masuk setelah istirahat 1', time: '09:55' },
      { label: 'Istirahat 2',                   time: '11:55' },
      { label: 'Bel masuk setelah istirahat 2', time: '12:25' },
      { label: 'Pulang',                        time: '14:25' }
    ]
  },
  week: {
    monday: 'regular', tuesday: 'regular', wednesday: 'regular', thursday: 'regular',
    friday: 'friday', saturday: null, sunday: null
  },
  holidays: [
    { date: '2026-12-25', name: '[CONTOH] Hari libur' }
  ]
};
