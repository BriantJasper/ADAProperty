# ADAProperty (React + TypeScript + Vite)

Aplikasi katalog properti dengan Admin Panel, komparasi properti (max 3), WhatsApp integration, filter pencarian, dan titip jual properti.

## Menjalankan

1. Install dependency: `npm install`
2. Jalankan dev server: `npm run dev`
3. Buka `http://localhost:5173`

## Fitur Utama

- **Admin Panel** (CRUD properti, kelola inbox titip jual)
- **Komparasi properti** (maksimal 3 properti)
- **Tombol WhatsApp** dengan pesan otomatis
- **Filter Lokasi + Sub‑lokasi** (otomatis dari data)
- **Search Bar** untuk mencari properti (judul, lokasi, tipe, status)
- **Filter tambahan**: Status, Tipe, Price Min/Max
- **Titip Jual** - Pengguna dapat mengajukan properti untuk dijual
- **Inbox Titip Jual** - Admin dapat meninjau pengajuan dengan:
  - Collapsible section
  - Download gambar properti (single/zip)
  - Kontak langsung via WhatsApp/Email
- **Persistensi data** via localStorage & backend API

## Arsitektur & State

- Global state di `src/context/AppContext.tsx`:
  - `properties`, `comparisonCart`, `isAdminMode`, `isAuthenticated`, `user`, `selectedLocation`, `consignmentInbox`
  - Actions: CRUD, comparison add/remove/clear, `LOGIN/LOGOUT`, `SET_SELECTED_LOCATION`, `LOAD_PROPERTIES`, `LOAD_CONSIGNMENTS`, `REMOVE_CONSIGNMENT`
  - Persist ke `localStorage`

## Routes

- `/` Home (hero + Popular Section)
- `/properties` Daftar Properti + panel filter + search bar + sub‑lokasi
- `/comparison` Halaman komparasi keranjang (max 3)
- `/admin` Admin Panel (protected) - Dashboard, Inbox Titip Jual, Kelola Properti
- `/about` Tentang Kami
- `/contact` Kontak Kami
- `/consign` Titip Jual - Form pengajuan properti dari pengguna

> Navbar otomatis solid putih di `/admin`, `/about`, `/comparison`, `/contact`, `/consign`.

## Login Admin (Demo)

Username: `admin`  
Password: `admin123`

## Menjalankan Kedua Server (Frontend + Backend)

- Prasyarat:
  - `Node.js` 18+ dan `npm`
  - `PHP` 8.2+ dan `composer`
- Jalankan Backend (Laravel):
  - `cd backend/laravel-api`
  - `./run-server.ps1 -Host 127.0.0.1 -Port 8000`
  - Alternatif manual: `composer install` → siapkan `.env` + `JWT_SECRET` → `php artisan key:generate` → `php artisan migrate --force` → `php artisan serve --host=127.0.0.1 --port=8000`
- Jalankan Frontend (Vite):
  - Dari root repo: `npm install` lalu `npm run dev`
  - Buka `http://localhost:5173/` (atau port berikutnya jika 5173 sedang dipakai, misal `5174`)
- Konfigurasi API Frontend:
  - Default: saat dev di `localhost`, frontend otomatis fallback ke `http://127.0.0.1:8000/api`
  - Opsi eksplisit: set di `.env` root → `VITE_API_BASE_URL=http://127.0.0.1:8000/api`
- Verifikasi cepat:
  - Login admin: `admin` / `admin123`
  - Cek DevTools → `POST /api/auth/login` mengembalikan 200 dengan JSON `{ success: true, data: { token, user } }`

## Struktur Penting

- `src/components/PropertyCard.tsx` — kartu properti + WA + compare + admin controls
- `src/components/ComparisonCart.tsx` — keranjang komparasi
- `src/components/PropertyForm.tsx` — form tambah/edit properti
- `src/components/SearchBar.tsx` — komponen search bar yang reusable
- `src/components/Navbar.tsx` — navbar adaptif (transparan/solid)
- `src/pages/PropertiesPage.tsx` — halaman daftar properti + filter + search bar + sub‑lokasi
- `src/pages/AdminPanel.tsx` — dashboard admin, inbox titip jual, kelola properti
- `src/pages/ConsignPage.tsx` — form pengajuan titip jual
- `src/pages/ContactPage.tsx` — halaman kontak
- `src/pages/About.tsx` — halaman tentang + anggota

## Fitur Admin Panel

1. **Dashboard Stats** - Total properti dan jumlah dalam komparasi
2. **Inbox Titip Jual** (Collapsible):
   - Lihat semua pengajuan titip jual dari pengguna
   - Download foto properti (single/multiple sebagai ZIP)
   - Kontak penjual via WhatsApp atau Email
   - Hapus pengajuan yang sudah ditindaklanjuti
3. **Search Bar** - Cari properti dengan cepat
4. **Kelola Properti** - Tambah, edit, hapus properti
5. **Ubah Kredensial** - Ganti username dan password admin
6. **Komparasi Cart** - Akses keranjang komparasi

## Catatan Aset

Letakkan gambar di `public/images/*` dan rujuk dengan path absolut, contoh: `/images/p1.png`.
