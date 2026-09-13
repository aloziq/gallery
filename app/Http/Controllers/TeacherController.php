<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    /**
     * Teacher dashboard — lists all published projects with evaluation status.
     */
    public function index()
    {
        $projects = Project::where('is_published', true)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'short_description', 'cover_image', 'department', 'category', 'gender', 'evaluations_count', 'evaluations_avg_rating', 'team_name']);

        // Ensure visitor token cookie exists
        $visitorToken = request()->cookie('visitor_token');
        if (! $visitorToken) {
            $visitorToken = (string) Str::uuid();
            Cookie::queue('visitor_token', $visitorToken, 60 * 24 * 365);
        }

        $evaluatedProjectIds = Evaluation::where('visitor_token', $visitorToken)
            ->where('weight', 3)
            ->pluck('project_id')
            ->toArray();

        return inertia('teacher/index', [
            'projects' => $projects,
            'evaluatedProjectIds' => $evaluatedProjectIds,
        ]);
    }

    /**
     * Teacher project detail and evaluation page.
     */
    public function show(string $slug, Request $request)
    {
        $project = Project::where('slug', $slug)->firstOrFail();
        $project->load('members');

        abort_if(! $project->is_published, 404);

        $visitorToken = $request->cookie('visitor_token');
        if (! $visitorToken) {
            $visitorToken = (string) Str::uuid();
            Cookie::queue('visitor_token', $visitorToken, 60 * 24 * 365);
        }

        $existingEvaluation = Evaluation::where('project_id', $project->id)
            ->where('visitor_token', $visitorToken)
            ->where('weight', 3)
            ->first(['rating', 'comment', 'evaluator_name']);

        return inertia('teacher/show', [
            'project' => $project->toArray(),
            'existingEvaluation' => $existingEvaluation,
            'visitorToken' => $visitorToken,
        ]);
    }

    /**
     * Store or update a teacher evaluation (weight=3).
     */
    public function evaluate(Project $project, Request $request)
    {
        abort_if(! $project->is_published, 404);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'evaluator_name' => 'nullable|string|max:100',
        ]);

        $visitorToken = $request->cookie('visitor_token');
        if (! $visitorToken) {
            $visitorToken = (string) Str::uuid();
            Cookie::queue('visitor_token', $visitorToken, 60 * 24 * 365);
        }

        Evaluation::updateOrCreate(
            [
                'project_id' => $project->id,
                'visitor_token' => $visitorToken,
            ],
            [
                'rating' => $validated['rating'],
                'weight' => 3,
                'comment' => $validated['comment'] ?? null,
                'evaluator_name' => $validated['evaluator_name'] ?? null,
            ]
        );

        // Clear per-visitor cache
        Cache::forget("evaluated.{$project->id}.{$visitorToken}");

        return back()->with('success', 'تم تسجيل تقييمك بنجاح 🎉');
    }
}
