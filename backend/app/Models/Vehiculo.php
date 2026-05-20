<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Vehículo de lanzamiento: nave o booster
 * (Falcon 9, Falcon Heavy, Super Heavy, Starship, Dragon, …).
 * El campo `type` discrimina entre nave y booster.
 */
class Vehiculo extends Model
{
    protected $table = 'vehiculos';

    protected $fillable = [
        'type',
        'slug',
        'display_name',
        'max_payload_leo_t',
    ];

    // ── Relaciones ──

    // Misiones en las que este vehículo actúa como nave.
    public function misionesComoNave(): HasMany
    {
        return $this->hasMany(Mision::class, 'nave_id');
    }

    // Misiones en las que este vehículo actúa como booster.
    public function misionesComoBooster(): HasMany
    {
        return $this->hasMany(Mision::class, 'booster_id');
    }

    // Destinos alcanzables con la carga máxima soportada en cada caso.
    public function destinos(): BelongsToMany
    {
        return $this->belongsToMany(Destino::class, 'vehiculo_destino_capacidades')
                    ->withPivot('carga_maxima_t');
    }
}
