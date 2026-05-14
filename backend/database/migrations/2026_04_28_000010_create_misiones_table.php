<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('misiones', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->enum('status', ['programado', 'confirmado', 'hold', 'cancelado'])->default('programado');

            $table->foreignId('programa_id')->nullable()->constrained('programas')->nullOnDelete();
            $table->foreignId('entidad_id')->nullable()->constrained('entidades')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('usuarios')->nullOnDelete();

            $table->foreignId('nave_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            $table->foreignId('booster_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            $table->foreignId('puerto_espacial_id')->nullable()->constrained('puertos_espaciales')->nullOnDelete();
            $table->foreignId('destino_id')->nullable()->constrained('destinos')->nullOnDelete();
            $table->foreignId('zona_aterrizaje_id')->nullable()->constrained('zonas_aterrizaje')->nullOnDelete();

            $table->enum('tipo_carga', ['Cargo', 'Crew', 'Fuel'])->nullable();
            $table->decimal('masa_carga_t', 10, 3)->nullable();
            $table->dateTime('fecha_lanzamiento');

            $table->text('objetivos_principales')->nullable();
            $table->text('objetivos_secundarios')->nullable();
            $table->string('duracion', 20)->nullable();
            $table->unsignedInteger('tripulacion')->nullable();

            $table->json('cargo_items')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('fecha_lanzamiento');
            $table->index('programa_id');
            $table->index('entidad_id');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('misiones');
    }
};
