<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `usuarios`: cuentas de acceso a la aplicación.
 * Sustituye al `users` por defecto de Laravel para encajar con el dominio
 * (campo `role` con enum y FK opcional a `entidades`).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // El email actúa como identificador único de login.
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            // Niveles de permiso: admin > operator > viewer. Por defecto el más restrictivo.
            $table->enum('role', ['admin', 'operator', 'viewer'])->default('viewer');
            // Si se borra la entidad, conservamos al usuario sin asignación (nullOnDelete).
            $table->foreignId('entidad_id')->nullable()->constrained('entidades')->nullOnDelete();
            $table->rememberToken();
            $table->timestamps();

            // Filtrar usuarios por entidad es una consulta frecuente desde el panel admin.
            $table->index('entidad_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
