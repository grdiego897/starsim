<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Destino orbital o planetario al que pueden dirigirse las misiones
 * (LEO, Gateway, Luna, etc.).
 */
class Destino extends Model
{
    protected $table = 'destinos';

    protected $fillable = [
        'slug',
        'display_name',
        'image_path',
    ];

    // ── Relaciones ──

    // Misiones cuyo destino es éste.
    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'destino_id');
    }

    // Vehículos capaces de alcanzar el destino, con la carga máxima admitida
    // como dato pivote (en toneladas).
    public function vehiculos(): BelongsToMany
    {
        return $this->belongsToMany(Vehiculo::class, 'vehiculo_destino_capacidades')
                    ->withPivot('carga_maxima_t');
    }
}
