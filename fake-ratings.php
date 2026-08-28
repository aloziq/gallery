<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;
use App\Models\Evaluation;
use Illuminate\Support\Str;

$projects = Project::where('is_published', true)->pluck('id');
if ($projects->isEmpty()) {
    echo "No published projects found.\n";
    exit;
}

echo "Starting fake ratings script for 3 minutes...\n";

$endTime = time() + 180; // 3 minutes

while (time() < $endTime) {
    // Pick a random project
    $projectId = $projects->random();
    $visitorToken = Str::uuid()->toString();
    $rating = rand(1, 5);
    
    // Add evaluation
    Evaluation::create([
        'project_id' => $projectId,
        'visitor_token' => $visitorToken,
        'rating' => $rating,
    ]);
    
    echo "Rated project ID: $projectId with rating $rating\n";
    
    // Sleep for random time between 0.5 to 2.5 seconds
    usleep(rand(50000, 60000));
}

echo "Finished rating projects!\n";
