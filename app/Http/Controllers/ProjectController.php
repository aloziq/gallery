<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index()
    {
        // Stale-while-revalidate: fresh for 60s, serves stale up to 5 min
        // while refreshing in background — eliminates cache stampede on homepage
        $projects = Cache::flexible('projects.index', [60, 300], function () {
            return Project::where('is_published', true)
                ->orderByDesc('evaluations_avg_rating')
                ->orderByDesc('evaluations_count')
                ->orderBy('display_order')
                ->get()
                ->toArray();
        });

        return inertia('project/index', [
            'projects' => array_slice($projects, 0, 5),
        ]);
    }

    public function all()
    {
        $projects = Cache::flexible('projects.index', [60, 300], function () {
            return Project::where('is_published', true)
                ->orderByDesc('evaluations_avg_rating')
                ->orderByDesc('evaluations_count')
                ->orderBy('display_order')
                ->get()
                ->toArray();
        });

        return inertia('project/all', [
            'projects' => $projects,
        ]);
    }

    public function show(string $slug, Request $request)
    {
        // Stale-while-revalidate: fresh for 60s, stale up to 5 min
        $project = Cache::flexible("project.show.{$slug}", [60, 300], function () use ($slug) {
            $proj = Project::where('slug', $slug)->firstOrFail();
            $proj->load('members');

            return $proj->toArray();
        });

        abort_if(! $project['is_published'], 404);

        $visitorToken = $request->cookie('visitor_token');
        if (! $visitorToken) {
            $visitorToken = (string) Str::uuid();
            Cookie::queue('visitor_token', $visitorToken, 60 * 24 * 365);
        }

        // Cache the user's rating per-visitor per-project
        $userRating = Cache::remember(
            "evaluated.{$project['id']}.{$visitorToken}",
            60,
            fn () => Evaluation::where('project_id', $project['id'])
                ->where('visitor_token', $visitorToken)
                ->value('rating')
        );

        return inertia('project/show', [
            'project' => $project,
            'userRating' => $userRating,
            'visitorToken' => $visitorToken,
        ]);
    }

    public function evaluate(Project $project, Request $request)
    {
        abort_if(! $project->is_published, 404);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $visitorToken = $request->cookie('visitor_token');
        if (! $visitorToken) {
            return back()->withErrors(['error' => 'تعذر التحقق من هويتك كزائر.']);
        }

        Evaluation::updateOrCreate(
            [
                'project_id' => $project->id,
                'visitor_token' => $visitorToken,
            ],
            [
                'rating' => $validated['rating'],
            ]
        );

        // Clear the per-visitor evaluation cache so the UI updates immediately
        Cache::forget("evaluated.{$project->id}.{$visitorToken}");

        // The EvaluationObserver handles updating aggregates and clearing
        // the projects.index and project.show caches (single source of truth)

        return back()->with('success', 'تم تسجيل تقييمك بنجاح 🎉');
    }

    public function live(Request $request)
    {
        $topProjects = Project::where('is_published', true)
            ->orderByDesc('evaluations_count')
            ->orderBy('display_order')
            ->limit(10)
            ->get(['id', 'name', 'evaluations_count', 'slug', 'cover_image', 'department', 'category', 'display_order']);

        $top5Ids = $topProjects->take(5)->pluck('id');
        $top5Names = $topProjects->take(5)->pluck('name', 'id');

        $range = $request->query('range', '15m');
        
        switch ($range) {
            case '12H':
                $startTime = now()->subHours(12);
                $secondsBucket = 60; // 1 minute
                break;
            case '1D':
                $startTime = now()->subHours(24);
                $secondsBucket = 120; // 2 minutes
                break;
            case '7D':
                $startTime = now()->subDays(7);
                $secondsBucket = 600; // 10 minutes
                break;
            case 'All':
                $minDate = DB::table('evaluations')->min('created_at');
                $startTime = $minDate ? \Carbon\Carbon::parse($minDate)->startOfDay() : now()->subYears(1);
                $secondsBucket = 86400; // 1 day
                break;
            case '1H':
                $startTime = now()->subMinutes(60);
                $secondsBucket = 10; // 10 seconds
                break;
            case '1m':
                $startTime = now()->subMinutes(1);
                $secondsBucket = 1; // 1 second
                break;
            case '15m':
            default:
                $startTime = now()->subMinutes(15);
                $secondsBucket = 1; // 1 second (Ultra-high real-time precision)
                break;
        }

        // Extract epoch allows highly granular bucketing in Postgres
        $periodSql = "to_timestamp(floor(extract(epoch from created_at) / {$secondsBucket}) * {$secondsBucket})";

        // Get evaluations in the selected timeframe grouped by the interval
        $evaluations = DB::table('evaluations')
            ->whereIn('project_id', $top5Ids)
            ->where('created_at', '>=', $startTime)
            ->select(
                'project_id',
                DB::raw("{$periodSql} as period"),
                DB::raw('count(*) as count')
            )
            ->groupBy('project_id', DB::raw($periodSql))
            ->get();

        // Baseline (total before startTime) for each of the top 5
        $baselines = DB::table('evaluations')
            ->whereIn('project_id', $top5Ids)
            ->where('created_at', '<', $startTime)
            ->groupBy('project_id')
            ->select('project_id', DB::raw('count(*) as base_count'))
            ->pluck('base_count', 'project_id');

        $chartData = [];
        $runningTotals = [];
        foreach ($top5Ids as $id) {
            $runningTotals[$id] = $baselines[$id] ?? 0;
            $chartData[$id] = [];
        }

        // Align current and end times to exact bucket edges
        $currentPeriod = \Carbon\Carbon::createFromTimestamp(floor($startTime->timestamp / $secondsBucket) * $secondsBucket);
        $endPeriod = \Carbon\Carbon::createFromTimestamp(floor(now()->timestamp / $secondsBucket) * $secondsBucket);

        $evalsByPeriod = [];
        foreach ($evaluations as $eval) {
            $ts = \Carbon\Carbon::parse($eval->period)->timestamp;
            $evalsByPeriod[$ts][$eval->project_id] = $eval->count;
        }

        while ($currentPeriod <= $endPeriod) {
            $timestamp = $currentPeriod->timestamp;

            foreach ($top5Ids as $id) {
                $count = $evalsByPeriod[$timestamp][$id] ?? 0;
                $runningTotals[$id] += $count;
                $chartData[$id][] = ['time' => $timestamp, 'value' => $runningTotals[$id]];
            }

            $currentPeriod = $currentPeriod->addSeconds($secondsBucket);
        }

        return inertia('project/live', [
            'topProjects' => $topProjects,
            'chartData' => $chartData,
        ]);
    }
}
