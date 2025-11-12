# Pre-Deployment Checklist ✅

This checklist ensures your ADAProperty project is ready for production deployment.

## 🔐 Security & Configuration

### 1. Backend (.env) Configuration

**File:** `backend/laravel-api/.env`

- [x] `APP_ENV=production`
- [x] `APP_DEBUG=false`
- [ ] **CRITICAL:** Generate and set a strong `JWT_SECRET`:
  ```bash
  cd backend/laravel-api
  php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
  ```
  Copy the output and update `.env`:
  ```
  JWT_SECRET=<your-generated-secret-here>
  ```
- [ ] Update `APP_URL` to your production domain:
  ```
  APP_URL=https://yourdomain.com
  ```
- [ ] Configure database credentials for production
- [ ] Update `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` if using MySQL in production

### 2. Frontend Environment Configuration

**File:** `.env.production`

- [ ] Update `VITE_API_BASE_URL` to your production API endpoint:
  ```
  VITE_API_BASE_URL=https://yourdomain.com/api
  ```
  Or if API is on a different domain:
  ```
  VITE_API_BASE_URL=https://api.yourdomain.com/api
  ```

## 🏗️ Build & Deployment Steps

### Backend Deployment (Laravel API)

1. **Upload Laravel files to server**

   - Upload entire `backend/laravel-api/` folder
   - Point web server document root to `backend/laravel-api/public/`

2. **Install dependencies:**

   ```bash
   cd backend/laravel-api
   composer install --optimize-autoloader --no-dev
   ```

3. **Set proper permissions:**

   ```bash
   chmod -R 755 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

4. **Generate application key (if needed):**

   ```bash
   php artisan key:generate
   ```

5. **Run database migrations:**

   ```bash
   php artisan migrate --force
   ```

6. **Seed admin user:**

   ```bash
   php artisan db:seed --class=AdminUserSeeder
   ```

7. **Optimize for production:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Frontend Deployment (React SPA)

1. **Build the frontend:**

   ```bash
   npm run build
   ```

   This creates a `dist/` folder with optimized production files.

2. **Upload to hosting:**
   - Upload all contents of `dist/` folder to your `public_html/` (or equivalent)
3. **Add .htaccess for SPA routing:**
   - Copy `.htaccess.production` to `public_html/.htaccess`
   - Or create `.htaccess` in `public_html/` with this content:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

## ✅ Post-Deployment Testing

After deployment, test the following:

### API Endpoints

- [ ] `GET /api/properties` - Returns property list
- [ ] `POST /api/auth/login` - Login works correctly
- [ ] `POST /api/consignments` - Consignment submission works
- [ ] File uploads work correctly

### Frontend

- [ ] Homepage loads correctly
- [ ] Navigation between pages works (SPA routing)
- [ ] Property catalog displays
- [ ] Contact form works
- [ ] Admin panel accessible and functional
- [ ] Images load correctly

### Security

- [ ] Error pages don't expose sensitive information
- [ ] API returns proper CORS headers
- [ ] JWT authentication works
- [ ] File upload restrictions work

## 🚨 Issues Fixed

- ✅ Removed all console.log statements from production code
- ✅ Set `APP_ENV=production` and `APP_DEBUG=false`
- ✅ Added CORS configuration to Laravel
- ✅ Updated `.env.example` with JWT_SECRET documentation
- ✅ Created `.htaccess.production` template for frontend SPA

## ⚠️ Important Notes

1. **JWT_SECRET** must be changed from the placeholder value before going live
2. Never commit `.env` files to version control (already in `.gitignore`)
3. Use HTTPS in production for security
4. Consider using a process manager (PM2, Supervisor) for Laravel queues if needed
5. Regular backups of database and uploaded files

## 📞 Default Admin Credentials

Check `backend/laravel-api/database/seeders/AdminUserSeeder.php` for default credentials.
**IMPORTANT:** Change these immediately after first login via the admin panel!

## 🔧 Troubleshooting

### CORS Issues

- Ensure CORS headers are set in `backend/laravel-api/bootstrap/app.php`
- Check browser console for CORS errors

### 404 on Frontend Routes

- Verify `.htaccess` file exists in your web root
- Ensure mod_rewrite is enabled on Apache

### API 500 Errors

- Check Laravel logs in `backend/laravel-api/storage/logs/`
- Verify database connection
- Ensure all migrations have run

### Images Not Loading

- Check file permissions on `backend/laravel-api/storage/`
- Verify storage link: `php artisan storage:link`
