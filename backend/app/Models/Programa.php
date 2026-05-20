<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Programa espacial bajo el que se agrupan misiones
 * (p. ej. Starlink, Artemis).
 */
class Programa extends Model
{
    protected $table = 'programas';

    protected $fillable = [
        'name',
        'description',
        'created_by',
    ];

    // ── Relaciones ──

    // Usuario que dio de alta el programa.
    public function creador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }

    // Entidades que participan en el programa.
    public function entidades(): BelongsToMany
    {
        return $this->belongsToMany(Entidad::class, 'entidad_programa')
                    ->withPivot('created_at');
    }

    // Misiones planificadas dentro del programa.
    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'programa_id');
    }
}
