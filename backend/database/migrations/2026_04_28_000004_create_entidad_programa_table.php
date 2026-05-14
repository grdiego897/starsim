<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entidad_programa', function (Blueprint $table) {
            $table->foreignId('entidad_id')->constrained('entidades')->cascadeOnDelete();
            $table->foreignId('programa_id')->constrained('programas')->cascadeOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->primary(['entidad_id', 'programa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entidad_programa');
    }
};
