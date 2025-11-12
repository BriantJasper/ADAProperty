# Hostinger (hPanel) Deployment Guide — ADA Property

This guide is tailored for Hostinger’s hPanel. It deploys:

- Frontend (Vite + React) at https://adaproindonesia.com
- Backend API (Laravel) at https://api.adaproindonesia.com/api

You can complete everything with only hPanel’s File Manager. SSH is optional but recommended for Artisan commands.

Tip: Keep this open while you deploy; check off each step as you go.

---

## 0) Prerequisites checklist

- Domain connected to Hostinger and pointing to this hosting.
- SSL certificates issued for both:
  - adaproindonesia.com (and www)
  - api.adaproindonesia.com
- PHP version on the account is 8.2 or newer (hPanel → Advanced → PHP Configuration).
- MySQL credentials ready (we’ll create them below if not yet).
- In this repo, `.env.production` already contains:
  `VITE_API_BASE_URL=https://api.adaproindonesia.com/api`

---

## 1) Set up domains and SSL (hPanel)

1. hPanel → Websites → Manage → SSL → Install/Activate → make sure it’s Active for adaproindonesia.com.
2. hPanel → Domains → Subdomains → Create subdomain: `api`.
3. hPanel → Websites → Manage `api.adaproindonesia.com` → SSL → Install/Activate SSL for this subdomain too.
4. Optional but recommended: hPanel → Advanced → Redirects → ensure there’s no redirect loop configured. We’ll force HTTPS via .htaccess below.

---

## 2) Create database for Laravel (hPanel)

1. hPanel → Databases → MySQL Databases.
2. Create a new database, user, and secure password. Note the values:

- DB_DATABASE
- DB_USERNAME
- DB_PASSWORD
- DB_HOST is typically `localhost` on Hostinger shared hosting.

---

## 3) Deploy the backend to api.adaproindonesia.com (Laravel)

We will upload the repository folder `backend/laravel-api/` to the subdomain and point the document root to its `public/` directory.

### 3.1 Upload files

1. hPanel → Websites → Manage `api.adaproindonesia.com` → Files → File Manager.
2. Your Hostinger path layout puts the subdomain’s public folder here:
   - `/domains/adaproindonesia.com/public_html/api`
3. Inside that folder, create a new folder named `laravel/`:
   - `/domains/adaproindonesia.com/public_html/api/laravel`
4. Upload EVERYTHING from this repo’s `backend/laravel-api/` into that `laravel/` folder. The structure should look like:

- /domains/adaproindonesia.com/public_html/api/laravel/app
- /domains/adaproindonesia.com/public_html/api/laravel/bootstrap
- ...
- /domains/adaproindonesia.com/public_html/api/laravel/public
- /domains/adaproindonesia.com/public_html/api/laravel/vendor (already included in the repo; no composer needed)

### 3.2 Point document root to Laravel public/

1. hPanel → Domains → Subdomains → locate `api.adaproindonesia.com` → Change document root.
2. Set document root to the Laravel public directory:
   - `/domains/adaproindonesia.com/public_html/api/laravel/public`
3. Save. This ensures web requests go through Laravel’s `public/index.php` and never expose your app core files.

If hPanel does NOT allow changing the document root, use this fallback bridge:

- Create file `/domains/adaproindonesia.com/public_html/api/index.php` with:
  ```php
  <?php require __DIR__ . '/laravel/public/index.php';
  ```
- Copy `.htaccess` from `/domains/adaproindonesia.com/public_html/api/laravel/public/.htaccess` to `/domains/adaproindonesia.com/public_html/api/.htaccess`.
  This proxies all requests to the true Laravel front controller.

### 3.3 Create/Edit .env on the server

1. In File Manager, inside `laravel-api/`, create `.env` (or edit if exists) with at least:

```env
APP_NAME="ADA Property API"
APP_ENV=production
APP_KEY=base64:PUT_A_VALID_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.adaproindonesia.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=YOUR_DB_NAME
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
```

How to get a valid `APP_KEY` without SSH:

