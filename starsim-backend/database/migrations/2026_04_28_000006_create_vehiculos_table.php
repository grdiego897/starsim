<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['ship', 'booster']);
            $table->string('slug')->unique();
            $table->string('display_name');
            $table->decimal('max_payload_leo_t', 8, 2)->nullable();
            $table->timestamps();

            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
