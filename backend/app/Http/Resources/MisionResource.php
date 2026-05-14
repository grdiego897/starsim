<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MisionResource extends JsonResource
{
    /**
     * Serializa una misión con la forma esperada por el frontend
     * (compatible con el antiguo formato de localStorage: name + launches[]).
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing([
            'programa', 'entidad', 'nave', 'booster',
            'puertoEspacial', 'destino', 'zonaAterrizaje',
        ]);

        $launch = [
            'id'           => (string) $this->id,
            'destination'  => $this->destino?->slug,
            'ship'         => $this->nave?->slug,
            'booster'      => $this->booster?->slug,
            'cargoType'    => $this->tipo_carga,
            'cargoMass'    => $this->masa_carga_t !== null ? ((float) $this->masa_carga_t) . ' t' : null,
            'port'         => $this->puertoEspacial?->slug,
            'launchDate'   => optional($this->fecha_lanzamiento)->format('Y-m-d\TH:i'),
            'landingType'  => $this->zonaAterrizaje?->type,
            'landingId'    => $this->zonaAterrizaje?->slug,
            'shell'        => $this->shell,
            'createdAt'    => optional($this->created_at)->toISOString(),
            'advancedConfig' => [
                'objectivesMain'      => $this->objetivos_principales,
                'objectivesSecondary' => $this->objetivos_secundarios,
                'duration'            => $this->duracion,
                'crew'                => $this->tripulacion !== null ? (string) $this->tripulacion : '',
                'cargo'               => $this->cargo_items ?? [],
            ],
        ];

        return [
            'id'          => (string) $this->id,
            'name'        => $this->name,
            'status'      => $this->status,
            'program'     => $this->programa?->name ?? '',
            'programId'   => $this->programa_id,
            'entidadId'   => $this->entidad_id,
            'entidad'     => $this->entidad ? [
                'id'   => $this->entidad->id,
                'name' => $this->entidad->name,
                'slug' => $this->entidad->slug,
            ] : null,
            'createdBy'   => $this->created_by,
            'createdAt'   => optional($this->created_at)->toISOString(),
            'updatedAt'   => optional($this->updated_at)->toISOString(),
            'launchDate'  => optional($this->fecha_lanzamiento)->format('Y-m-d\TH:i'),
            'port'        => $this->puertoEspacial?->slug,
            'shell'       => $this->shell,
            'launches'    => [$launch],
        ];
    }
}
