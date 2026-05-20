<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla pivot N:M entre `entidades` y `programas`:
 * una entidad participa en muchos programas y cada programa puede
 * contar con varias entidades colaboradoras.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entidad_programa', function (Blueprint $table) {
            // Borrado en cascada: si desaparece la entidad o el programa, el vínculo deja de tener sentido.
            $table->foreignId('entidad_id')->constrained('entidades')->cascadeOnDelete();
            $table->foreignId('programa_id')->constrained('programas')->cascadeOnDelete();
            // Sólo created_at — la relación no se "modifica", se crea o se borra.
            $table->timestamp('created_at')->nullable();

            // Clave primaria compuesta: evita duplicados sin necesidad de un id sintético.
            $table->primary(['entidad_id', 'programa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entidad_programa');
    }
};
