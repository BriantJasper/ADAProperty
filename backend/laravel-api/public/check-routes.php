<?php
// Check if routes/api.php is correct on server
// Place in /api/ and access via https://api.adaproindonesia.com/check-routes.php

header('Content-Type: text/plain');

$laravelRoot = __DIR__ . '/laravel';
$apiRoutesPath = $laravelRoot . '/routes/api.php';

echo "=== Routes File Check ===\n\n";
echo "Routes file path: $apiRoutesPath\n";
echo "File exists: " . (file_exists($apiRoutesPath) ? 'YES' : 'NO') . "\n\n";

if (file_exists($apiRoutesPath)) {
    $content = file_get_contents($apiRoutesPath);
    echo "File size: " . strlen($content) . " bytes\n";
    echo "Last modified: " . date('Y-m-d H:i:s', filemtime($apiRoutesPath)) . "\n\n";

    // Check for key routes
    echo "Contains '/properties': " . (strpos($content, '/properties') !== false ? 'YES' : 'NO') . "\n";
    echo "Contains 'PropertyController': " . (strpos($content, 'PropertyController') !== false ? 'YES' : 'NO') . "\n";
    echo "Contains 'OPTIONS': " . (strpos($content, 'options') !== false ? 'YES' : 'NO') . "\n";
    echo "Contains '/health': " . (strpos($content, '/health') !== false ? 'YES' : 'NO') . "\n\n";

    echo "First 500 chars:\n";
    echo substr($content, 0, 500) . "\n";
}

echo "\n=== REMOVE THIS FILE AFTER CHECKING ===\n";
