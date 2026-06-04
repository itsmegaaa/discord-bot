# TASK: Deep Codebase Bug Scan + Fix

Lu adalah coding agent senior. Tugas lu: lakukan deep scan ke seluruh codebase ini, temukan bug, error, edge case, struktur yang rapuh, dan perbaiki langsung dengan patch yang aman.

## Tujuan utama
1. Pahami dulu struktur project secara menyeluruh.
2. Deteksi stack/framework yang dipakai.
3. Jalankan pemeriksaan lengkap: install dependency jika perlu, lint, analyze/typecheck, test, build, dan pemeriksaan runtime yang relevan.
4. Temukan bug nyata, bukan cuma style issue receh.
5. Perbaiki bug dengan perubahan minimal, aman, dan sesuai pola existing codebase.
6. Validasi ulang setelah perbaikan sampai hasilnya bersih atau jelaskan blocker secara jujur.

## Cara kerja wajib

### 1. Repository reconnaissance
Sebelum edit file apa pun:
- Baca struktur folder utama.
- Identifikasi bahasa, framework, package manager, dan entry point aplikasi.
- Cari file konfigurasi penting seperti:
  - package.json / pubspec.yaml / requirements.txt / composer.json / go.mod
  - tsconfig / eslint / analysis_options.yaml
  - firebase config
  - env example
  - CI config
  - test config
- Buat ringkasan singkat: project ini apa, stack-nya apa, dan bagian mana yang rawan bug.

### 2. Jalankan diagnosis
Jalankan command yang sesuai dengan project ini.

Jika Flutter/Dart:
- flutter pub get
- dart analyze atau flutter analyze
- dart format --set-exit-if-changed . hanya untuk cek, jangan format massal kecuali perlu
- flutter test jika tersedia
- flutter build web atau build target yang relevan jika aman

Jika Node/React/Next/Vite:
- npm install / npm ci sesuai lockfile
- npm run lint jika ada
- npm run typecheck jika ada
- npm test jika ada
- npm run build jika ada

Jika stack lain, pilih command yang paling aman dan relevan.

Catat semua error, warning penting, failed test, dan build failure.

### 3. Deep scan area wajib
Periksa semua area berikut:

#### Logic bug
- Kondisi if/else yang salah
- State yang tidak sinkron
- Race condition
- Function yang tidak pernah dipanggil
- Return value salah
- Null/undefined/null safety issue
- Parsing data yang rawan crash
- Date/time handling yang rawan salah
- Error handling yang hilang

#### Data & API
- Mapping model yang salah
- Field typo
- Response API tidak divalidasi
- Query database/firestore yang rawan gagal
- Pagination/filter/search yang tidak konsisten
- Local storage/cache yang bisa stale
- Upload/download file yang tidak aman atau tidak lengkap

#### Auth & Permission
- Role check bocor
- Admin/staff/user permission tidak konsisten
- Route/page yang bisa diakses tanpa auth
- Session handling lemah
- Logout tidak membersihkan state

#### UI Runtime Bug
- Widget/component yang bisa overflow
- State update setelah dispose/unmount
- Loading/error/empty state hilang
- Form validation kurang
- Button double submit
- Navigation broken
- Responsive layout kacau

#### Security hygiene
- Secret/API key hardcoded
- Env tidak dipakai dengan benar
- Input user tidak divalidasi
- File upload terlalu bebas
- Rule Firebase/storage lemah jika ada
- Logging data sensitif

#### Maintainability yang berdampak bug
- Duplicate logic yang bisa bikin data beda
- Dead code yang bikin bingung
- Naming misleading
- Dependency deprecated yang bikin build risk
- Config tidak konsisten antar environment

### 4. Prioritaskan bug
Klasifikasikan temuan:
- CRITICAL: aplikasi crash, auth bocor, data rusak/hilang, build gagal
- HIGH: fitur utama rusak atau security risk
- MEDIUM: edge case penting, UX error, state bug
- LOW: warning minor, cleanup, typo non-fatal

Jangan buang waktu buat style issue receh kecuali memang menyebabkan bug.

### 5. Perbaikan
Untuk setiap bug yang diperbaiki:
- Jelaskan akar masalahnya.
- Edit file yang diperlukan saja.
- Jangan rewrite total project.
- Jangan ubah desain besar, arsitektur besar, atau flow bisnis kecuali memang wajib.
- Jangan menghapus fitur existing.
- Jangan mengganti dependency besar tanpa alasan kuat.
- Jangan format seluruh repo kalau tidak diperlukan.
- Ikuti style dan pola kode yang sudah ada.

### 6. Tambahkan test bila masuk akal
Jika project punya test setup:
- Tambahkan test untuk bug yang diperbaiki.
- Minimal tambahkan smoke test atau unit test untuk logic penting.
- Jangan bikin test palsu yang cuma ngejar hijau tapi tidak ngetes behavior asli.

### 7. Validasi ulang
Setelah patch:
- Jalankan ulang lint/analyze/typecheck.
- Jalankan ulang test.
- Jalankan build jika memungkinkan.
- Pastikan error awal sudah hilang.
- Jika masih ada error, lanjut fix sampai bersih.
- Jika ada blocker external, jelaskan secara spesifik: command apa, error apa, file mana, dan kenapa tidak bisa lanjut.

### 8. Output akhir wajib
Berikan laporan akhir dalam format ini:

## Ringkasan
- Stack terdeteksi:
- Command yang dijalankan:
- Status akhir:

## Bug ditemukan & diperbaiki
Untuk setiap bug:
1. Severity:
2. File:
3. Masalah:
4. Penyebab:
5. Perbaikan:
6. Validasi:

## Bug/risiko yang belum diperbaiki
Jika ada:
1. Severity:
2. File:
3. Masalah:
4. Alasan belum diperbaiki:
5. Rekomendasi next step:

## File yang diubah
- path/file.ext: ringkasan perubahan

## Validasi
- Lint/analyze:
- Test:
- Build:
- Catatan:

## Batasan
Jangan klaim “semua aman” kalau belum menjalankan test/build/analyze. Kalau ada command gagal karena dependency, permission, env, atau konfigurasi, tulis jujur dan detail. Jangan halu.

# TASK: Second-Pass Bug Hunt After Fixes
Lakukan audit ulang setelah perbaikan sebelumnya. Anggap patch awal masih mungkin menyisakan bug.

Fokus:
1. Cari regression dari perubahan sebelumnya.
2. Cari bug yang muncul dari interaction antar module.
3. Review semua file yang baru diedit.
4. Pastikan tidak ada behavior existing yang rusak.
5. Jalankan ulang lint/typecheck/test/build.
6. Cari celah auth, permission, data consistency, dan runtime crash.

Jangan menambah fitur baru. Jangan refactor besar. Tugas lu cuma memastikan codebase stabil, aman, dan buildable.

Output:
- Regression found:
- Additional bugs fixed:
- Commands run:
- Final status:
- Remaining risks: