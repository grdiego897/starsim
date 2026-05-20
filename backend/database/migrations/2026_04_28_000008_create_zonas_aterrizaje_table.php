<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `zonas_aterrizaje`: torres y droneships donde aterrizan
 * los boosters reutilizables tras el lanzamiento.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zonas_aterrizaje', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            // tower = plataforma terrestre; droneship = plataforma marítima autónoma.
            $table->enum('type', ['tower', 'droneship']);
            // Puerto asociado opcional: hay zonas "genéricas" que no se atan a un puerto concreto.
            $table->foreignId('puerto_espacial_id')->nullable()->constrained('puertos_espaciales')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zonas_aterrizaje');
    }
};
