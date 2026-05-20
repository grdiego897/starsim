<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Boilerplate de Laravel.
 * Originalmente creaba también la tabla `users`, pero el dominio usa
 * `usuarios` (ver migración 2026_04_28_000002). Aquí sólo quedan las
 * tablas auxiliares estándar de Laravel: tokens de reseteo y sesiones.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Tokens para el flujo de "olvidé mi contraseña" (no usado por la API actual).
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabla de sesiones del driver "database" de Laravel.
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
