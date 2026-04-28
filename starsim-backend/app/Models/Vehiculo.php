<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehiculo extends Model
{
    protected $table = 'vehiculos';

    protected $fillable = [
        'type',
        'slug',
        'display_name',
        'max_payload_leo_t',
    ];

    public function misionesComoNave(): HasMany
    {
        return $this->hasMany(Mision::class, 'nave_id');
    }

    public function misionesComoBooster(): HasMany
    {
        return $this->hasMany(Mision::class, 'booster_id');
    }

    public function destinos(): BelongsToMany
    {
        return $this->belongsToMany(Destino::class, 'vehiculo_destino_capacidades')
                    ->withPivot('carga_maxima_t');
    }
}
