<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla central del dominio: `misiones`.
 * Concentra todos los datos de un lanzamiento concreto y enlaza con
 * el resto de catálogos (programa, entidad, vehículos, puerto, destino,
 * zona de aterrizaje). Usa soft-deletes para preservar histórico.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('misiones', function (Blueprint $table) {
            $table->id();
            // El nombre identifica la misión en el panel; debe ser único.
            $table->string('name')->unique();
            // Ciclo de vida operacional de la misión.
            $table->enum('status', ['programado', 'confirmado', 'hold', 'cancelado'])->default('programado');

            // ── Relaciones contextuales ──
            // Todas son nullable + nullOnDelete: al borrar el catálogo asociado, la misión
            // se conserva como dato histórico pero pierde el vínculo.
            $table->foreignId('programa_id')->nullable()->constrained('programas')->nullOnDelete();
            $table->foreignId('entidad_id')->nullable()->constrained('entidades')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('usuarios')->nullOnDelete();

            // ── Configuración del vuelo ──
            // nave_id y booster_id apuntan a la misma tabla `vehiculos` (discriminada por type).
            $table->foreignId('nave_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            $table->foreignId('booster_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            $table->foreignId('puerto_espacial_id')->nullable()->constrained('puertos_espaciales')->nullOnDelete();
            $table->foreignId('destino_id')->nullable()->constrained('destinos')->nullOnDelete();
            $table->foreignId('zona_aterrizaje_id')->nullable()->constrained('zonas_aterrizaje')->nullOnDelete();

            // ── Carga útil ──
            $table->enum('tipo_carga', ['Cargo', 'Crew', 'Fuel'])->nullable();
            // 10,3 permite hasta 9 999 999.999 t — sobra para cualquier vehículo real.
            $table->decimal('masa_carga_t', 10, 3)->nullable();
            $table->dateTime('fecha_lanzamiento');

            // ── Configuración avanzada ──
            $table->text('objetivos_principales')->nullable();
            $table->text('objetivos_secundarios')->nullable();
            $table->string('duracion', 20)->nullable();
            $table->unsignedInteger('tripulacion')->nullable();

            // Lista de items de carga (qty + name + mass) serializada como JSON
            // — estructura libre que se persiste tal cual la envía el frontend.
            $table->json('cargo_items')->nullable();

            $table->timestamps();
            // Permite "borrar" sin perder histórico para informes y auditoría.
            $table->softDeletes();

            // Índices para los filtros y ordenaciones más habituales (panel, programa, próximos lanzamientos).
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
