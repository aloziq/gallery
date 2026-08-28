<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
    app()->make(\App\Http\Controllers\ProjectController::class)->live();
    echo "Success!";
} catch (\Throwable $e) {
    echo $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine();
}
