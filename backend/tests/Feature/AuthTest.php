<?php

namespace Tests\Feature;

use Database\Factories\EntidadFactory;
use Database\Factories\UsuarioFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_devuelve_token_y_usuario_con_credenciales_validas(): void
    {
        $entidad = EntidadFactory::new()->create();
        $user = UsuarioFactory::new()->create([
            'email'      => 'admin@test.com',
            'password'   => Hash::make('secret123'),
            'role'       => 'admin',
            'entidad_id' => $entidad->id,
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'admin@test.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role', 'entidad'],
            ])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonPath('user.entidad.id', $entidad->id);
    }

    public function test_login_falla_con_credenciales_invalidas(): void
    {
        UsuarioFactory::new()->create([
            'email'    => 'foo@test.com',
            'password' => Hash::make('correct-pass'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'foo@test.com',
            'password' => 'wrong-pass',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_revoca_tokens_anteriores(): void
    {
        $user = UsuarioFactory::new()->create([
            'email'    => 'bar@test.com',
            'password' => Hash::make('pass1234'),
        ]);

        $user->createToken('old-token');
        $this->assertSame(1, $user->tokens()->count());

        $this->postJson('/api/login', [
            'email'    => 'bar@test.com',
            'password' => 'pass1234',
        ])->assertOk();

        $this->assertSame(1, $user->tokens()->count());
        $this->assertFalse($user->tokens()->where('name', 'old-token')->exists());
    }

    public function test_logout_revoca_el_token_actual(): void
    {
        $user = UsuarioFactory::new()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Sesión cerrada correctamente.');
    }

    public function test_me_devuelve_el_usuario_autenticado(): void
    {
        $user = UsuarioFactory::new()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_me_requiere_autenticacion(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
    }

    public function test_update_me_actualiza_el_nombre(): void
    {
        $user = UsuarioFactory::new()->create(['name' => 'Original']);
        Sanctum::actingAs($user);

        $this->patchJson('/api/me', ['name' => 'Nuevo Nombre'])
            ->assertOk()
            ->assertJsonPath('user.name', 'Nuevo Nombre');

        $this->assertSame('Nuevo Nombre', $user->fresh()->name);
    }

    public function test_update_me_falla_si_la_contrasena_actual_es_incorrecta(): void
    {
        $user = UsuarioFactory::new()->create([
            'password' => Hash::make('real-pass'),
        ]);
        Sanctum::actingAs($user);

        $this->patchJson('/api/me', [
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
            'current_password'      => 'wrong-pass',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }
}
