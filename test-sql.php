<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

try {
    $secondsBucket = 10;
    $evals = DB::table('evaluations')
        ->select(DB::raw("to_timestamp(floor(extract(epoch from created_at) / {$secondsBucket}) * {$secondsBucket}) as period"), DB::raw('count(*) as count'))
        ->groupBy(DB::raw("to_timestamp(floor(extract(epoch from created_at) / {$secondsBucket}) * {$secondsBucket})"))
        ->limit(2)
        ->get();

    print_r($evals->toArray());
    echo "Success!\n";
} catch (Exception $e) {
    echo $e->getMessage();
}
