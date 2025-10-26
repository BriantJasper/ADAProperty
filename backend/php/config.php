<?php
// backend/php/config.php
// Simple configuration loader for Hostinger shared hosting

// Load local env overrides if present
$envFile = __DIR__ . '/.env.php';
if (file_exists($envFile)) {
    require_once $envFile; // Should set values on $_ENV (array)
}

function env($key, $default = null) {
    if (isset($_ENV[$key])) return $_ENV[$key];
    $val = getenv($key);
    return $val !== false && $val !== null && $val !== '' ? $val : $default;
}

// App
define('APP_ENV', env('APP_ENV', 'production'));
define('TIMEZONE', env('TIMEZONE', 'Asia/Jakarta'));
@date_default_timezone_set(TIMEZONE);

// CORS
define('CORS_ORIGIN', env('CORS_ORIGIN', '*'));

// Database
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_PORT', (int)env('DB_PORT', '3306'));
define('DB_NAME', env('DB_NAME', 'your_database'));
define('DB_USER', env('DB_USER', 'your_username'));
define('DB_PASS', env('DB_PASS', 'your_password'));

// Security
define('JWT_SECRET', env('JWT_SECRET', 'change-this-secret'));
define('JWT_EXPIRE_SECONDS', (int)env('JWT_EXPIRE_SECONDS', '604800')); // 7 days

// Admin defaults (used to seed first admin if not exists)
define('ADMIN_USERNAME', env('ADMIN_USERNAME', 'admin'));
define('ADMIN_PASSWORD', env('ADMIN_PASSWORD', 'admin123'));
define('ADMIN_EMAIL', env('ADMIN_EMAIL', 'admin@example.com'));