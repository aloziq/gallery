<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Contracts\Console\Kernel;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
try {
    app()->make(ProjectController::class)->live();
    echo 'Success!';
} catch (Throwable $e) {
    echo $e->getMessage()."\n".$e->getFile().':'.$e->getLine();
}
