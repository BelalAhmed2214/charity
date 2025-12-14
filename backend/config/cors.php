<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your application. The values
    | provided here will be used to set the appropriate CORS response headers
    | that your application needs to function properly in cross-origin scenarios.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8000',
    ],

    'allowed_origins_patterns' => [
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Content-Type',
        'X-Content-Type-Options',
        'Authorization',
    ],

    'max_age' => 0,

    'supports_credentials' => true,

];
