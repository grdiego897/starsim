<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot N:M `vehiculo_destino_capacidades` con atributo:
 * registra la carga máxima (en toneladas) que cada vehículo puede llevar
 * a cada destino. Si una pareja no existe, ese vehículo no llega allí.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehiculo_destino_capacidades', function (Blueprint $table) {
            // Cascada: si se borra un vehículo o destino, sus capacidades pierden sentido.
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->cascadeOnDelete();
            $table->foreignId('destino_id')->constrained('destinos')->cascadeOnDelete();
            // Atributo del pivot: capacidad efectiva para ese par concreto.
            $table->decimal('carga_maxima_t', 8, 2);

            // Clave primaria compuesta: una sola capacidad por par vehículo-destino.
            $table->primary(['vehiculo_id', 'destino_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculo_destino_capacidades');
    }
};
