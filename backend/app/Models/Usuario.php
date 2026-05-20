<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Usuario de la aplicación.
 * Gestiona la autenticación vía Sanctum (tokens API) y el control de
 * permisos basado en roles: admin > operator > viewer.
 * Puede pertenecer opcionalmente a una entidad.
 */
class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'entidad_id',
    ];

    // La contraseña nunca se serializa en las respuestas JSON.
    protected $hidden = [
        'password',
    ];

    // Hashing automático de la contraseña al asignarla.
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // ── Relaciones ──

    // Entidad a la que pertenece el usuario (puede ser null).
    public function entidad()
    {
        return $this->belongsTo(Entidad::class, 'entidad_id');
    }

    // ── Helpers roles ──

    // Rol con permisos completos sobre la aplicación.
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Puede crear y editar misiones, pero no gestionar usuarios.
    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    // Sólo lectura: no puede modificar ni crear recursos.
    public function isViewer(): bool
    {
        return $this->role === 'viewer';
    }

    /**
     * Verifica si el usuario tiene al menos el nivel de privilegio indicado.
     * admin > operator > viewer
     */
    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles);
    }
}
