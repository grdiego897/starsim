<?php

use App\Models\Usuario;

return [

    /*
    |--------------------------------------------------------------------------
    | Valores predeterminados de autenticación
    |--------------------------------------------------------------------------
    |
    | Esta opción define el "guard" de autenticación y el "broker" de
    | restablecimiento de contraseña predeterminados para tu aplicación.
    | Puedes cambiar estos valores según sea necesario, pero son un
    | comienzo perfecto para la mayoría de las aplicaciones.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Guards de autenticación
    |--------------------------------------------------------------------------
    |
    | A continuación, puedes definir cada guard de autenticación para tu
    | aplicación. Por supuesto, se ha definido una excelente configuración
    | predeterminada para ti que utiliza el almacenamiento de sesiones
    | y el proveedor de usuarios Eloquent.
    |
    | Todos los guards de autenticación tienen un proveedor de usuarios, que
    | define cómo se recuperan realmente los usuarios de tu base de datos
    | u otro sistema de almacenamiento utilizado por la aplicación.
    | Normalmente, se utiliza Eloquent.
    |
    | Soportado: "session"
    |
    */

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Proveedores de usuarios
    |--------------------------------------------------------------------------
    |
    | Todos los guards de autenticación tienen un proveedor de usuarios, que
    | define cómo se recuperan realmente los usuarios de tu base de datos
    | u otro sistema de almacenamiento utilizado por la aplicación.
    | Normalmente, se utiliza Eloquent.
    |
    | Si tienes múltiples tablas o modelos de usuario, puedes configurar
    | múltiples proveedores para representar el modelo / tabla. Estos
    | proveedores pueden luego asignarse a cualquier guard de
    | autenticación adicional que hayas definido.
    |
    | Soportado: "database", "eloquent"
    |
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', Usuario::class),
        ],

        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Restablecimiento de contraseñas
    |--------------------------------------------------------------------------
    |
    | Estas opciones de configuración especifican el comportamiento de la
    | funcionalidad de restablecimiento de contraseña de Laravel, incluyendo
    | la tabla utilizada para el almacenamiento de tokens y el proveedor
    | de usuarios que se invoca para recuperar realmente a los usuarios.
    |
    | El tiempo de expiración es el número de minutos que cada token de
    | restablecimiento se considerará válido. Esta característica de
    | seguridad mantiene los tokens con una vida corta para que tengan
    | menos tiempo de ser adivinados. Puedes cambiar esto según sea necesario.
    |
    | La configuración de throttle es el número de segundos que un usuario
    | debe esperar antes de generar más tokens de restablecimiento de
    | contraseña. Esto evita que el usuario genere rápidamente una gran
    | cantidad de tokens de restablecimiento de contraseña.
    |
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tiempo de espera de confirmación de contraseña
    |--------------------------------------------------------------------------
    |
    | Aquí puedes definir el número de segundos antes de que una ventana de
    | confirmación de contraseña expire y se pida a los usuarios que vuelvan
    | a introducir su contraseña a través de la pantalla de confirmación.
    | Por defecto, el tiempo de espera dura tres horas.
    |
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
