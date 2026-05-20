<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Añade la columna `shell` a `misiones`.
 * "Shell" identifica la capa orbital concreta dentro de un programa
 * (relevante sobre todo para Starlink, que reparte satélites en varias
 * capas a distintas altitudes/inclinaciones). Sólo aplica a algunos
 * programas, de ahí que sea nullable.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('misiones', function (Blueprint $table) {
            // Cadena corta (códigos tipo "G1", "G2-A", etc.) ubicada junto al destino.
            $table->string('shell', 8)->nullable()->after('destino_id');
        });
    }

    public function down(): void
    {
        Schema::table('misiones', function (Blueprint $table) {
            $table->dropColumn('shell');
        });
    }
};
