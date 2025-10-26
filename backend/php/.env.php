<?php
$_ENV = [
  // App
  'APP_ENV' => 'development',
  'TIMEZONE' => 'Asia/Jakarta',
  'CORS_ORIGIN' => 'http://localhost:5173',

  // Database (Local MySQL)
  'DB_HOST' => 'localhost',
  'DB_PORT' => '3306',
  'DB_NAME' => 'adaproperty',
  'DB_USER' => 'root',
  'DB_PASS' => '',

  // Security
  'JWT_SECRET' => 'replace_with_a_long_random_secret_change_me',
  'JWT_EXPIRE_SECONDS' => '604800', // 7 days

  // Initial admin (seed)
  'ADMIN_USERNAME' => 'admin',
  'ADMIN_PASSWORD' => 'admin123',
  'ADMIN_EMAIL' => 'admin@localhost',
];