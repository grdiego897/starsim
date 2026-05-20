<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Entidad organizativa propietaria de programas y usuarios
 * (p. ej. SpaceX, NASA, ESA).
 */
class Entidad extends Model
{
    protected $table = 'entidades';

    protected $fillable = [
        'name',
        'slug',
        'logo_path',
        'description',
    ];

    // ── Relaciones ──

    // Usuarios que pertenecen a esta entidad.
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'entidad_id');
    }

    // Programas en los que participa la entidad (relación N:M con fecha de alta).
    public function programas()
    {
        return $this->belongsToMany(Programa::class, 'entidad_programa')
                    ->withPivot('created_at');
    }
}
