# Hostinger Shared Hosting Deploy Package (PHP + MySQL backend, Vite React frontend)

This document is a concise checklist and file mapping to deploy ADAProperty to Hostinger shared hosting.

## Prerequisites
- Hostinger shared hosting with cPanel (Apache + PHP).
- MySQL database and user created in cPanel.
- Frontend build available in `dist/` (already generated).

## File Mapping

Upload these files/folders to your hosting:

1) public_html/ (Frontend SPA)
- Upload the contents of `dist/` (all files inside `dist/`).
- Add SPA rewrite file: use `backend/php/spa.htaccess` as `.htaccess` in `public_html/`.

2) public_html/api/ (Backend PHP API)
- Upload `backend/php/api/index.php` → `public_html/api/index.php`
- Upload `backend/php/api/.htaccess` → `public_html/api/.htaccess`

3) public_html/ (Backend shared files)
- Upload `backend/php/config.php` → `public_html/config.php`
- Upload `backend/php/db.php` → `public_html/db.php`
- Upload `backend/php/utils/jwt.php` → `public_html/utils/jwt.php`
- Upload `backend/php/utils/utils.php` → `public_html/utils/utils.php`
- Create `public_html/.env.php` based on `backend/php/.env.php.example`

4) Optional uploads directory
- Create `public_html/api/uploads/` if you plan to store uploaded images as files.

## .env.php Template (place at public_html/.env.php)
```php
<?php
$_ENV = [
  'APP_ENV' => 'production',
  'TIMEZONE' => 'Asia/Jakarta',
  'CORS_ORIGIN' => 'https://yourdomain.com',
  'DB_HOST' => 'localhost',
  'DB_PORT' => '3306',
  'DB_NAME' => 'uXXXXXX_db',
  'DB_USER' => 'uXXXXXX_user',
  'DB_PASS' => 'your_password_here',
  'JWT_SECRET' => 'replace_with_a_long_random_secret',
  'JWT_EXPIRE_SECONDS' => '604800',
  'ADMIN_USERNAME' => 'admin',
  'ADMIN_PASSWORD' => 'change_me',
  'ADMIN_EMAIL' => 'admin@yourdomain.com',
];
```

## Database Setup
- In cPanel → phpMyAdmin → select your DB → Import `backend/php/sql/schema.sql`.
- First request to API will ensure tables exist and seed default admin if needed.

## Frontend API URL
- Production is set to use `VITE_API_BASE_URL=/api` via `.env.production` (already created).
- With frontend and backend on the same domain, requests resolve to `https://yourdomain.com/api/...`.

## Post-Deploy Checks
- Open `https://yourdomain.com/api/health` → expect `{ success: true, status: 'OK' }`.
- `GET https://yourdomain.com/api/properties` → should return property list (may be empty initially).
- Login Admin on the site → then change credentials via UI or `POST /api/admin/change-credentials`.

## Notes & Tips
- Replace `JWT_SECRET` with a strong random string.
- Restrict `CORS_ORIGIN` to your domain, not `*`, if using cross-origin setups.
- If you store image paths, ensure they are publicly accessible (e.g., under `public_html/uploads`).
- If later adding file upload, configure PHP upload limits and directory permissions.

Happy deployment!