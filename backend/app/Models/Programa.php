<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Programa extends Model
{
    protected $table = 'programas';

    protected $fillable = [
        'name',
        'description',
        'created_by',
    ];

    public function creador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }

    public function entidades(): BelongsToMany
    {
        return $this->belongsToMany(Entidad::class, 'entidad_programa')
                    ->withPivot('created_at');
    }

    public function misiones(): HasMany
    {
        return $this->hasMany(Mision::class, 'programa_id');
    }
}