- On your local machine inside `backend/laravel-api`, run: `php artisan key:generate --show`
- Copy the printed key and paste into `APP_KEY=...` above.
- Alternatively, if you have SSH enabled, you can run the command on the server (see 3.5).

### 3.4 Permissions

Make sure these directories are writable (755 or 775):

- `storage`
- `bootstrap/cache`

You can set permissions in File Manager (right-click → Permissions) or via SSH: `chmod -R 775 storage bootstrap/cache`.

### 3.5 (Optional but recommended) Run Artisan commands via SSH

If SSH is enabled on your hosting plan:

1. Connect via SSH (hPanel → Advanced → SSH Access for credentials). Then:

```bash
cd /domains/adaproindonesia.com/public_html/api/laravel
php artisan key:generate --force   # if APP_KEY not yet set
php artisan config:cache
php artisan route:cache
php artisan migrate --force        # run migrations on the new DB
```

If SSH is not available:

- Generate the `APP_KEY` locally as described above and paste it into `.env`.
- You can defer `config:cache`/`route:cache`—Laravel will still work.
- Run migrations locally and export/import SQL via phpMyAdmin, or request temporary SSH from Hostinger support.

### 3.6 CORS

This project already adds CORS headers in `bootstrap/app.php` allowing `https://adaproindonesia.com`. If you add more frontends, add them there.

### 3.7 Verify the API

Open this in your browser:

- `https://api.adaproindonesia.com/api/properties`
  You should get JSON, not a 500 error. If you see a 500, check `.env` (DB), file permissions, and PHP error logs (hPanel → Advanced → Error Logs).

---

## 4) Build and deploy the frontend to adaproindonesia.com (Vite + React)

### 4.1 Build locally

In the repo root on your machine:

```powershell
npm install
npm run build
```

This produces the `dist/` folder.

### 4.2 Upload build to public_html

1. hPanel → Websites → Manage `adaproindonesia.com` → Files → File Manager.
2. Open the domain root `public_html/`.
3. Upload the CONTENTS of `dist/` (not the folder itself) into `public_html/`. Overwrite existing files.

### 4.3 SPA .htaccess and HTTPS redirect

In `public_html/.htaccess` make sure you have:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Force HTTPS (safe permanent redirect)
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Vite/React SPA routing
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 5) Final verification

1. Visit `https://adaproindonesia.com`.

- Chrome DevTools → Security tab should say: Connection is secure.

2. Open DevTools → Network → reload.

- Requests to `/api/...` from the frontend must go to `https://api.adaproindonesia.com/api/...` with status 200.

3. Test API directly:

- `https://api.adaproindonesia.com/api/properties` returns JSON.

4. Test admin login.
5. In Console, quickly check for mixed content:

```js
[...performance.getEntries()]
  .filter((e) => e.name.startsWith("http:"))
  .map((e) => e.name);
```

Should return `[]` (empty array).

---

## 6) Debugging HTTP 500 Errors (Step-by-Step)

If you're getting 500 errors after deployment, follow this systematic debugging process:

### 6.1 Check Laravel error logs (FIRST PRIORITY)

1. **hPanel → Files → File Manager**
2. Navigate to: `/domains/adaproindonesia.com/public_html/api/laravel/storage/logs/`
3. Open `laravel.log` (or the latest dated log file)
4. Scroll to the **bottom** — the most recent error shows the exact problem
5. Common errors you'll see:
   - `SQLSTATE[HY000] [1045] Access denied` → Wrong DB credentials in `.env`
   - `Base table or view not found` → Run migrations
   - `No application encryption key has been specified` → Missing APP_KEY
   - `File not found` or `Permission denied` → Storage permissions issue

**If laravel.log is empty or doesn't exist:**

- Permissions issue. Run via SSH: `chmod -R 775 storage bootstrap/cache`
- Or in File Manager: right-click `storage` folder → Permissions → 775

### 6.2 Check PHP error logs (catches fatal errors before Laravel boots)

