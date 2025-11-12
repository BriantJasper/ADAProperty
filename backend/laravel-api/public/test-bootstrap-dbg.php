<?php
// Temporary diagnostic script to debug HTTP 500 during Laravel bootstrap
// Place this file in the web-accessible folder. If your subdomain docroot is /api (bridge),
// you can also drop a copy in /api and it will auto-detect /api/laravel as the real root.
// IMPORTANT: Remove this file after debugging.

declare(strict_types=1);

error_reporting(E_ALL);
@ini_set('display_errors', '1');
@ini_set('log_errors', '1');
@ini_set('error_log', __DIR__ . '/bootstrap-test-error.log');

header('Content-Type: text/plain');

function line($label, $value): void
{
    echo $label . ': ' . $value . PHP_EOL;
}

line('Working directory', __DIR__);
line('PHP version', PHP_VERSION);

// Try to detect the Laravel root. If this script is inside /api, we expect /api/laravel to exist.
$laravelRoot = __DIR__;
if (!file_exists($laravelRoot . '/vendor/autoload.php') && file_exists(__DIR__ . '/laravel/vendor/autoload.php')) {
    $laravelRoot = __DIR__ . '/laravel';
}
line('Laravel root guess', $laravelRoot);
line('Autoload exists', file_exists($laravelRoot . '/vendor/autoload.php') ? 'yes' : 'no');
line('Bootstrap app exists', file_exists($laravelRoot . '/bootstrap/app.php') ? 'yes' : 'no');

if (!file_exists($laravelRoot . '/vendor/autoload.php')) {
    echo "FATAL: vendor/autoload.php not found. Ensure 'vendor' is uploaded or run composer install." . PHP_EOL;
    exit(1);
}
if (!file_exists($laravelRoot . '/bootstrap/app.php')) {
    echo "FATAL: bootstrap/app.php not found at expected path." . PHP_EOL;
    exit(1);
}

require $laravelRoot . '/vendor/autoload.php';
$app = require $laravelRoot . '/bootstrap/app.php';

use Illuminate\Contracts\Http\Kernel as HttpKernel;

try {
    /** @var \Illuminate\Contracts\Http\Kernel $kernel */
    $kernel = $app->make(HttpKernel::class);
    $kernel->bootstrap(); // Ensure environment is loaded
    line('Environment', $app->environment());

    // Try DB connection (optional)
    try {
        $pdo = app('db')->connection()->getPdo();
        line('DB connection', 'ok');
    } catch (Throwable $e) {
        line('DB error', $e->getMessage());
    }

    echo PHP_EOL . "OK: Laravel bootstrapped successfully." . PHP_EOL;
} catch (Throwable $e) {
    line('Bootstrap exception class', get_class($e));
    line('Message', $e->getMessage());
    line('File', $e->getFile());
    line('Line', (string)$e->getLine());
    echo "Trace:\n" . $e->getTraceAsString() . PHP_EOL;
    echo PHP_EOL . "See error log at: " . (__DIR__ . '/bootstrap-test-error.log') . PHP_EOL;
    http_response_code(500);
}
