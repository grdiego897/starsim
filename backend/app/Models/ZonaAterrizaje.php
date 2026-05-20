<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Zona de aterrizaje asociada a un puerto espacial
 * (plataforma terrestre, droneship en el océano, etc.).
 */
class ZonaAterrizaje extends Model
{
    protected $table = 'zonas_aterrizaje';

    protected $fillable = [
        'slug',
        'name',
        'type',
        'puerto_espacial_id',
    ];

    // ── Relaciones ──

    // Puerto espacial al que pertenece la zona.
    public function puertoEspacial(): BelongsTo
    {
        return $this->belongsTo(PuertoEspacial::class, 'puerto_espacial_id');
    }

    // Misiones que tienen previsto aterrizar en esta zona.
    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'zona_aterrizaje_id');
    }
}
