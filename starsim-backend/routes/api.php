<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MisionController;
use Illuminate\Support\Facades\Route;

// ── Rutas públicas ──
Route::post('/login', [AuthController::class, 'login']);

// ── Rutas protegidas ──
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Misiones — lectura: todos los autenticados (incluido viewer)
    Route::get('/misiones',         [MisionController::class, 'index']);
    Route::get('/misiones/{id}',    [MisionController::class, 'show'])->whereNumber('id');

    // Misiones — escritura: admin + operator
    Route::middleware('role:admin,operator')->group(function () {
        Route::post('/misiones',                  [MisionController::class, 'store']);
        Route::put('/misiones/{id}',              [MisionController::class, 'update'])->whereNumber('id');
        Route::patch('/misiones/{id}/status',     [MisionController::class, 'updateStatus'])->whereNumber('id');
        Route::delete('/misiones/{id}',           [MisionController::class, 'destroy'])->whereNumber('id');
    });
});
