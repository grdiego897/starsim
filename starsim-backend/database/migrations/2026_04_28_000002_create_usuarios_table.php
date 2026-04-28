<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'operator', 'viewer'])->default('viewer');
            $table->foreignId('entidad_id')->nullable()->constrained('entidades')->nullOnDelete();
            $table->rememberToken();
            $table->timestamps();

            $table->index('entidad_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