1. **hPanel → Advanced → Error Logs**
2. Select **PHP Error Log**
3. Look for errors around the timestamp when you accessed the API
4. Common PHP fatal errors:
   - `Class ... not found` → Autoloader issue (run `composer dump-autoload` or re-upload vendor/)
   - `require(): Failed opening required` → Wrong path in bridge index.php
   - `Maximum execution time exceeded` → Infinite loop or heavy operation
   - Missing PHP extensions → Enable in hPanel → PHP Configuration

### 6.3 Enable debug mode TEMPORARILY (NEVER leave this on in production)

1. Edit `/domains/adaproindonesia.com/public_html/api/laravel/.env`:

   ```env
   APP_DEBUG=true
   ```

2. Visit the failing URL in your browser (e.g., `https://api.adaproindonesia.com/api/properties`)

3. **You'll see the full error stack trace** in the browser — take a screenshot or copy the error message

4. **IMMEDIATELY** set back to `APP_DEBUG=false` after you've captured the error

5. Clear config cache via SSH:
   ```bash
   cd /domains/adaproindonesia.com/public_html/api/laravel
   php artisan config:clear
   ```

### 6.4 Verify the bridge index.php (if using one instead of document root change)

Your bridge file at `/domains/adaproindonesia.com/public_html/api/index.php` should be:

```php
<?php

/**
 * Bridge to Laravel public/index.php
 * Use this only if you can't change subdomain document root
 */

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader
require __DIR__.'/laravel/vendor/autoload.php';

// Bootstrap Laravel and handle the request
$app = require_once __DIR__.'/laravel/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
```

**Common bridge mistakes:**

- Wrong path: `require __DIR__ . '/laravel/public/index.php'` (this tries to re-execute, causes loops)
- Missing autoloader: Must require `vendor/autoload.php` first
- Missing `bootstrap/app.php`: Must bootstrap the Laravel app

### 6.5 Verify .htaccess in the public API folder

Your `.htaccess` at `/domains/adaproindonesia.com/public_html/api/.htaccess` should be:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Force HTTPS
    RewriteCond %{HTTPS} !=on
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller (via bridge if using index.php in this folder)
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 6.6 Test database connection directly

Create a temporary test file: `/domains/adaproindonesia.com/public_html/api/laravel/test-db.php`

```php
<?php
require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

try {
    $pdo = new PDO(
        "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_DATABASE'],
        $_ENV['DB_USERNAME'],
        $_ENV['DB_PASSWORD']
    );
    echo "✅ Database connection successful!\n";
    echo "Database: " . $_ENV['DB_DATABASE'] . "\n";
} catch (PDOException $e) {
    echo "❌ Database connection failed:\n";
    echo $e->getMessage() . "\n";
}
```

Run via browser: `https://api.adaproindonesia.com/test-db.php`

**DELETE this file after testing!**

### 6.7 Create a diagnostic route

Add to `/domains/adaproindonesia.com/public_html/api/laravel/routes/api.php`:

```php
Route::get('/diagnostic', function () {
    $checks = [
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version(),
        'environment' => app()->environment(),
        'debug_mode' => config('app.debug'),
        'app_key_set' => !empty(config('app.key')),
        'storage_writable' => is_writable(storage_path()),
        'cache_writable' => is_writable(storage_path('framework/cache')),
    ];

    // Test DB
    try {
        \DB::connection()->getPdo();
        $checks['database'] = '✅ Connected';
        $checks['db_name'] = \DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        $checks['database'] = '❌ Failed: ' . $e->getMessage();
    }

    return response()->json($checks, 200, [], JSON_PRETTY_PRINT);
});
```

Visit: `https://api.adaproindonesia.com/api/diagnostic`

**DELETE this route after debugging!**

### 6.8 Verify file permissions

Via SSH:

```bash
cd /domains/adaproindonesia.com/public_html/api/laravel
ls -la storage/
ls -la bootstrap/cache/
```

Required permissions:

- `storage/` → 775 (drwxrwxr-x)
- `storage/logs/` → 775
- `storage/framework/` → 775
- `storage/framework/cache/` → 775
- `storage/framework/sessions/` → 775
- `storage/framework/views/` → 775
- `bootstrap/cache/` → 775

