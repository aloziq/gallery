<?php

use App\Models\Evaluation;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

test('guests are redirected from teacher dashboard', function () {
    $response = $this->get(route('teacher.index'));

    $response->assertRedirect('/login');
});

test('users without teacher role are redirected to home', function () {
    $user = User::factory()->create(['role' => null]);

    $response = $this->actingAs($user)->get(route('teacher.index'));

    $response->assertRedirect(route('home'));
});

test('teacher can access teacher dashboard and view published projects', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $published = Project::factory()->create([
        'name' => 'مشروع الذكاء الاصطناعي',
        'is_published' => true,
        'gender' => 'male',
    ]);
    Project::factory()->unpublished()->create();

    $response = $this->actingAs($teacher)->get(route('teacher.index'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('teacher/index')
            ->has('projects', 1)
            ->where('projects.0.id', $published->id)
    );
});

test('teacher can view project evaluation page', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $project = Project::factory()->create(['is_published' => true]);

    $response = $this->actingAs($teacher)->get(route('teacher.show', $project->slug));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('teacher/show')
            ->where('project.id', $project->id)
    );
});

test('teacher evaluation saves with weight 3, comment, and evaluator name', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $project = Project::factory()->create(['is_published' => true]);
    $token = Str::uuid()->toString();

    $response = $this->actingAs($teacher)
        ->withCookie('visitor_token', $token)
        ->post(route('teacher.evaluate', $project->slug), [
            'rating' => 5,
            'comment' => 'مشروع متميز جداً وجهد تشكر عليه المجموعة.',
            'evaluator_name' => 'د. محمد',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('evaluations', [
        'project_id' => $project->id,
        'visitor_token' => $token,
        'rating' => 5,
        'weight' => 3,
        'comment' => 'مشروع متميز جداً وجهد تشكر عليه المجموعة.',
        'evaluator_name' => 'د. محمد',
    ]);
});

test('teacher vote applies 3x weight to project average rating', function () {
    $project = Project::factory()->create(['is_published' => true]);

    // 1 regular visitor vote: rating = 1 (weight = 1)
    Evaluation::create([
        'project_id' => $project->id,
        'visitor_token' => Str::uuid()->toString(),
        'rating' => 1,
        'weight' => 1,
    ]);

    $project->refresh();
    expect((float) $project->evaluations_avg_rating)->toBe(1.00);

    // 1 teacher vote: rating = 5 (weight = 3)
    // Formula: (1*1 + 5*3) / (1 + 3) = (1 + 15) / 4 = 16 / 4 = 4.00
    // If it were unweighted: (1 + 5) / 2 = 3.00
    $teacher = User::factory()->create(['role' => 'teacher']);
    $token = Str::uuid()->toString();

    $this->actingAs($teacher)
        ->withCookie('visitor_token', $token)
        ->post(route('teacher.evaluate', $project->slug), [
            'rating' => 5,
            'comment' => 'عمل رائع',
            'evaluator_name' => 'د. أحمد',
        ]);

    $project->refresh();
    expect((float) $project->evaluations_avg_rating)->toBe(4.00);
    expect($project->evaluations_count)->toBe(2);
});

test('both male and female projects are shown on homepage', function () {
    Cache::forget('projects.all');

    $maleProject = Project::factory()->create([
        'is_published' => true,
        'gender' => 'male',
    ]);
    $femaleProject = Project::factory()->create([
        'is_published' => true,
        'gender' => 'female',
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('project/all')
            ->has('projects', 2)
    );
});

test('teacher login redirects to teacher dashboard', function () {
    $teacher = User::factory()->create([
        'email' => 'teacher@gallery.test',
        'password' => bcrypt('password123'),
        'role' => 'teacher',
    ]);

    $response = $this->post('/login', [
        'email' => 'teacher@gallery.test',
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('teacher.index'));
});
