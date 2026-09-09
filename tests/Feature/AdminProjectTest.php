<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

// ────────────────────────────────────────────────────────
// AUTH GUARD
// ────────────────────────────────────────────────────────

test('guests cannot access admin project list', function () {
    $this->get(route('admin.projects.index'))
        ->assertRedirect(route('login'));
});

test('guests cannot create projects', function () {
    $this->post(route('admin.projects.store'), [])
        ->assertRedirect(route('login'));
});

// ────────────────────────────────────────────────────────
// INDEX
// ────────────────────────────────────────────────────────

test('authenticated users can view project list', function () {
    $user = User::factory()->create();
    Project::factory()->count(3)->create();

    $response = $this->actingAs($user)->get(route('admin.projects.index'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('admin/projects/index')
            ->has('projects.data', 3)
    );
});

test('authenticated users can filter and sort the project list', function () {
    $user = User::factory()->create();
    Project::factory()->create([
        'name' => 'Published robotics project',
        'is_published' => true,
        'evaluations_count' => 10,
    ]);
    Project::factory()->create([
        'name' => 'Draft mobile project',
        'is_published' => false,
        'evaluations_count' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('admin.projects.index', [
            'search' => 'robotics',
            'status' => 'published',
            'sort' => 'evaluations',
        ]))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/projects/index')
                ->has('projects.data', 1)
                ->where('projects.data.0.name', 'Published robotics project')
                ->where('filters.status', 'published')
                ->where('filters.sort', 'evaluations')
        );
});

// ────────────────────────────────────────────────────────
// CREATE / STORE
// ────────────────────────────────────────────────────────

test('authenticated users can view create project form', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.projects.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/projects/create'));
});

test('authenticated users can store a project with members', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.projects.store'), [
        'name' => 'Test Project',
        'slug' => 'test-project',
        'short_description' => 'A test project',
        'description' => 'Full description here',
        'team_name' => 'Team Alpha',
        'department' => 'CS',
        'category' => 'Web',
        'technologies' => 'Laravel, React',
        'is_published' => true,
        'display_order' => 1,
        'members' => [
            ['name' => 'Alice', 'role' => 'Lead'],
            ['name' => 'Bob', 'role' => 'Developer'],
        ],
    ]);

    $response->assertRedirect(route('admin.projects.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('projects', ['slug' => 'test-project']);
    $this->assertDatabaseHas('project_members', ['name' => 'Alice']);
    $this->assertDatabaseHas('project_members', ['name' => 'Bob']);
});

test('store requires name and slug', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.projects.store'), [])
        ->assertSessionHasErrors(['name', 'slug']);
});

test('store enforces unique slug', function () {
    $user = User::factory()->create();
    Project::factory()->create(['slug' => 'existing-slug']);

    $this->actingAs($user)
        ->post(route('admin.projects.store'), [
            'name' => 'New Project',
            'slug' => 'existing-slug',
            'is_published' => true,
            'display_order' => 0,
        ])
        ->assertSessionHasErrors('slug');
});

test('store invalidates projects index cache', function () {
    $user = User::factory()->create();
    Project::factory()->create(['is_published' => true]);

    // Populate the cache
    $this->get(route('home'));
    expect(Cache::has('projects.index'))->toBeTrue();

    // Store a new project
    $this->actingAs($user)->post(route('admin.projects.store'), [
        'name' => 'Cached Project',
        'slug' => 'cached-project',
        'is_published' => true,
        'display_order' => 0,
    ]);

    expect(Cache::has('projects.index'))->toBeFalse();
});

// ────────────────────────────────────────────────────────
// EDIT / UPDATE
// ────────────────────────────────────────────────────────

test('authenticated users can view edit project form', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();

    $this->actingAs($user)->get(route('admin.projects.edit', $project))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/projects/edit')
                ->has('project')
        );
});

