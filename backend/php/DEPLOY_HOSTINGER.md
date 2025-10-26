# Deploy ke Hostinger Shared Hosting (PHP + MySQL)

Langkah ini menyiapkan backend PHP + MySQL agar proyek bisa jalan di shared hosting Hostinger. Frontend (Vite/React) akan di-deploy sebagai static site.

## 1) Siapkan MySQL
- Masuk ke cPanel Hostinger → MySQL Databases → buat database dan user.
- Catat: `DB_HOST=localhost`, `DB_NAME`, `DB_USER`, `DB_PASS`.
- Buka phpMyAdmin → pilih database → import file `backend/php/sql/schema.sql` untuk membuat tabel.

## 2) Konfigurasi Backend PHP
- Buat folder `public_html/api/` di hosting.
- Upload file/folder berikut ke `public_html/api/`:
  - `index.php` dari `backend/php/api/index.php`
  - `.htaccess` dari `backend/php/api/.htaccess`
  - `../config.php`
  - `../db.php`
  - `../utils/jwt.php`
  - `../utils/utils.php`
- Upload `backend/php/.env.php.example` sebagai `.env.php` (rename) ke folder yang sama dengan `config.php`, lalu edit isinya:
  ```php
  $_ENV = [
    'APP_ENV' => 'production',
    'TIMEZONE' => 'Asia/Jakarta',
    'CORS_ORIGIN' => 'https://yourdomain.com',
    'DB_HOST' => 'localhost',
    'DB_PORT' => '3306',
    'DB_NAME' => 'uXXXXXX_db',
    'DB_USER' => 'uXXXXXX_user',
    'DB_PASS' => 'your_password',
    'JWT_SECRET' => 'long_random_secret_here',
    'JWT_EXPIRE_SECONDS' => '604800',
    'ADMIN_USERNAME' => 'admin',
    'ADMIN_PASSWORD' => 'change_me',
    'ADMIN_EMAIL' => 'admin@yourdomain.com',
  ];
  ```
- Saat `index.php` dipanggil pertama kali, backend otomatis memastikan tabel ada dan membuat admin default jika belum ada.

## 3) Deploy Frontend
- Di lokal: `npm install && npm run build` → hasil build ada di folder `dist/`.
- Upload seluruh isi `dist/` ke `public_html/`.
- Letakkan file `.htaccess` untuk SPA di `public_html/` (gunakan `backend/php/spa.htaccess`), agar semua route diarahkan ke `index.html`:
  ```apache
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
  ```

## 4) Konfigurasi Frontend API URL
- Frontend sekarang default ke `'/api'`. Jika frontend dan backend berada di domain yang sama, tidak perlu mengubah apa pun.
- Jika ingin eksplisit, buat file `.env` di proyek frontend sebelum build:
  ```
  VITE_API_BASE_URL=/api
  ```
- Atau jika backend berada di subdomain lain, isi dengan URL penuh:
  ```
  VITE_API_BASE_URL=https://api.yourdomain.com
  ```

## 5) Uji Coba
- Buka `https://yourdomain.com/api/health` → harus tampil `{ success: true, status: 'OK' }`.
- Login admin: `POST https://yourdomain.com/api/auth/login` dengan body JSON `{ "username": "admin", "password": "..." }`.
- Setelah login, frontend akan menyimpan token dan bisa create/update/delete properti.

## 6) Catatan Keamanan
- Ganti `JWT_SECRET` dengan string panjang acak.
- Ganti `ADMIN_PASSWORD` default segera setelah deploy (atau pakai endpoint `POST /api/admin/change-credentials`).
- Set `CORS_ORIGIN` ke domain situs Anda, bukan `*`, jika backend dipakai lintas origin.

## 7) Endpoint yang Tersedia
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/verify`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/properties` (+ filter: `type,status,location,subLocation,bedrooms,bathrooms,minPrice,maxPrice,sort`)
- `GET /api/properties/:id`
- `POST /api/properties` (admin)
- `PUT /api/properties/:id` (admin)
- `DELETE /api/properties/:id` (admin)
- `POST /api/admin/change-credentials` (admin)

Selesai—frontend React Anda akan berjalan di Hostinger, dan backend PHP + MySQL menangani API sesuai kebutuhan aplikasi.