<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `vehiculos`: catálogo de vehículos de lanzamiento.
 * Una sola tabla con un discriminador `type` para naves y boosters,
 * ya que comparten casi todos los atributos en este dominio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            // ship = carga útil; booster = etapa de empuje.
            $table->enum('type', ['ship', 'booster']);
            $table->string('slug')->unique();
            $table->string('display_name');
            // Capacidad a órbita baja en toneladas; nullable porque algunas naves no la definen.
            $table->decimal('max_payload_leo_t', 8, 2)->nullable();
            $table->timestamps();

            // Los selectores del formulario filtran por tipo (nave o booster).
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
