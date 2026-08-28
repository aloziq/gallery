<?php

namespace Database\Seeders;

use App\Models\Evaluation;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Database\Seeder;

class LoadTestSeeder extends Seeder
{
    /**
     * Seed the database with 150 projects, members, evaluations,
     * and a dedicated load-test admin user.
     */
    public function run(): void
    {
        // Create a dedicated load-test admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'loadtest@example.com'],
            [
                'name' => 'مستخدم اختبار الأداء',
                'password' => bcrypt('loadtest-password'),
                'email_verified_at' => now(),
            ],
        );

        $this->command->info("Load-test admin: {$admin->email}");

        // Create 150 published projects with members and evaluations
        $projects = Project::factory()
            ->count(150)
            ->create()
            ->each(function (Project $project, int $index) {
                // Set sequential display_order
                $project->update(['display_order' => $index + 100]);

                // Assign 2-4 members per project
                $memberCount = rand(2, 4);
                for ($i = 0; $i < $memberCount; $i++) {
                    ProjectMember::factory()->create([
                        'project_id' => $project->id,
                        'display_order' => $i + 1,
                    ]);
                }

                // Assign 5-30 random evaluations per project
                $evaluationCount = rand(5, 30);
                Evaluation::factory()
                    ->count($evaluationCount)
                    ->create([
                        'project_id' => $project->id,
                    ]);
            });

        $this->command->info("Seeded {$projects->count()} projects with members and evaluations.");
    }
}
