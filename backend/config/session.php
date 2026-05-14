<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Controlador de sesión predeterminado
    |--------------------------------------------------------------------------
    |
    | Esta opción determina el controlador de sesión predeterminado que se
    | utilizará para las solicitudes entrantes. Laravel soporta una variedad
    | de opciones de almacenamiento. La base de datos es una excelente opción.
    |
    | Soportados: "file", "cookie", "database", "memcached",
    |            "redis", "dynamodb", "array"
    |
    */

    'driver' => env('SESSION_DRIVER', 'database'),

    /*
    |--------------------------------------------------------------------------
    | Vida útil de la sesión
    |--------------------------------------------------------------------------
    |
    | Aquí puedes especificar el número de minutos que deseas que la sesión
    | permanezca inactiva antes de que expire. Si deseas que expiren
    | inmediatamente al cerrar el navegador, puedes indicarlo a través
    | de la opción de configuración expire_on_close.
    |
    */

    'lifetime' => (int) env('SESSION_LIFETIME', 120),

    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),

    /*
    |--------------------------------------------------------------------------
    | Cifrado de la sesión
    |--------------------------------------------------------------------------
    |
    | Esta opción te permite especificar fácilmente que todos los datos de
    | tu sesión deben ser cifrados antes de ser almacenados. Todo el cifrado
    | es realizado automáticamente por Laravel y puedes usar la sesión normal.
    |
    */

    'encrypt' => env('SESSION_ENCRYPT', false),

    /*
    |--------------------------------------------------------------------------
    | Ubicación de los archivos de sesión
    |--------------------------------------------------------------------------
    |
    | Cuando se utiliza el controlador de sesión "file", los archivos de sesión
    | se colocan en el disco. La ubicación de almacenamiento predeterminada
    | se define aquí; sin embargo, eres libre de proporcionar otra ubicación.
    |
    */

    'files' => storage_path('framework/sessions'),

    /*
    |--------------------------------------------------------------------------
    | Conexión de base de datos de sesión
    |--------------------------------------------------------------------------
    |
    | Cuando se utilizan los controladores de sesión "database" o "redis", puedes
    | especificar una conexión que deba utilizarse para gestionar estas sesiones.
    | Esto debe corresponder a una conexión en tus opciones de configuración.
    |
    */

    'connection' => env('SESSION_CONNECTION'),

    /*
    |--------------------------------------------------------------------------
    | Tabla de base de datos de sesión
    |--------------------------------------------------------------------------
    |
    | Cuando se utiliza el controlador de sesión "database", puedes especificar
    | la tabla que se utilizará para almacenar las sesiones. Por supuesto,
    | se define un valor predeterminado sensato para ti.
    |
    */

    'table' => env('SESSION_TABLE', 'sessions'),

    /*
    |--------------------------------------------------------------------------
    | Almacén de caché de sesión
    |--------------------------------------------------------------------------
    |
    | Cuando se utiliza uno de los backends de sesión basados en caché del
    | framework, puedes definir el almacén de caché que debe utilizarse.
    | Esto debe coincidir con uno de tus almacenes de caché definidos.
    |
    | Afecta a: "dynamodb", "memcached", "redis"
    |
    */

    'store' => env('SESSION_STORE'),

    /*
    |--------------------------------------------------------------------------
    | Lotería de limpieza de sesiones
    |--------------------------------------------------------------------------
    |
    | Algunos controladores de sesión deben limpiar manualmente su ubicación de
    | almacenamiento para deshacerse de las sesiones antiguas. Aquí están las
    | probabilidades de que ocurra en una solicitud. Por defecto es 2 de 100.
    |
    */

    'lottery' => [2, 100],

    /*
    |--------------------------------------------------------------------------
    | Nombre de la cookie de sesión
    |--------------------------------------------------------------------------
    |
    | Aquí puedes cambiar el nombre de la cookie de sesión creada por el
    | framework. Normalmente, no deberías necesitar cambiar este valor, ya
    | que hacerlo no otorga una mejora de seguridad significativa.
    |
    */

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug((string) env('APP_NAME', 'laravel')).'-session'
    ),

    /*
    |--------------------------------------------------------------------------
    | Ruta de la cookie de sesión
    |--------------------------------------------------------------------------
    |
    | La ruta de la cookie de sesión determina la ruta para la cual la cookie
    | se considerará disponible. Normalmente, esta será la ruta raíz de
    | tu aplicación, pero eres libre de cambiar esto cuando sea necesario.
    |
    */

    'path' => env('SESSION_PATH', '/'),

    /*
    |--------------------------------------------------------------------------
    | Dominio de la cookie de sesión
    |--------------------------------------------------------------------------
    |
    | Este valor determina el dominio y los subdominios para los que la
    | cookie de sesión está disponible. Por defecto, la cookie estará
    | disponible para el dominio raíz sin subdominios.
    |
    */

    'domain' => env('SESSION_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Cookies solo por HTTPS
    |--------------------------------------------------------------------------
    |
    | Al establecer esta opción a true, las cookies de sesión solo se enviarán
    | de vuelta al servidor si el navegador tiene una conexión HTTPS. Esto
    | evitará que la cookie se envíe si no se puede hacer de forma segura.
    |
    */

    'secure' => env('SESSION_SECURE_COOKIE'),

    /*
    |--------------------------------------------------------------------------
    | Solo acceso vía HTTP
    |--------------------------------------------------------------------------
    |
    | Establecer este valor a true evitará que JavaScript acceda al valor
    | de la cookie y la cookie solo será accesible a través del protocolo
    | HTTP. Es poco probable que debas desactivar esta opción.
    |
    */

    'http_only' => env('SESSION_HTTP_ONLY', true),

    /*
    |--------------------------------------------------------------------------
    | Cookies Same-Site
    |--------------------------------------------------------------------------
    |
    | Esta opción determina cómo se comportan tus cookies cuando ocurren
    | solicitudes entre sitios, y puede ser usada para mitigar ataques CSRF.
    | Por defecto, estableceremos este valor a "lax" para permitir.
    |
    | Soportados: "lax", "strict", "none", null
    |
    */

    'same_site' => env('SESSION_SAME_SITE', 'lax'),

    /*
    |--------------------------------------------------------------------------
    | Partitioned Cookies
    |--------------------------------------------------------------------------
    |
    | Setting this value to true will tie the cookie to the top-level site for
    | a cross-site context. Partitioned cookies are accepted by the browser
    | when flagged "secure" and the Same-Site attribute is set to "none".
    |
    */

    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),

    /*
    |--------------------------------------------------------------------------
    | Serialización de sesión
    |--------------------------------------------------------------------------
    |
    | Este valor controla la estrategia de serialización para los datos de
    | la sesión, que por defecto es JSON. Establecer esto a "php" permite
    | el almacenamiento de objetos PHP pero puede ser vulnerable.
    |
    | Soportados: "json", "php"
    |
    */

    'serialization' => 'json',

];
