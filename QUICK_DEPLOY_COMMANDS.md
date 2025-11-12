# Quick Deployment Commands

## Generate Strong JWT Secret

```bash
cd backend/laravel-api
php -r "echo 'JWT_SECRET=' . bin2hex(random_bytes(32)) . PHP_EOL;"
```

Copy the output and paste it into your `.env` file.

---

## Backend Setup (Production Server)

```bash
# Navigate to Laravel directory
cd backend/laravel-api

# Install dependencies (production mode)
composer install --optimize-autoloader --no-dev

# Set permissions
chmod -R 755 storage bootstrap/cache

# Generate key if needed
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed admin user
php artisan db:seed --class=AdminUserSeeder

# Create storage symbolic link
php artisan storage:link

# Cache configuration for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Frontend Build & Deploy

```bash
# Build frontend
npm run build

# The dist/ folder now contains your production files
# Upload contents of dist/ to your web server's public_html/
```

---

## After Upload

1. Copy `.htaccess.production` to `public_html/.htaccess`
2. Test your site at your domain
3. Login to admin panel and change default credentials
4. Test all features

---

## Clear Caches (if you make changes)

```bash
cd backend/laravel-api
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Then re-cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
