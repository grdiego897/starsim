<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    protected $casts = [
        'latitude'  => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function zonasAterrizaje(): HasMany
    {
        return $this->hasMany(ZonaAterrizaje::class, 'puerto_espacial_id');
    }

    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'puerto_espacial_id');
    }
}
