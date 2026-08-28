<?php

namespace Database\Factories;

use App\Models\Evaluation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Evaluation>
 */
class EvaluationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'visitor_token' => (string) Str::uuid(),
            'rating' => fake()->numberBetween(1, 5),
        ];
    }
}
