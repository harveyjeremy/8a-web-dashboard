# Dashboard Kelas (Chrome New Tab)

Website statis murni: HTML + CSS + Vanilla JavaScript. Tanpa build, tanpa instalasi, tanpa backend.
Bisa dibuka langsung dengan klik dua kali `index.html`.

## Yang perlu Anda edit
| Keperluan | File |
|---|---|
| Nama kelas, link Jadwal Kelas, email Gmail kelas | `data/config.js` |
| Jadwal PH / Sumatif | `data/assessments.js` |
| Jam bel, jadwal per hari, hari libur | `data/schedule.js` |

Semua data bertanda `[CONTOH]` / PLACEHOLDER harus diganti dengan data asli.

## Deploy ke GitHub Pages
1. Buat repository baru, upload semua file (index.html harus di root).
2. **Settings > Pages > Build and deployment > Source: Deploy from a branch**, pilih branch `main`, folder `/ (root)`, lalu Save.
3. Alamat: `https://USERNAME.github.io/NAMA-REPO/` (muncul dalam 1-2 menit).

## Menjadikannya Chrome New Tab
- Komputer sekolah yang dikelola Google Admin: kebijakan **New Tab Page URL** (`NewTabPageLocation`) di Admin console.
- Komputer biasa: ekstensi pengalih New Tab (mis. "New Tab Redirect") dengan alamat GitHub Pages Anda.
