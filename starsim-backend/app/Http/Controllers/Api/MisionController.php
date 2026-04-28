<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MisionResource;
use App\Models\Destino;
use App\Models\Mision;
use App\Models\Programa;
use App\Models\PuertoEspacial;
use App\Models\Vehiculo;
use App\Models\ZonaAterrizaje;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class MisionController extends Controller
{
    /** Lista todas las misiones (no eliminadas). */
    public function index(): AnonymousResourceCollection
    {
        $misiones = Mision::with([
            'programa', 'entidad', 'nave', 'booster',
            'puertoEspacial', 'destino', 'zonaAterrizaje',
        ])->orderByDesc('created_at')->get();

        return MisionResource::collection($misiones);
    }

    /** Devuelve una misión por id. */
    public function show(int $id): JsonResponse
    {
        $mision = Mision::with([
            'programa', 'entidad', 'nave', 'booster',
            'puertoEspacial', 'destino', 'zonaAterrizaje',
        ])->find($id);

        if (! $mision) {
            return response()->json(['message' => 'Misión no encontrada.'], 404);
        }

        return (new MisionResource($mision))->response();
    }

    /** Crea una nueva misión. */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $this->validatePayload($request, null);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        }

        try {
            $mision = DB::transaction(function () use ($data, $request) {
                $resolved = $this->resolveSlugs($data);
                $resolved['created_by'] = $request->user()->id;
                $resolved['entidad_id'] = $request->user()->entidad_id;

                return Mision::create($resolved);
            });
        } catch (Throwable $e) {
            Log::error('Error creando misión', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'No se pudo crear la misión.'], 500);
        }

        $mision->load(['programa', 'entidad', 'nave', 'booster', 'puertoEspacial', 'destino', 'zonaAterrizaje']);
        return (new MisionResource($mision))->response()->setStatusCode(201);
    }

    /** Actualiza una misión existente. */
    public function update(Request $request, int $id): JsonResponse
    {
        $mision = Mision::find($id);
        if (! $mision) {
            return response()->json(['message' => 'Misión no encontrada.'], 404);
        }

        try {
            $data = $this->validatePayload($request, $mision->id);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        }

        try {
            DB::transaction(function () use ($mision, $data) {
                $resolved = $this->resolveSlugs($data);
                $mision->fill($resolved)->save();
            });
        } catch (Throwable $e) {
            Log::error('Error actualizando misión', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'No se pudo actualizar la misión.'], 500);
        }

        $mision->load(['programa', 'entidad', 'nave', 'booster', 'puertoEspacial', 'destino', 'zonaAterrizaje']);
        return (new MisionResource($mision))->response();
    }

    /** Cambia solo el estado de una misión. */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $mision = Mision::find($id);
        if (! $mision) {
            return response()->json(['message' => 'Misión no encontrada.'], 404);
        }

        try {
            $data = $request->validate([
                'status' => ['required', Rule::in(['programado', 'confirmado', 'hold', 'cancelado'])],
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        }

        try {
            $mision->status = $data['status'];
            $mision->save();
        } catch (Throwable $e) {
            Log::error('Error cambiando estado de misión', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'No se pudo cambiar el estado.'], 500);
        }

        $mision->load(['programa', 'entidad', 'nave', 'booster', 'puertoEspacial', 'destino', 'zonaAterrizaje']);
        return (new MisionResource($mision))->response();
    }

    /** Elimina (soft delete) una misión. */
    public function destroy(int $id): JsonResponse
    {
        $mision = Mision::find($id);
        if (! $mision) {
            return response()->json(['message' => 'Misión no encontrada.'], 404);
        }

        try {
            $mision->delete();
        } catch (Throwable $e) {
            Log::error('Error eliminando misión', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'No se pudo eliminar la misión.'], 500);
        }

        return response()->json(['message' => 'Misión eliminada correctamente.']);
    }

    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    /**
     * Valida y normaliza el payload entrante (formato del frontend).
     * El frontend envía: { name, program, status?, launches: [ { destination, ship, booster, cargoType, cargoMass, port, launchDate, landingType, landingId, advancedConfig: {...} } ] }
     */
    private function validatePayload(Request $request, ?int $ignoreId): array
    {
        $launches = $request->input('launches', []);
        if (! is_array($launches) || count($launches) === 0) {
            throw ValidationException::withMessages([
                'launches' => ['Debe enviar al menos un lanzamiento.'],
            ]);
        }

        // El frontend siempre maneja 1 lanzamiento por misión.
        $launch = $launches[0];

        $payload = [
            'name'                  => $request->input('name'),
            'program'               => $request->input('program'),
            'status'                => $request->input('status', 'programado'),
            'destination'           => $launch['destination']  ?? null,
            'ship'                  => $launch['ship']         ?? null,
            'booster'               => $launch['booster']      ?? null,
            'cargoType'             => $launch['cargoType']    ?? null,
            'cargoMass'             => $launch['cargoMass']    ?? null,
            'port'                  => $launch['port']         ?? null,
            'launchDate'            => $launch['launchDate']   ?? null,
            'landingType'           => $launch['landingType']  ?? null,
            'landingId'             => $launch['landingId']    ?? null,
            'objectivesMain'        => $launch['advancedConfig']['objectivesMain']      ?? null,
            'objectivesSecondary'   => $launch['advancedConfig']['objectivesSecondary'] ?? null,
            'duration'              => $launch['advancedConfig']['duration']            ?? null,
            'crew'                  => $launch['advancedConfig']['crew']                ?? null,
            'cargo'                 => $launch['advancedConfig']['cargo']               ?? [],
        ];

        $validator = validator($payload, [
            'name'                => ['required', 'string', 'max:255',
                                      Rule::unique('misiones', 'name')->ignore($ignoreId)->whereNull('deleted_at')],
            'program'             => ['nullable', 'string', 'max:255'],
            'status'              => ['nullable', Rule::in(['programado', 'confirmado', 'hold', 'cancelado'])],
            'destination'         => ['nullable', 'string', Rule::exists('destinos', 'slug')],
            'ship'                => ['nullable', 'string', Rule::exists('vehiculos', 'slug')],
            'booster'             => ['nullable', 'string', Rule::exists('vehiculos', 'slug')],
            'cargoType'           => ['nullable', Rule::in(['Cargo', 'Crew', 'Fuel'])],
            'cargoMass'           => ['nullable'],
            'port'                => ['nullable', 'string', Rule::exists('puertos_espaciales', 'slug')],
            'launchDate'          => ['required', 'date'],
            'landingType'         => ['nullable', Rule::in(['tower', 'droneship'])],
            'landingId'           => ['nullable', 'string', Rule::exists('zonas_aterrizaje', 'slug')],
            'objectivesMain'      => ['nullable', 'string'],
            'objectivesSecondary' => ['nullable', 'string'],
            'duration'            => ['nullable', 'string', 'max:20'],
            'crew'                => ['nullable'],
            'cargo'               => ['nullable', 'array'],
            'cargo.*.name'        => ['nullable', 'string'],
            'cargo.*.qty'         => ['nullable'],
            'cargo.*.mass'        => ['nullable'],
        ]);

        return $validator->validate();
    }

    /**
     * Convierte slugs validados a IDs y prepara un array listo para Mision::fill().
     */
    private function resolveSlugs(array $data): array
    {
        $masaCarga = null;
        if (! empty($data['cargo']) && is_array($data['cargo'])) {
            $sum = 0.0;
            foreach ($data['cargo'] as $item) {
                $sum += ((float) ($item['qty'] ?? 0)) * ((float) ($item['mass'] ?? 0));
            }
            $masaCarga = $sum;
        } elseif (isset($data['cargoMass'])) {
            $clean = preg_replace('/[^0-9.]/', '', (string) $data['cargoMass']);
            $masaCarga = $clean !== '' ? (float) $clean : null;
        }

        $programaId = null;
        if (! empty($data['program'])) {
            $programa = Programa::firstOrCreate(['name' => trim($data['program'])]);
            $programaId = $programa->id;
        }

        return [
            'name'                  => $data['name'],
            'status'                => $data['status'] ?? 'programado',
            'programa_id'           => $programaId,
            'nave_id'               => $this->slugToId(Vehiculo::class, $data['ship'] ?? null),
            'booster_id'            => $this->slugToId(Vehiculo::class, $data['booster'] ?? null),
            'destino_id'            => $this->slugToId(Destino::class, $data['destination'] ?? null),
            'puerto_espacial_id'    => $this->slugToId(PuertoEspacial::class, $data['port'] ?? null),
            'zona_aterrizaje_id'    => $this->slugToId(ZonaAterrizaje::class, $data['landingId'] ?? null),
            'tipo_carga'            => $data['cargoType'] ?? null,
            'masa_carga_t'          => $masaCarga,
            'fecha_lanzamiento'     => $data['launchDate'],
            'objetivos_principales' => $data['objectivesMain'] ?? null,
            'objetivos_secundarios' => $data['objectivesSecondary'] ?? null,
            'duracion'              => $data['duration'] ?? null,
            'tripulacion'           => isset($data['crew']) && $data['crew'] !== '' ? (int) $data['crew'] : null,
            'cargo_items'           => $data['cargo'] ?? [],
        ];
    }

    private function slugToId(string $modelClass, ?string $slug): ?int
    {
        if (! $slug) {
            return null;
        }
        return $modelClass::where('slug', $slug)->value('id');
    }
}
