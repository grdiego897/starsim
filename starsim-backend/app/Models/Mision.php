<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mision extends Model
{
    use SoftDeletes;

    protected $table = 'misiones';

    protected $fillable = [
        'name',
        'status',
        'programa_id',
        'entidad_id',
        'created_by',
        'nave_id',
        'booster_id',
        'puerto_espacial_id',
        'destino_id',
        'zona_aterrizaje_id',
        'tipo_carga',
        'masa_carga_t',
        'fecha_lanzamiento',
        'objetivos_principales',
        'objetivos_secundarios',
        'duracion',
        'tripulacion',
        'cargo_items',
    ];

    protected $casts = [
        'fecha_lanzamiento' => 'datetime',
        'masa_carga_t'      => 'decimal:3',
        'cargo_items'       => 'array',
    ];

    public function creador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }

    public function entidad(): BelongsTo
    {
        return $this->belongsTo(Entidad::class, 'entidad_id');
    }

    public function programa(): BelongsTo
    {
        return $this->belongsTo(Programa::class, 'programa_id');
    }

    public function nave(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'nave_id');
    }

    public function booster(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'booster_id');
    }

    public function puertoEspacial(): BelongsTo
    {
        return $this->belongsTo(PuertoEspacial::class, 'puerto_espacial_id');
    }

    public function destino(): BelongsTo
    {
        return $this->belongsTo(Destino::class, 'destino_id');
    }

    public function zonaAterrizaje(): BelongsTo
    {
        return $this->belongsTo(ZonaAterrizaje::class, 'zona_aterrizaje_id');
    }
}
