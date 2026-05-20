<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `programas`: agrupaciones de misiones (Starlink, Artemis...).
 * Se relaciona con `entidades` mediante el pivot `entidad_programa`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programas', function (Blueprint $table) {
            $table->id();
            // El nombre identifica el programa de forma única en la UI.
            $table->string('name')->unique();
            $table->text('description')->nullable();
            // Si el creador se borra, el programa se conserva pero queda sin propietario.
            $table->foreignId('created_by')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programas');
    }
};
