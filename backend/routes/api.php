<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

// Public routes (no authentication required)


// Protected routes (authentication required)
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

//     // User management
//     Route::apiResource('users', UserController::class);

//     // Patient management
//     Route::apiResource('patients', PatientController::class);

//     // Dashboard stats
//     Route::get('/stats', [StatsController::class, 'index']);
// });


Route::group(["prefix" => 'auth'], function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware(["auth:sanctum"])->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });

    // Route::post('auth/refresh', [AuthController::class, 'refresh']);
});
