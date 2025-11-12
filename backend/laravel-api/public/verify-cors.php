<?php
// Quick verification script - place in /api
// Access via: https://api.adaproindonesia.com/verify-cors.php

header('Content-Type: text/plain');

// Laravel is in /api/laravel/, not /api/..
$laravelRoot = __DIR__ . '/laravel';

echo "=== CORS Middleware Verification ===\n\n";
echo "Script location: " . __DIR__ . "\n";
echo "Laravel root: $laravelRoot\n\n";

// Check if CorsMiddleware.php exists
$corsPath = $laravelRoot . '/app/Http/Middleware/CorsMiddleware.php';
echo "CorsMiddleware exists: " . (file_exists($corsPath) ? 'YES' : 'NO') . "\n";
echo "Full path: $corsPath\n";
if (file_exists($corsPath)) {
    echo "File size: " . filesize($corsPath) . " bytes\n";
}
echo "\n";

// Check bootstrap/app.php content
$bootstrapPath = $laravelRoot . '/bootstrap/app.php';
echo "bootstrap/app.php exists: " . (file_exists($bootstrapPath) ? 'YES' : 'NO') . "\n";
echo "Full path: $bootstrapPath\n";
if (file_exists($bootstrapPath)) {
    $content = file_get_contents($bootstrapPath);
    echo "Contains 'CorsMiddleware': " . (strpos($content, 'CorsMiddleware') !== false ? 'YES' : 'NO') . "\n";
    echo "Contains 'use([': " . (strpos($content, 'use([') !== false ? 'YES' : 'NO') . "\n";
    echo "File size: " . strlen($content) . " bytes\n";
}
echo "\n";

// Show last modified times
if (file_exists($corsPath)) {
    echo "CorsMiddleware.php modified: " . date('Y-m-d H:i:s', filemtime($corsPath)) . "\n";
}
if (file_exists($bootstrapPath)) {
    echo "bootstrap/app.php modified: " . date('Y-m-d H:i:s', filemtime($bootstrapPath)) . "\n";
}

echo "\n=== REMOVE THIS FILE AFTER CHECKING ===\n";
