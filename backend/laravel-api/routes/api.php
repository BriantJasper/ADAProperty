<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ConsignmentController;

// Handle all OPTIONS requests (CORS preflight)
Route::options('/{any}', function () {
    return response('', 200);
})->where('any', '.*');

// Lightweight health check (no auth)
Route::get('/health', function () {
    return response()->json([
        'ok' => true,
        'env' => app()->environment(),
        'time' => now()->toIso8601String(),
    ]);
});

// Debug: Test CORS middleware is loaded
Route::get('/debug/middleware', function () {
    $apiMiddleware = app(\Illuminate\Foundation\Configuration\Middleware::class);
    return response()->json([
        'cors_middleware_exists' => class_exists(\App\Http\Middleware\CorsMiddleware::class),
        'cors_file_path' => class_exists(\App\Http\Middleware\CorsMiddleware::class)
            ? (new ReflectionClass(\App\Http\Middleware\CorsMiddleware::class))->getFileName()
            : 'not found',
    ]);
});

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify', [AuthController::class, 'verify']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Token refresh endpoint (requires valid JWT)
Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// Public read-only routes for properties
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);

// Public consignment submission
Route::post('/consignments', [ConsignmentController::class, 'store']);

Route::middleware('jwt')->group(function () {
    Route::post('/upload', [UploadController::class, 'upload']);

    // Write operations require authentication
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::put('/properties/{id}', [PropertyController::class, 'update']);
    Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
    Route::post('/properties/batch-delete', [PropertyController::class, 'batchDestroy']);

    // Consignment management (admin only)
    Route::get('/consignments', [ConsignmentController::class, 'index']);
    Route::get('/consignments/download', [ConsignmentController::class, 'downloadImage']);
    Route::get('/consignments/{id}', [ConsignmentController::class, 'show']);
    Route::put('/consignments/{id}', [ConsignmentController::class, 'update']);
    Route::delete('/consignments/{id}', [ConsignmentController::class, 'destroy']);

    Route::post('/admin/change-credentials', [AdminController::class, 'changeCredentials']);
    Route::post('/auth/change-credentials', [AdminController::class, 'changeCredentials']);
});
