<?php
// Check if PropertyController exists on server
// Place in /api/ and access via https://api.adaproindonesia.com/check-controller.php

header('Content-Type: text/plain');

$laravelRoot = __DIR__ . '/laravel';
$controllerPath = $laravelRoot . '/app/Http/Controllers/PropertyController.php';

echo "=== PropertyController Check ===\n\n";
echo "Controller path: $controllerPath\n";
echo "File exists: " . (file_exists($controllerPath) ? 'YES' : 'NO') . "\n\n";

if (file_exists($controllerPath)) {
    echo "File size: " . filesize($controllerPath) . " bytes\n";
    echo "Last modified: " . date('Y-m-d H:i:s', filemtime($controllerPath)) . "\n\n";

    $content = file_get_contents($controllerPath);
    echo "Contains 'index' method: " . (strpos($content, 'function index') !== false ? 'YES' : 'NO') . "\n";
    echo "Contains 'show' method: " . (strpos($content, 'function show') !== false ? 'YES' : 'NO') . "\n";
}

// Try to actually call the endpoint via Laravel
echo "\n=== Test Direct Call ===\n";
try {
    require $laravelRoot . '/vendor/autoload.php';
    $app = require $laravelRoot . '/bootstrap/app.php';

    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    $request = \Illuminate\Http\Request::create('/api/properties', 'GET');
    $response = $kernel->handle($request);

    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Content preview: " . substr($response->getContent(), 0, 200) . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== REMOVE THIS FILE AFTER CHECKING ===\n";
