<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /** @var list<string> */
    private static array $categories = [
        'تطبيقات الويب',
        'الذكاء الاصطناعي',
        'الروبوتات',
        'أمن المعلومات',
        'الواقع الافتراضي',
        'إنترنت الأشياء',
        'تطبيقات الجوال',
        'تحليل البيانات',
        'الحوسبة السحابية',
        'البلوكتشين',
    ];

    /** @var list<string> */
    private static array $departments = [
        'علوم الحاسب',
        'هندسة الحاسب',
        'نظم المعلومات',
        'الأمن السيبراني',
        'تقنية المعلومات',
        'هندسة البرمجيات',
    ];

    /** @var list<string> */
    private static array $techStacks = [
        'Laravel, React, Tailwind CSS',
        'Python, TensorFlow, Flask',
        'Flutter, Firebase, Dart',
        'Spring Boot, Angular, PostgreSQL',
        'Node.js, Vue.js, MongoDB',
        'Django, React Native, Redis',
        'Go, gRPC, Kubernetes',
        'Unity, C#, Oculus SDK',
        'Arduino, ESP32, React Native',
        'Swift, SwiftUI, CoreML',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->sentence(rand(3, 6));

        return [
            'name' => $name,
            'slug' => fake()->unique()->slug(),
            'short_description' => fake()->sentence(rand(8, 15)),
            'description' => fake()->paragraphs(rand(2, 4), true),
            'cover_image' => 'projects/default-cover.jpg',
            'team_name' => 'فريق '.fake()->word(),
            'department' => fake()->randomElement(self::$departments),
            'category' => fake()->randomElement(self::$categories),
            'technologies' => fake()->randomElement(self::$techStacks),
            'demo_url' => fake()->optional(0.6)->url(),
            'is_published' => true,
            'display_order' => 0,
        ];
    }

    /**
     * Mark the project as unpublished.
     */
    public function unpublished(): static
    {
        return $this->state(fn (): array => ['is_published' => false]);
    }
}
