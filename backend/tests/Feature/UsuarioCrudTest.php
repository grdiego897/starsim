<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Database\Factories\EntidadFactory;
use Database\Factories\UsuarioFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UsuarioCrudTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(string $password = 'admin-pass'): Usuario
    {
        $admin = UsuarioFactory::new()->admin()->create([
            'password' => Hash::make($password),
        ]);
        Sanctum::actingAs($admin);
        return $admin;
    }

    public function test_index_lista_usuarios_para_admin(): void
    {
        $this->actingAsAdmin();
        UsuarioFactory::new()->count(3)->create();

        $this->getJson('/api/usuarios')
            ->assertOk()
            ->assertJsonStructure(['usuarios' => [['id', 'name', 'email', 'role', 'entidad']]])
            ->assertJsonCount(4, 'usuarios'); // 3 + admin autenticado
    }

    public function test_index_prohibido_para_no_admin(): void
    {
        $viewer = UsuarioFactory::new()->viewer()->create();
        Sanctum::actingAs($viewer);

        $this->getJson('/api/usuarios')->assertStatus(403);
    }

    public function test_index_requiere_autenticacion(): void
    {
        $this->getJson('/api/usuarios')->assertStatus(401);
    }

    public function test_store_crea_un_usuario(): void
    {
        $this->actingAsAdmin('admin-pass');
        $entidad = EntidadFactory::new()->create();

        $payload = [
            'name'           => 'Juan Pérez',
            'email'          => 'juan@test.com',
            'password'       => 'password123',
            'role'           => 'operator',
            'entidad_id'     => $entidad->id,
            'admin_password' => 'admin-pass',
        ];

        $this->postJson('/api/usuarios', $payload)
            ->assertStatus(201)
            ->assertJsonPath('usuario.email', 'juan@test.com')
            ->assertJsonPath('usuario.role', 'operator')
            ->assertJsonPath('usuario.entidad.id', $entidad->id);

        $this->assertDatabaseHas('usuarios', [
            'email' => 'juan@test.com',
            'role'  => 'operator',
        ]);

        $created = Usuario::where('email', 'juan@test.com')->first();
        $this->assertTrue(Hash::check('password123', $created->password));
    }

    public function test_store_falla_con_contrasena_de_admin_incorrecta(): void
    {
        $this->actingAsAdmin('admin-pass');

        $this->postJson('/api/usuarios', [
            'name'           => 'Foo',
            'email'          => 'foo@test.com',
            'password'       => 'password123',
            'role'           => 'viewer',
            'admin_password' => 'wrong-pass',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['admin_password']);

        $this->assertDatabaseMissing('usuarios', ['email' => 'foo@test.com']);
    }

    public function test_store_falla_con_datos_invalidos(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/usuarios', [
            'name'     => '',
            'email'    => 'no-es-email',
            'password' => 'corta',
            'role'     => 'rol-invalido',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role', 'admin_password']);
    }

    public function test_store_email_unico(): void
    {
        $this->actingAsAdmin('admin-pass');
        UsuarioFactory::new()->create(['email' => 'dup@test.com']);

        $this->postJson('/api/usuarios', [
            'name'           => 'Otro',
            'email'          => 'dup@test.com',
            'password'       => 'password123',
            'role'           => 'viewer',
            'admin_password' => 'admin-pass',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_update_actualiza_un_usuario(): void
    {
        $this->actingAsAdmin('admin-pass');
        $usuario = UsuarioFactory::new()->viewer()->create(['name' => 'Original']);

        $this->putJson("/api/usuarios/{$usuario->id}", [
            'name'           => 'Editado',
            'role'           => 'operator',
            'admin_password' => 'admin-pass',
        ])->assertOk()
            ->assertJsonPath('usuario.name', 'Editado')
            ->assertJsonPath('usuario.role', 'operator');

        $usuario->refresh();
        $this->assertSame('Editado', $usuario->name);
        $this->assertSame('operator', $usuario->role);
    }

    public function test_update_no_modifica_contrasena_si_va_vacia(): void
    {
        $this->actingAsAdmin('admin-pass');
        $usuario = UsuarioFactory::new()->create(['password' => Hash::make('original-pass')]);

        $this->putJson("/api/usuarios/{$usuario->id}", [
            'name'           => 'Solo nombre',
            'password'       => null,
            'admin_password' => 'admin-pass',
        ])->assertOk();

        $this->assertTrue(Hash::check('original-pass', $usuario->fresh()->password));
    }

    public function test_update_404_si_no_existe(): void
    {
        $this->actingAsAdmin('admin-pass');

        $this->putJson('/api/usuarios/99999', [
            'name'           => 'X',
            'admin_password' => 'admin-pass',
        ])->assertStatus(404);
    }
}
