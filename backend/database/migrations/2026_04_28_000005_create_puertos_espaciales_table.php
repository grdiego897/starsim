<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `puertos_espaciales`: ubicaciones físicas de lanzamiento
 * (Starbase, Cabo Cañaveral, Vandenberg, etc.).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('puertos_espaciales', function (Blueprint $table) {
            $table->id();
            // El slug se usa en URLs y como clave estable desde el frontend.
            $table->string('slug')->unique();
            $table->string('name');
            // 7 decimales ≈ precisión de 1 cm, suficiente para coordenadas geográficas.
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('country')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('puertos_espaciales');
    }
};
