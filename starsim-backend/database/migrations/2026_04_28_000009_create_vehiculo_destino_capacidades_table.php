<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehiculo_destino_capacidades', function (Blueprint $table) {
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->cascadeOnDelete();
            $table->foreignId('destino_id')->constrained('destinos')->cascadeOnDelete();
            $table->decimal('carga_maxima_t', 8, 2);

            $table->primary(['vehiculo_id', 'destino_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculo_destino_capacidades');
    }
};
