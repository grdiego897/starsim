<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `entidades`: agencias y empresas espaciales (NASA, ESA, SpaceX...).
 * Tabla raíz del grafo: usuarios y programas apuntan a ella.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entidades', function (Blueprint $table) {
            $table->id();
            // name y slug son únicos para localizar la entidad por cualquiera de los dos.
            $table->string('name')->unique();
            $table->string('slug')->unique();
            // Logo y descripción son opcionales: la UI los muestra si existen.
            $table->string('logo_path')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entidades');
    }
};
