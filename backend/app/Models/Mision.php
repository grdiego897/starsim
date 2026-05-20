<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\SoftDeletes;

/**
 * Misión espacial: lanzamiento concreto encuadrado en un programa.
 * Reúne toda la configuración del vuelo (nave, booster, puerto, destino,
 * zona de aterrizaje, carga útil y objetivos).
 *
 * Usa borrado suave (SoftDeletes) para conservar el histórico.
 */
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
        'shell',
    ];

    // `cargo_items` se persiste como JSON y se expone como array PHP.
    protected $casts = [
        'fecha_lanzamiento' => 'datetime',
        'masa_carga_t'      => 'decimal:3',
        'cargo_items'       => 'array',
    ];

    // ── Relaciones ──

    // Usuario que creó la misión.
    public function creador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }

    // Entidad responsable de la misión.
    public function entidad(): BelongsTo
    {
        return $this->belongsTo(Entidad::class, 'entidad_id');
    }

    // Programa al que pertenece la misión.
    public function programa(): BelongsTo
    {
        return $this->belongsTo(Programa::class, 'programa_id');
    }

    // Nave (vehículo de carga útil) seleccionada para la misión.
    public function nave(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'nave_id');
    }

    // Booster (vehículo de empuje) asignado a la misión.
    public function booster(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'booster_id');
    }

    // Puerto espacial desde el que se realiza el lanzamiento.
    public function puertoEspacial(): BelongsTo
    {
        return $this->belongsTo(PuertoEspacial::class, 'puerto_espacial_id');
    }

    // Destino orbital o planetario de la misión.
    public function destino(): BelongsTo
    {
        return $this->belongsTo(Destino::class, 'destino_id');
    }

    // Zona prevista de aterrizaje del booster/nave reutilizable.
    public function zonaAterrizaje(): BelongsTo
    {
        return $this->belongsTo(ZonaAterrizaje::class, 'zona_aterrizaje_id');
    }
}
