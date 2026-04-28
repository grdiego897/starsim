<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ZonaAterrizaje extends Model
{
    protected $table = 'zonas_aterrizaje';

    protected $fillable = [
        'slug',
        'name',
        'type',
        'puerto_espacial_id',
    ];

    public function puertoEspacial(): BelongsTo
    {
        return $this->belongsTo(PuertoEspacial::class, 'puerto_espacial_id');
    }

    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'zona_aterrizaje_id');
    }
}
