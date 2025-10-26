# Hostinger Shared Hosting Deployment (Laravel backend) — Deprecated PHP Package

Project backend is now Laravel (`backend/laravel-api`). The previous native PHP backend and mapping in this document are deprecated and have been removed.

## Recommended Approaches

- Use a server where you can set the document root to `backend/laravel-api/public` and run PHP 8.2+ with Composer (Hostinger Cloud/VPS, or any VPS). Follow `backend/laravel-api/README_RUN_SERVER.md` for setup.
- Or deploy only the frontend to Hostinger shared hosting and point API to an external Laravel server (VPS or managed provider). Configure the frontend `VITE_API_BASE_URL` to your Laravel API URL.

## Frontend-Only on Hostinger Shared

1) Build frontend:
   - `npm run build` → outputs `dist/`.
2) Upload contents of `dist/` into `public_html/`.
3) Add SPA `.htaccess` in `public_html/`:
```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} -f
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule . - [L]
RewriteRule . /index.html [L]
```
4) Set API base URL in the frontend:
   - For production: place `VITE_API_BASE_URL=https://your-api-host.com/api` in your build environment or `.env.production`.
   - The frontend expects the Laravel API responses under `/api/*`.

## Laravel API Hosting Notes

- Laravel requires `public/` as the web root. On shared hosting without custom document root, deploying full Laravel is not recommended.
- Prefer VPS, Docker, or managed PHP hosting where you control document root and can run `composer install`.
- See `backend/laravel-api/README_RUN_SERVER.md` for local/dev steps and environment hints.

## Post-Deploy Checks

- Frontend: open `https://yourdomain.com/` and navigate the SPA routes.
- API: verify `GET https://your-api-host.com/api/properties` and `POST /api/auth/login` return JSON as expected.

## Status

This document replaces the old "PHP + MySQL backend" mapping. Laravel is the official backend; the legacy PHP package is no longer supported.