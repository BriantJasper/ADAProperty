# ADA Property - Authentication & API Testing Guide

## Login Credentials

After running `php artisan migrate:fresh --seed`, you'll have these test accounts:

### Admin Account

-   **Username:** `admin`
-   **Password:** `admin123`
-   **Email:** `admin@adaproperty.com`
-   **Role:** `admin`

### Test User Account

-   **Username:** `testuser`
-   **Password:** `password`
-   **Email:** `test@example.com`
-   **Role:** `user`

## API Endpoints

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json
Accept: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "data": {
        "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "user": {
            "id": 2,
            "username": "admin",
            "name": "Administrator",
            "email": "admin@adaproperty.com",
            "role": "admin"
        }
    }
}
```

**Error Response (401):**

```json
{
    "success": false,
    "error": "Invalid username or password"
}
```

**Validation Error (400):**

```json
{
    "success": false,
    "error": "Validation failed",
    "details": {
        "username": ["The username field is required."]
    }
}
```

## Testing with PowerShell

### Test Login (Success)

```powershell
$body = @{username='admin'; password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -Headers @{Accept='application/json'} | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Test Login (Invalid Credentials)

```powershell
$body = @{username='admin'; password='wrong'} | ConvertTo-Json
try {
    Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -Headers @{Accept='application/json'}
} catch {
    $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10
}
```

### Test with Authorization Token

```powershell
# First, login and get token
$loginBody = @{username='admin'; password='admin123'} | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -Headers @{Accept='application/json'}
$token = ($response.Content | ConvertFrom-Json).data.token

# Then use the token for authenticated requests
Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/properties' -Method GET -Headers @{
    'Authorization' = "Bearer $token"
    'Accept' = 'application/json'
} | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Error Handling Features

### Comprehensive Logging

All login attempts are logged with details:

-   Username attempts
-   IP addresses
-   Success/failure status
-   Detailed error traces

### Debug Mode Information

When `APP_DEBUG=true`, error responses include:

-   Exception message
-   File and line number
-   Stack trace (limited to 5 frames)

### Production Mode

When `APP_DEBUG=false`, errors return generic messages without exposing internal details.

## Configuration

### Required Environment Variables

```env
# Application
APP_DEBUG=true

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=adaproperty
DB_USERNAME=root
DB_PASSWORD=

# JWT Secret (REQUIRED)
JWT_SECRET=your-secret-key-change-this-in-production
```

### CORS Configuration

The API is configured to accept requests from all origins (`*`) for development. Update `config/cors.php` for production.

## Logs Location

Laravel logs are stored in:

```
storage/logs/laravel.log
```

View recent logs:

```powershell
Get-Content storage\logs\laravel.log -Tail 50
```

## Troubleshooting

### Issue: HTML Response Instead of JSON

**Solution:** This is now fixed. The `bootstrap/app.php` ensures all `/api/*` routes return JSON responses.

### Issue: JWT_SECRET not configured

**Error:** `Server configuration error: JWT_SECRET not set`
**Solution:** Add `JWT_SECRET=your-secret-key` to `.env` file

### Issue: Database Connection Error

**Solution:**

1. Ensure MySQL is running in XAMPP
2. Create database: `CREATE DATABASE adaproperty;`
3. Run migrations: `php artisan migrate:fresh --seed`

### Issue: vendor/autoload.php not found

**Solution:** Run `composer install`

## API Response Format

All API responses follow this standard format:

### Success Response

```json
{
    "success": true,
    "data": {
        /* response data */
    }
}
```

### Error Response

```json
{
    "success": false,
    "error": "Error message",
    "message": "Detailed error (debug mode only)",
    "details": {
        /* additional context */
    }
}
```
