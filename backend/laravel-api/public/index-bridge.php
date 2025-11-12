<?php

/**
 * Bridge index.php for subdomain
 * Place this in /domains/adaproindonesia.com/public_html/api/index.php
 * This delegates all requests to the Laravel app in /api/laravel/
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Laravel application is in the 'laravel' subfolder
$laravelPublic = __DIR__ . '/laravel/public';
$laravelRoot = __DIR__ . '/laravel';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $laravelRoot . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $laravelRoot . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $laravelRoot . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
