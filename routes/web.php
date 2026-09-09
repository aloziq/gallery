<?php

use App\Http\Controllers\Admin\QRController;
use App\Http\Controllers\ProjectController;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [ProjectController::class, 'index'])->name('home');
Route::get('/all', [ProjectController::class, 'all'])->name('projects.all');
Route::get('/p/{slug}', [ProjectController::class, 'show'])->name('project.show');
Route::post('/p/{project:slug}/evaluate', [ProjectController::class, 'evaluate'])->name('project.evaluate');
Route::get('/live', [ProjectController::class, 'live'])->name('live');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin', function () {
        return redirect()->route('admin.dashboard');
    });

    Route::get('/dashboard', function () {
        // Stale-while-revalidate: fresh 5 min, stale up to 10 min
        $stats = Cache::flexible('admin.dashboard.stats', [300, 600], function () {
            $result = DB::selectOne('
                SELECT
                    (SELECT count(*) FROM projects) AS total_projects,
                    (SELECT count(*) FROM evaluations) AS total_evaluations,
                    (SELECT count(DISTINCT visitor_token) FROM evaluations) AS total_visitors,
                    (SELECT round(CAST(avg(rating) AS numeric), 2) FROM evaluations) AS average_rating
            ');

            return (array) $result;
        });

        return inertia('admin/dashboard', [
            'stats' => [
                'total_projects' => (int) $stats['total_projects'],
                'total_evaluations' => (int) $stats['total_evaluations'],
                'total_visitors' => (int) $stats['total_visitors'],
                'average_rating' => (float) ($stats['average_rating'] ?? 0),
            ],
            'projects' => Inertia::defer(fn () => Project::orderByDesc('evaluations_avg_rating')
                ->orderByDesc('evaluations_count')
                ->get()),
        ]);
    })->name('dashboard');

    // Project Management Routes
    Route::get('projects/export', [App\Http\Controllers\Admin\ProjectController::class, 'export'])->name('admin.projects.export');
    Route::get('projects/print-qrs', [App\Http\Controllers\Admin\ProjectController::class, 'printQrs'])->name('admin.projects.print-qrs');
    Route::resource('projects', App\Http\Controllers\Admin\ProjectController::class)->names('admin.projects');

    // QR Code generation route
    Route::get('projects/{project}/qr', [QRController::class, 'show'])->name('admin.projects.qr');
});

require __DIR__.'/settings.php';
