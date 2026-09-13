<?php

use App\Models\Evaluation;
use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Support\Facades\Cache;

// ────────────────────────────────────────────────────────
// HOMEPAGE (PUBLIC GALLERY)
// ────────────────────────────────────────────────────────

test('homepage displays published projects', function () {
    $published = Project::factory()->create(['is_published' => true]);
    Project::factory()->unpublished()->create();

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('project/all')
            ->has('projects', 1)
            ->where('projects.0.id', $published->id)
    );
});

test('homepage hides unpublished projects', function () {
    Project::factory()->unpublished()->create();

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('project/all')
            ->where('projects', [])
    );
});

test('homepage orders projects by display_order then id', function () {
    $p2 = Project::factory()->create([
        'is_published' => true,
        'display_order' => 2,
    ]);
    $p1 = Project::factory()->create([
        'is_published' => true,
        'display_order' => 1,
    ]);

    // Clear cache so it doesn't interfere
    Cache::forget('projects.all');

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->has('projects', 2)
            ->where('projects.0.id', $p1->id)
            ->where('projects.1.id', $p2->id)
    );
});

test('homepage uses cache on subsequent requests', function () {
    Project::factory()->create(['is_published' => true]);

    // First request populates cache
    $this->get(route('home'))->assertOk();

    // Verify cache key was set
    expect(Cache::has('projects.all'))->toBeTrue();
});

// ────────────────────────────────────────────────────────
// PROJECT DETAIL PAGE
// ────────────────────────────────────────────────────────

test('project detail page shows project with members', function () {
    $project = Project::factory()->create(['is_published' => true]);
    ProjectMember::factory()->count(3)->create(['project_id' => $project->id]);

    $response = $this->get(route('project.show', $project->slug));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('project/show')
            ->where('project.id', $project->id)
            ->has('project.members', 3)
            ->has('userRating')
            ->has('visitorToken')
    );
});

test('project detail page returns 404 for unpublished projects', function () {
    $project = Project::factory()->unpublished()->create();

    $response = $this->get(route('project.show', $project->slug));

    $response->assertNotFound();
});

test('project detail page returns 404 for non-existent slug', function () {
    $response = $this->get('/p/non-existent-slug');

    $response->assertNotFound();
});

test('project detail page sets visitor cookie if not present', function () {
    $project = Project::factory()->create(['is_published' => true]);

    $response = $this->get(route('project.show', $project->slug));

    $response->assertOk();
    $response->assertCookie('visitor_token');
});

test('project detail page shows userRating when visitor already rated', function () {
    $project = Project::factory()->create(['is_published' => true]);
    $token = 'test-visitor-token';

    Evaluation::factory()->create([
        'project_id' => $project->id,
        'visitor_token' => $token,
        'rating' => 4,
    ]);

    $response = $this->withCookie('visitor_token', $token)
        ->get(route('project.show', $project->slug));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page->where('userRating', 4)
    );
});

// ────────────────────────────────────────────────────────
// EVALUATION (RATING SUBMISSION)
// ────────────────────────────────────────────────────────

test('visitor can submit a rating for a published project', function () {
    $project = Project::factory()->create(['is_published' => true]);
    $token = 'test-visitor-token';

    $response = $this->withCookie('visitor_token', $token)
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), [
            'rating' => 4,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('evaluations', [
        'project_id' => $project->id,
        'visitor_token' => $token,
        'rating' => 4,
    ]);
});

test('evaluation updates project aggregates via observer', function () {
    $project = Project::factory()->create([
        'is_published' => true,
        'evaluations_count' => 0,
        'evaluations_avg_rating' => 0.00,
    ]);

    $this->withCookie('visitor_token', 'visitor-1')
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 5]);

    $this->withCookie('visitor_token', 'visitor-2')
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 3]);

    $project->refresh();
    expect($project->evaluations_count)->toBe(2);
    expect((float) $project->evaluations_avg_rating)->toBe(4.00);
});

test('visitor rating the same project updates their existing rating', function () {
    $project = Project::factory()->create(['is_published' => true]);
    $token = 'test-visitor-token';

    // First rating
    $this->withCookie('visitor_token', $token)
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 4])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Evaluation::where('project_id', $project->id)->count())->toBe(1);
    expect(Evaluation::where('project_id', $project->id)->value('rating'))->toBe(4);

    // Second rating updates existing evaluation
    $this->withCookie('visitor_token', $token)
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 5])
        ->assertRedirect()
        ->assertSessionHas('success');

    // Still only one evaluation in the database, with updated rating
    expect(Evaluation::where('project_id', $project->id)->count())->toBe(1);
    expect(Evaluation::where('project_id', $project->id)->value('rating'))->toBe(5);
});

test('evaluation requires a rating between 1 and 5', function () {
    $project = Project::factory()->create(['is_published' => true]);

    $this->withCookie('visitor_token', 'test-token')
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 0])
        ->assertRedirect()
        ->assertSessionHasErrors('rating');

    $this->withCookie('visitor_token', 'test-token')
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 6])
        ->assertRedirect()
        ->assertSessionHasErrors('rating');

    $this->withCookie('visitor_token', 'test-token')
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), [])
        ->assertRedirect()
        ->assertSessionHasErrors('rating');
});

test('evaluation without visitor cookie returns error', function () {
    $project = Project::factory()->create(['is_published' => true]);

    $response = $this->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), [
            'rating' => 4,
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors();
    expect(Evaluation::count())->toBe(0);
});

test('cannot evaluate an unpublished project', function () {
    $project = Project::factory()->unpublished()->create();

    $response = $this->withCookie('visitor_token', 'test-token')
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 4]);

    $response->assertNotFound();
});

// ────────────────────────────────────────────────────────
// CACHE INVALIDATION
// ────────────────────────────────────────────────────────

test('evaluation clears project caches', function () {
    $project = Project::factory()->create(['is_published' => true]);

    // Populate caches
    $this->get(route('home'));
    $this->withCookie('visitor_token', 'cache-test-token')
        ->get(route('project.show', $project->slug));
    expect(Cache::has('projects.all'))->toBeTrue();
    expect(Cache::has("project.show.{$project->slug}"))->toBeTrue();

    // Submit evaluation
    $this->withCookie('visitor_token', 'cache-test-token')
        ->from(route('project.show', $project->slug))
        ->post(route('project.evaluate', $project->slug), ['rating' => 5]);

    // Caches should be cleared by the observer
    expect(Cache::has('projects.all'))->toBeFalse();
    expect(Cache::has("project.show.{$project->slug}"))->toBeFalse();
});
