<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destino extends Model
{
    protected $table = 'destinos';

    protected $fillable = [
        'slug',
        'display_name',
        'image_path',
    ];

    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'destino_id');
    }

    public function vehiculos(): BelongsToMany
    {
        return $this->belongsToMany(Vehiculo::class, 'vehiculo_destino_capacidades')
                    ->withPivot('carga_maxima_t');
    }
}
