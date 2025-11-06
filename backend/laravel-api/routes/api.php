<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ConsignmentController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify', [AuthController::class, 'verify']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

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

    // Consignment management (admin only)
    Route::get('/consignments', [ConsignmentController::class, 'index']);
    Route::put('/consignments/{id}', [ConsignmentController::class, 'update']);
    Route::delete('/consignments/{id}', [ConsignmentController::class, 'destroy']);

    Route::post('/admin/change-credentials', [AdminController::class, 'changeCredentials']);
    Route::post('/auth/change-credentials', [AdminController::class, 'changeCredentials']);
});
