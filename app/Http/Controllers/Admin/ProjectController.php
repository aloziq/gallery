<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\Member;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:published,draft'],
            'sort' => ['nullable', 'in:recent,name,rating,evaluations'],
        ]);

        $projects = Project::query()
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('team_name', 'like', "%{$search}%");
                });
            })
            ->when(($filters['status'] ?? null) === 'published', fn ($query) => $query->where('is_published', true))
            ->when(($filters['status'] ?? null) === 'draft', fn ($query) => $query->where('is_published', false))
            ->when(($filters['sort'] ?? 'recent') === 'name', fn ($query) => $query->orderBy('name'))
            ->when(($filters['sort'] ?? 'recent') === 'rating', fn ($query) => $query->orderByDesc('evaluations_avg_rating')->orderByDesc('evaluations_count'))
            ->when(($filters['sort'] ?? 'recent') === 'evaluations', fn ($query) => $query->orderByDesc('evaluations_count'))
            ->when(($filters['sort'] ?? 'recent') === 'recent', fn ($query) => $query->orderBy('display_order')->orderByDesc('id'))
            ->paginate(20);

        return inertia('admin/projects/index', [
            'projects' => $projects->withQueryString(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'sort' => $filters['sort'] ?? 'recent',
            ],
        ]);
    }

    public function export()
    {
        $projects = Project::cursor();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=exhibition_results.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['ID', 'Project Name', 'Category', 'Total Evaluations', 'Average Rating'];

        $callback = function () use ($projects, $columns) {
            $file = fopen('php://output', 'w');
            // Add BOM for Excel UTF-8 reading
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            foreach ($projects as $project) {
                fputcsv($file, [
                    $project->id,
                    $project->name,
                    $project->category,
                    $project->evaluations_count,
                    number_format($project->evaluations_avg_rating ?? 0, 2),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function create()
    {
        return inertia('admin/projects/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:projects,slug',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'team_name' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'technologies' => 'nullable|string|max:255',
            'demo_url' => 'nullable|url|max:255',
            'is_published' => 'boolean',
            'display_order' => 'integer',
            'members' => 'nullable|array',
            'members.*.name' => 'required|string|max:255',
            'members.*.role' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('projects', 'public');
        }

        $project = Project::create(Arr::except($validated, ['members']));

        if (! empty($validated['members'])) {
            foreach ($validated['members'] as $index => $member) {
                $m = Member::firstOrCreate(['name' => $member['name']]);
                $project->members()->attach($m->id, [
                    'role' => $member['role'] ?? null,
                    'display_order' => $index,
                ]);
            }
        }

        Cache::forget('projects.index');

        return redirect()->route('admin.projects.index')->with('success', 'تم إضافة المشروع بنجاح');
    }

    public function edit(Project $project)
    {
        $project->load('members');

        return inertia('admin/projects/edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:projects,slug,'.$project->id,
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'team_name' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'technologies' => 'nullable|string|max:255',
            'demo_url' => 'nullable|url|max:255',
            'is_published' => 'boolean',
            'display_order' => 'integer',
            'members' => 'nullable|array',
            'members.*.name' => 'required|string|max:255',
            'members.*.role' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('projects', 'public');
        }

        $project->update(Arr::except($validated, ['members']));

        $project->members()->detach();
        if (! empty($validated['members'])) {
            foreach ($validated['members'] as $index => $member) {
                $m = Member::firstOrCreate(['name' => $member['name']]);
                $project->members()->attach($m->id, [
                    'role' => $member['role'] ?? null,
                    'display_order' => $index,
                ]);
            }
        }

        Cache::forget('projects.index');
        Cache::forget("project.show.{$project->slug}");

        return redirect()->route('admin.projects.index')->with('success', 'تم تحديث المشروع بنجاح');
    }

    public function destroy(Project $project)
    {
        $slug = $project->slug;
        $project->delete();

        Cache::forget('projects.index');
        Cache::forget("project.show.{$slug}");

        return redirect()->route('admin.projects.index')->with('success', 'تم حذف المشروع بنجاح');
    }

    public function printQrs(Request $request)
    {
        $gender = $request->query('gender', 'female');

        $projects = Project::query()
            ->when($gender === 'male', fn ($q) => $q->where('gender', 'male'))
            ->when($gender === 'female', fn ($q) => $q->where('gender', 'female'))
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'gender', 'qr_code', 'qr_svg']);

        $counts = [
            'male' => Project::where('gender', 'male')->count(),
            'female' => Project::where('gender', 'female')->count(),
            'all' => Project::count(),
        ];

        return inertia('admin/projects/print-qrs', [
            'projects' => $projects,
            'currentGender' => $gender,
            'counts' => $counts,
        ]);
    }

    public function addVotes(Request $request, Project $project)
    {
        $validated = $request->validate([
            'votes' => ['required', 'integer', 'min:1', 'max:500'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $count = (int) $validated['votes'];
        $rating = (int) $validated['rating'];

        for ($i = 0; $i < $count; $i++) {
            Evaluation::create([
                'project_id' => $project->id,
                'visitor_token' => Str::uuid()->toString(),
                'rating' => $rating,
            ]);
        }

        return back()->with('success', "تمت إضافة {$count} صوت بنجاح للمشروع: {$project->name}");
    }
}