test('authenticated users can update a project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($user)->put(route('admin.projects.update', $project), [
        'name' => 'New Name',
        'slug' => $project->slug,
        'is_published' => true,
        'display_order' => 0,
    ]);

    $response->assertRedirect(route('admin.projects.index'));
    expect($project->fresh()->name)->toBe('New Name');
});

test('update invalidates project caches', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_published' => true]);

    // Populate caches
    $this->get(route('home'));
    $this->get(route('project.show', $project->slug));
    expect(Cache::has('projects.index'))->toBeTrue();
    expect(Cache::has("project.show.{$project->slug}"))->toBeTrue();

    // Update the project
    $this->actingAs($user)->put(route('admin.projects.update', $project), [
        'name' => 'Updated Name',
        'slug' => $project->slug,
        'is_published' => true,
        'display_order' => 0,
    ]);

    expect(Cache::has('projects.index'))->toBeFalse();
    expect(Cache::has("project.show.{$project->slug}"))->toBeFalse();
});

// ────────────────────────────────────────────────────────
// DESTROY
// ────────────────────────────────────────────────────────

test('authenticated users can delete a project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.projects.destroy', $project));

    $response->assertRedirect(route('admin.projects.index'));
    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

test('delete invalidates project caches', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_published' => true]);

    // Populate caches
    $this->get(route('home'));
    $this->get(route('project.show', $project->slug));

    // Delete the project
    $this->actingAs($user)->delete(route('admin.projects.destroy', $project));

    expect(Cache::has('projects.index'))->toBeFalse();
    expect(Cache::has("project.show.{$project->slug}"))->toBeFalse();
});

// ────────────────────────────────────────────────────────
// EXPORT
// ────────────────────────────────────────────────────────

test('authenticated users can export projects as CSV', function () {
    $user = User::factory()->create();
    Project::factory()->create(['name' => 'Export Test']);

    $response = $this->actingAs($user)->get(route('admin.projects.export'));

    $response->assertOk();
    $response->assertHeader('Content-type', 'text/csv; charset=utf-8');
    $response->assertHeader('Content-Disposition', 'attachment; filename=exhibition_results.csv');
});

test('guests cannot export projects', function () {
    $this->get(route('admin.projects.export'))
        ->assertRedirect(route('login'));
});

// ────────────────────────────────────────────────────────
// PRINT QRS
// ────────────────────────────────────────────────────────

test('guests cannot access print qrs page', function () {
    $this->get(route('admin.projects.print-qrs'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view print qrs page with male projects by default', function () {
    $user = User::factory()->create();
    Project::factory()->create(['name' => 'Male Project', 'gender' => 'male']);
    Project::factory()->create(['name' => 'Female Project', 'gender' => 'female']);

    $response = $this->actingAs($user)->get(route('admin.projects.print-qrs'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('admin/projects/print-qrs')
            ->where('currentGender', 'male')
            ->has('projects', 1)
            ->where('projects.0.name', 'Male Project')
            ->where('counts.male', 1)
            ->where('counts.female', 1)
            ->where('counts.all', 2)
    );
});

test('authenticated users can filter print qrs by female or all', function () {
    $user = User::factory()->create();
    Project::factory()->create(['name' => 'Male Project', 'gender' => 'male']);
    Project::factory()->create(['name' => 'Female Project', 'gender' => 'female']);

    $responseFemale = $this->actingAs($user)->get(route('admin.projects.print-qrs', ['gender' => 'female']));
    $responseFemale->assertOk();
    $responseFemale->assertInertia(
        fn ($page) => $page
            ->where('currentGender', 'female')
            ->has('projects', 1)
            ->where('projects.0.name', 'Female Project')
    );

    $responseAll = $this->actingAs($user)->get(route('admin.projects.print-qrs', ['gender' => 'all']));
    $responseAll->assertOk();
    $responseAll->assertInertia(
        fn ($page) => $page
            ->where('currentGender', 'all')
            ->has('projects', 2)
    );
});