Fix all at once:

```bash
chmod -R 775 storage bootstrap/cache
```

### 6.9 Verify PHP version and extensions

**hPanel → Advanced → PHP Configuration:**

1. PHP version: **8.2 or higher**
2. Required extensions (enable all):
   - ✅ pdo_mysql
   - ✅ mbstring
   - ✅ xml
   - ✅ ctype
   - ✅ json
   - ✅ tokenizer
   - ✅ openssl
   - ✅ curl
   - ✅ fileinfo
   - ✅ bcmath (for precise calculations)

Save and wait 1-2 minutes for changes to apply.

### 6.10 Clear all caches

Via SSH:

```bash
cd /domains/adaproindonesia.com/public_html/api/laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

Then re-cache (optional but recommended):

```bash
php artisan config:cache
php artisan route:cache
```

### 6.11 Verify routes exist

```bash
cd /domains/adaproindonesia.com/public_html/api/laravel
php artisan route:list --path=api
```

Check that your routes (e.g., `GET /api/properties`) are listed.

---

## 7) Common 500 Error Solutions (Quick Reference)

| Error in Log                       | Solution                                                                |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `Access denied for user`           | Fix DB_USERNAME/DB_PASSWORD in `.env`, run `php artisan config:clear`   |
| `Base table or view not found`     | Run `php artisan migrate --force`                                       |
| `No application encryption key`    | Set APP_KEY in `.env` (generate with `php artisan key:generate --show`) |
| `Class ... not found`              | Re-upload `vendor/` or run `composer dump-autoload`                     |
| `Permission denied` (writing logs) | `chmod -R 775 storage bootstrap/cache`                                  |
| `require(): Failed opening`        | Fix path in bridge index.php or point document root correctly           |
| Empty laravel.log                  | Storage permissions issue OR Laravel not booting (check PHP error log)  |
| `Syntax error` in .env             | Remove quotes from multi-word values unless needed; no trailing spaces  |
| `Connection refused` (DB)          | DB_HOST should be `localhost`, not `127.0.0.1` on some Hostinger setups |

---

## 8) General Troubleshooting

- **CORS errors:** Make sure `bootstrap/app.php` sets `Access-Control-Allow-Origin` to `https://adaproindonesia.com` and handle OPTIONS preflight (already included in this repo).
- **404 on SPA deep links** (e.g., `/ada-admin`): The SPA `.htaccess` rules may be missing; re-add the block in section 4.3.
- **"Not secure" even on HTTPS:** Ensure both apex and subdomain have SSL issued and that `.htaccess` forces HTTPS. If you use Cloudflare, set SSL mode to Full (Strict).
- **API returns HTML instead of JSON:** Usually means a redirect, error page, or PHP warning. Check Network → Response body and server error logs.

---

## 9) Optional hardening

Add HSTS after everything works over HTTPS:

```apache
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>
```

Only enable this if all subdomains have valid SSL (including `api.`). Otherwise you may lock yourself out temporarily.

---

## 10) Local development quick notes

- Frontend dev server: `npm run dev` → http://localhost:5173
- Backend: `php artisan serve` → http://127.0.0.1:8000
- The app auto-uses `http://127.0.0.1:8000/api` on localhost and `https://api.adaproindonesia.com/api` in production.

---

## 11) Command snippets (SSH)

```bash
# Navigate to Laravel project on the server
cd /domains/adaproindonesia.com/public_html/api/laravel

# Laravel essentials
php artisan key:generate --force
php artisan config:cache
php artisan route:cache
php artisan migrate --force

# Permissions (if needed)
chmod -R 775 storage bootstrap/cache
```

You’re done. If anything behaves oddly, share the exact failing URL and the Network/Console error text, and we can pinpoint it fast.

### Frontend

```powershell
npm install          # Install dependencies
npm run dev          # Dev server
npm run build        # Production build
```

### Backend

```bash
composer install                    # Install dependencies
php artisan serve                   # Dev server
php artisan config:clear           # Clear config cache
php artisan migrate:fresh --seed   # Reset database
```
