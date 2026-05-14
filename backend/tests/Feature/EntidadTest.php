<?php

namespace Tests\Feature;

use Database\Factories\EntidadFactory;
use Database\Factories\UsuarioFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EntidadTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lista_entidades_para_admin(): void
    {
        $admin = UsuarioFactory::new()->admin()->create();
        Sanctum::actingAs($admin);

        EntidadFactory::new()->count(3)->create();

        $this->getJson('/api/entidades')
            ->assertOk()
            ->assertJsonStructure(['entidades' => [['id', 'name', 'slug']]])
            ->assertJsonCount(4, 'entidades'); // 3 + la del admin
    }

    public function test_index_prohibido_para_no_admin(): void
    {
        $viewer = UsuarioFactory::new()->viewer()->create();
        Sanctum::actingAs($viewer);

        $this->getJson('/api/entidades')->assertStatus(403);
    }

    public function test_index_requiere_autenticacion(): void
    {
        $this->getJson('/api/entidades')->assertStatus(401);
    }
}
