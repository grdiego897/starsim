<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidad;
use Illuminate\Http\JsonResponse;

class EntidadController extends Controller
{
    /** Lista todas las entidades disponibles (sólo id, name, slug). */
    public function index(): JsonResponse
    {
        $entidades = Entidad::orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn ($e) => [
                'id'   => $e->id,
                'name' => $e->name,
                'slug' => $e->slug,
            ]);

        return response()->json(['entidades' => $entidades]);
    }
}
