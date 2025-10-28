# Menjalankan Server Laravel (php artisan serve)

Panduan singkat dan script untuk menjalankan backend Laravel di proyek ADAProperty pada Windows.

## Prasyarat
- PHP 8.2+ (disarankan 8.3) ter-install dan dapat dieksekusi (`php` ada di PATH)
- Composer ter-install (`composer` ada di PATH)
- SQLite extension aktif (bawaan PHP standar biasanya aktif)

> Catatan: Proyek ini menggunakan SQLite (file di `database/`).

## Jalur Cepat (Direkomendasikan)
Gunakan script PowerShell yang sudah disediakan:

1. Buka PowerShell.
2. Jalankan perintah berikut dari folder repo:
   ```powershell
   cd c:\Users\PC\Documents\GitHub\ADAProperty\backend\laravel-api
   ./run-server.ps1 -Host 127.0.0.1 -Port 8000
   ```

Script akan:
- Memastikan `.env` ada dan otomatis menambahkan `JWT_SECRET` jika belum ada.
- Menjalankan `composer install` jika folder `vendor/` belum ada.
- Menjalankan migrasi database (`php artisan migrate`).
- Mencoba men-seed admin default (`AdminUserSeeder`) bila tersedia.
- Menjalankan server dev Laravel: `http://127.0.0.1:8000/`.

Jika `php` tidak ada di PATH, Anda dapat memberikan lokasi PHP secara eksplisit:
```powershell
./run-server.ps1 -PhpPath "C:\Users\PC\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
```

## Jalur Manual
Jika Anda ingin menjalankan secara manual, ikuti langkah ini:

1. Masuk ke folder Laravel:
   ```powershell
   cd c:\Users\PC\Documents\GitHub\ADAProperty\backend\laravel-api
   ```
2. Install dependencies:
   ```powershell
   composer install
   ```
3. Siapkan `.env`:
   ```powershell
   copy .env.example .env
   ```
   Lalu pastikan baris berikut ada di `.env` (sesuaikan jika perlu):
   ```env
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://localhost
   DB_CONNECTION=sqlite
   ```
   Tambahkan `JWT_SECRET` (gunakan nilai acak):
   ```env
   JWT_SECRET=isi_dengan_nilai_random
   ```
4. Generate key aplikasi:
   ```powershell
   php artisan key:generate
   ```
5. Migrasi dan seeding (opsional, tapi disarankan agar admin default tersedia):
   ```powershell
   php artisan migrate --force
   php artisan db:seed --class=AdminUserSeeder --no-interaction
   ```
6. Jalankan server:
   ```powershell
   php artisan serve --host=127.0.0.1 --port=8000
   ```

## Verifikasi API
- Cek properti:
  ```powershell
  Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/properties"
  ```
- Uji login admin default:
  ```powershell
  $body = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
  Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/auth/login" -ContentType "application/json" -Body $body
  ```
  Respons yang berhasil akan berisi `{ success: true, data: { token, user } }`.

## Integrasi Frontend
- Jalankan dev server frontend dari root repo:
  ```powershell
  npm run dev
  ```
- Pastikan frontend mengarah ke backend:
  - Set `.env` di root proyek:
    ```env
    VITE_API_BASE_URL=http://127.0.0.1:8000/api
    ```
  - Jika `.env` tidak termuat, frontend otomatis fallback ke `http://127.0.0.1:8000/api` saat berjalan di `localhost`.

Setelah login berhasil, token akan disimpan di `localStorage` dan halaman admin (`/admin`) akan aktif untuk tambah/edit/hapus properti.

## Kredensial Default
Jika seeding berhasil:
- Username: `admin`
- Password: `admin123`

## Troubleshooting
- `php` tidak ditemukan: jalankan dengan `-PhpPath` atau tambahkan PHP ke PATH.
- Error 500 saat login: pastikan `JWT_SECRET` sudah ada di `.env` Laravel.
- CORS/HTML response: pastikan base URL frontend adalah `http://127.0.0.1:8000/api`, bukan `/api` saja.
- Gagal migrate: jalankan `composer install`, lalu ulangi `php artisan migrate`.