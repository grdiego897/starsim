<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Puerto espacial desde el que se efectúan los lanzamientos
 * (Starbase, Cabo Cañaveral, Vandenberg, etc.).
 */
class PuertoEspacial extends Model
{
    protected $table = 'puertos_espaciales';

    protected $fillable = [
        'slug',
        'name',
        'latitude',
        'longitude',
        'country',
    ];

    // Coordenadas geográficas con precisión de 7 decimales.
    protected $casts = [
        'latitude'  => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    // ── Relaciones ──

    // Zonas de aterrizaje (terrestres o droneships) asociadas al puerto.
    public function zonasAterrizaje(): HasMany
    {
        return $this->hasMany(ZonaAterrizaje::class, 'puerto_espacial_id');
    }

    // Misiones que parten desde este puerto.
    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'puerto_espacial_id');
    }
}
