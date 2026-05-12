<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('misiones', function (Blueprint $table) {
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
