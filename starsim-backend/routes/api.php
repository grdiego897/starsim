<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// ── Rutas públicas (sin autenticación) ──
Route::post('/login', [AuthController::class, 'login']);

// ── Rutas protegidas (requieren token Sanctum) ──
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ── Solo admin ──
    Route::middleware('role:admin')->group(function () {
        // Gestión de usuarios (futuro)
        // Route::apiResource('usuarios', UsuarioController::class);
    });

    // ── Admin + Operator (pueden crear/editar/eliminar) ──
    Route::middleware('role:admin,operator')->group(function () {
        // CRUD de misiones (futuro)
        // Route::apiResource('misiones', MisionController::class);
    });

    // ── Todos los autenticados (incluido viewer) ──
    // Catálogos de solo lectura (futuro)
    // Route::apiResource('vehiculos', VehiculoController::class)->only(['index', 'show']);
    // Route::apiResource('destinos', DestinoController::class)->only(['index', 'show']);
});
