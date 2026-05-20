<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `destinos`: objetivos orbitales o planetarios a los que
 * pueden dirigirse las misiones (LEO, Gateway, Luna, Terminus...).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destinos', function (Blueprint $table) {
            $table->id();
            // slug = identificador estable para el frontend (no traducible).
            $table->string('slug')->unique();
            // display_name = etiqueta legible mostrada al usuario.
            $table->string('display_name');
            // Imagen ilustrativa del destino (opcional).
            $table->string('image_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destinos');
    }
};
