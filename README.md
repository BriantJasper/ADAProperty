# ADAProperty (React + TypeScript + Vite)

Aplikasi katalog properti dengan Admin Panel, komparasi properti (max 3), WhatsApp integration, dan filter lokasi/sub‑lokasi.

## Menjalankan

1. Install dependency: `npm install`
2. Jalankan dev server: `npm run dev`
3. Buka `http://localhost:5173`

## Fitur Utama

- Admin Panel (CRUD properti)
- Komparasi properti (maksimal 3)
- Tombol WhatsApp dengan pesan otomatis
- Filter Lokasi + Sub‑lokasi (otomatis dari data)
- Filter tambahan: Status, Tipe, Price Min/Max
- Persistensi data via localStorage

## Arsitektur & State

- Global state di `src/context/AppContext.tsx`:
  - `properties`, `comparisonCart`, `isAdminMode`, `isAuthenticated`, `user`, `selectedLocation`
  - Actions: CRUD, comparison add/remove/clear, `LOGIN/LOGOUT`, `SET_SELECTED_LOCATION`, `LOAD_PROPERTIES`
  - Persist ke `localStorage`

## Routes

- `/` Home (hero + Popular Section)
- `/properties` Daftar Properti + panel filter + sub‑lokasi
- `/comparison` Halaman komparasi keranjang (max 3)
- `/admin` Admin Panel (protected)
- `/about` Tentang Kami
- `/contact` Kontak Kami

> Navbar otomatis solid putih di `/admin`, `/about`, `/comparison`, `/contact`.

## Login Admin (Demo)

- Username: `admin`
- Password: `admin123`

## Struktur Penting

- `src/components/PropertyCard.tsx` — kartu properti + WA + compare + admin controls
- `src/components/ComparisonCart.tsx` — keranjang komparasi
- `src/components/PropertyForm.tsx` — form tambah/edit properti
- `src/components/Navbar.tsx` — navbar adaptif (transparan/solid)
- `src/pages/PropertiesPage.tsx` — halaman daftar properti + filter + sub‑lokasi
- `src/pages/ContactPage.tsx` — halaman kontak
- `src/pages/About.tsx` — halaman tentang + anggota

## Catatan Aset

Letakkan gambar di `public/images/*` dan rujuk dengan path absolut, contoh: `/images/p1.png`.

