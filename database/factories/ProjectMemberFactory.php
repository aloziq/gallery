<?php

namespace Database\Factories;

use App\Models\ProjectMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectMember>
 */
class ProjectMemberFactory extends Factory
{
    /** @var list<string> */
    private static array $roles = [
        'مطور واجهات',
        'مطور خلفي',
        'مصممة واجهات',
        'محللة نظم',
        'قائد الفريق',
        'مهندس بيانات',
        'مطور تطبيقات',
        'باحث',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => fake()->randomElement(self::$roles),
            'display_order' => 0,
        ];
    }
}
