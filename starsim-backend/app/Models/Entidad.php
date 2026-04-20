<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entidad extends Model
{
    protected $table = 'entidades';

    protected $fillable = [
        'name',
        'slug',
        'logo_path',
        'description',
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'entidad_id');
    }

    public function programas()
    {
        return $this->belongsToMany(Programa::class, 'entidad_programa')
                    ->withPivot('created_at');
    }
}
