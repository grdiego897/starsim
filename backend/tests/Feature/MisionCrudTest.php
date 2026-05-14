<?php

namespace Tests\Feature;

use App\Models\Mision;
use Database\Factories\DestinoFactory;
use Database\Factories\EntidadFactory;
use Database\Factories\PuertoEspacialFactory;
use Database\Factories\UsuarioFactory;
use Database\Factories\VehiculoFactory;
use Database\Factories\ZonaAterrizajeFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MisionCrudTest extends TestCase
{
    use RefreshDatabase;

    /** Crea una usuario operator con entidad y autentica. */
    private function actingAsOperator(): array
    {
        $entidad = EntidadFactory::new()->create();
        $user = UsuarioFactory::new()->operator()->create(['entidad_id' => $entidad->id]);
        Sanctum::actingAs($user);
        return [$user, $entidad];
    }

    /** Genera el payload mínimo válido que espera el controlador. */
    private function payload(array $overrides = []): array
    {
        $destino = DestinoFactory::new()->create();
        $nave    = VehiculoFactory::new()->ship()->create();
        $booster = VehiculoFactory::new()->booster()->create();
        $puerto  = PuertoEspacialFactory::new()->create();
        $zona    = ZonaAterrizajeFactory::new()->tower()->create(['puerto_espacial_id' => $puerto->id]);

        return array_merge([
            'name'     => 'Misión Test',
            'program'  => 'Programa Alpha',
            'status'   => 'programado',
            'launches' => [[
                'destination' => $destino->slug,
                'ship'        => $nave->slug,
                'booster'     => $booster->slug,
                'cargoType'   => 'Cargo',
                'cargoMass'   => '12.5',
                'port'        => $puerto->slug,
                'launchDate'  => '2026-09-15T10:30',
                'landingType' => 'tower',
                'landingId'   => $zona->slug,
                'shell'       => 'S1',
                'advancedConfig' => [
                    'objectivesMain'      => 'Despliegue de satélites',
                    'objectivesSecondary' => 'Pruebas atmosféricas',
                    'duration'            => '3d',
                    'crew'                => '4',
                    'cargo'               => [
                        ['name' => 'Sat A', 'qty' => 2, 'mass' => 1.5],
                        ['name' => 'Sat B', 'qty' => 1, 'mass' => 3.0],
                    ],
                ],
            ]],
        ], $overrides);
    }

    public function test_index_lista_misiones(): void
    {
        [$user] = $this->actingAsOperator();
        Mision::create([
            'name'              => 'M1',
            'status'            => 'programado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-09-15 10:00:00',
        ]);
        Mision::create([
            'name'              => 'M2',
            'status'            => 'confirmado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-10-01 12:00:00',
        ]);

        $this->getJson('/api/misiones')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_show_devuelve_una_mision(): void
    {
        [$user] = $this->actingAsOperator();
        $mision = Mision::create([
            'name'              => 'M-show',
            'status'            => 'programado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-09-15 10:00:00',
        ]);

        $this->getJson("/api/misiones/{$mision->id}")
            ->assertOk()
            ->assertJsonPath('data.id', (string) $mision->id)
            ->assertJsonPath('data.name', 'M-show');
    }

    public function test_show_404_si_no_existe(): void
    {
        $this->actingAsOperator();
        $this->getJson('/api/misiones/99999')->assertStatus(404);
    }

    public function test_index_y_show_requieren_autenticacion(): void
    {
        $this->getJson('/api/misiones')->assertStatus(401);
        $this->getJson('/api/misiones/1')->assertStatus(401);
    }

    public function test_viewer_puede_listar_pero_no_crear(): void
    {
        $viewer = UsuarioFactory::new()->viewer()->create();
        Sanctum::actingAs($viewer);

        $this->getJson('/api/misiones')->assertOk();
        $this->postJson('/api/misiones', $this->payload())->assertStatus(403);
    }

    public function test_store_crea_una_mision(): void
    {
        [$user, $entidad] = $this->actingAsOperator();

        $response = $this->postJson('/api/misiones', $this->payload(['name' => 'Misión Nueva']))
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Misión Nueva')
            ->assertJsonPath('data.status', 'programado')
            ->assertJsonPath('data.entidad.id', $entidad->id);

        $this->assertDatabaseHas('misiones', [
            'name'       => 'Misión Nueva',
            'status'     => 'programado',
            'created_by' => $user->id,
            'entidad_id' => $entidad->id,
        ]);

        // La masa de carga debe calcularse sumando cargo (qty * mass) = 2*1.5 + 1*3 = 6
        $mision = Mision::where('name', 'Misión Nueva')->first();
        $this->assertEquals(6.0, (float) $mision->masa_carga_t);
        $this->assertIsArray($mision->cargo_items);
        $this->assertCount(2, $mision->cargo_items);

        // El programa debe haberse creado por firstOrCreate
        $this->assertDatabaseHas('programas', ['name' => 'Programa Alpha']);
    }

    public function test_store_falla_sin_lanzamientos(): void
    {
        $this->actingAsOperator();

        $this->postJson('/api/misiones', [
            'name'     => 'Sin lanzamientos',
            'launches' => [],
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['launches']);
    }

    public function test_store_falla_con_nombre_duplicado(): void
    {
        [$user] = $this->actingAsOperator();
        Mision::create([
            'name'              => 'Repetida',
            'status'            => 'programado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-09-15 10:00:00',
        ]);

        $this->postJson('/api/misiones', $this->payload(['name' => 'Repetida']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_store_falla_con_slugs_inexistentes(): void
    {
        $this->actingAsOperator();

        $payload = $this->payload();
        $payload['launches'][0]['destination'] = 'no-existe';
        $payload['launches'][0]['ship']        = 'tampoco-existe';

        $this->postJson('/api/misiones', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['destination', 'ship']);
    }

    public function test_update_modifica_una_mision(): void
    {
        [$user] = $this->actingAsOperator();
        $mision = Mision::create([
            'name'              => 'Original',
            'status'            => 'programado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-09-15 10:00:00',
        ]);

        $payload = $this->payload(['name' => 'Renombrada', 'status' => 'confirmado']);

        $this->putJson("/api/misiones/{$mision->id}", $payload)
            ->assertOk()
            ->assertJsonPath('data.name', 'Renombrada')
            ->assertJsonPath('data.status', 'confirmado');

        $this->assertDatabaseHas('misiones', [
            'id'     => $mision->id,
            'name'   => 'Renombrada',
            'status' => 'confirmado',
        ]);
    }

    public function test_update_404_si_no_existe(): void
    {
        $this->actingAsOperator();
        $this->putJson('/api/misiones/99999', $this->payload())->assertStatus(404);
    }

    public function test_update_status_cambia_solo_el_estado(): void
    {
        [$user] = $this->actingAsOperator();
        $mision = Mision::create([
            'name'              => 'Estado',
            'status'            => 'programado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-09-15 10:00:00',
        ]);

        $this->patchJson("/api/misiones/{$mision->id}/status", ['status' => 'cancelado'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelado');

        $this->assertSame('cancelado', $mision->fresh()->status);
    }

    public function test_update_status_rechaza_estado_invalido(): void
    {
        [$user] = $this->actingAsOperator();
        $mision = Mision::create([
            'name'              => 'Estado2',
            'status'            => 'programado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-09-15 10:00:00',
        ]);

        $this->patchJson("/api/misiones/{$mision->id}/status", ['status' => 'inventado'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_destroy_hace_soft_delete(): void
    {
        [$user] = $this->actingAsOperator();
        $mision = Mision::create([
            'name'              => 'A borrar',
            'status'            => 'programado',
            'created_by'        => $user->id,
            'fecha_lanzamiento' => '2026-09-15 10:00:00',
        ]);

        $this->deleteJson("/api/misiones/{$mision->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Misión eliminada correctamente.');

        $this->assertSoftDeleted('misiones', ['id' => $mision->id]);
    }

    public function test_destroy_404_si_no_existe(): void
    {
        $this->actingAsOperator();
        $this->deleteJson('/api/misiones/99999')->assertStatus(404);
    }
}
