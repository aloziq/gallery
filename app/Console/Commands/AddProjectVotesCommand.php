<?php

namespace App\Console\Commands;

use App\Models\Evaluation;
use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

class AddProjectVotesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'project:vote
                            {project? : Project ID, Slug, or partial name}
                            {votes? : Number of votes to add}
                            {--rating=5 : Rating score (1 to 5)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Interactively add votes and ratings to any project';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('⭐ Project Voting System');

        $projectIdentifier = $this->argument('project');

        if (! $projectIdentifier) {
            $projects = Project::where('is_published', true)
                ->orderBy('display_order')
                ->get(['id', 'name', 'evaluations_count', 'evaluations_avg_rating']);

            if ($projects->isEmpty()) {
                $this->error('No published projects found in the database.');

                return self::FAILURE;
            }

            $options = [];
            foreach ($projects as $p) {
                $options[$p->id] = "[#{$p->id}] {$p->name} (Current: {$p->evaluations_count} votes, ★ {$p->evaluations_avg_rating})";
            }

            $selectedId = select(
                label: 'Which project would you like to vote for?',
                options: $options,
                scroll: 15
            );

            $project = Project::find($selectedId);
        } else {
            $project = is_numeric($projectIdentifier)
                ? Project::find($projectIdentifier)
                : Project::where('slug', $projectIdentifier)
                    ->orWhere('name', 'like', "%{$projectIdentifier}%")
                    ->first();
        }

        if (! $project) {
            $this->error("Project not found: [{$projectIdentifier}]");

            return self::FAILURE;
        }

        $voteCount = $this->argument('votes');

        if (! $voteCount) {
            $voteCount = (int) text(
                label: "How many votes to add to '{$project->name}'?",
                default: '1',
                validate: fn (string $val) => is_numeric($val) && (int) $val > 0 ? null : 'Please enter a positive integer.'
            );
        } else {
            $voteCount = (int) $voteCount;
        }

        $rating = (int) $this->option('rating');
        if ($rating < 1 || $rating > 5) {
            $rating = 5;
        }

        $this->info("Adding {$voteCount} votes (Rating: {$rating} ★) to: {$project->name}...");

        $bar = $this->output->createProgressBar($voteCount);
        $bar->start();

        for ($i = 0; $i < $voteCount; $i++) {
            Evaluation::create([
                'project_id' => $project->id,
                'visitor_token' => Str::uuid()->toString(),
                'rating' => $rating,
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $project->refresh();

        $this->table(
            ['Project ID', 'Project Name', 'Total Votes', 'Average Rating'],
            [
                [$project->id, $project->name, $project->evaluations_count, number_format((float) $project->evaluations_avg_rating, 2).' ★'],
            ]
        );

        $this->info("✅ Successfully added {$voteCount} votes!");

        return self::SUCCESS;
    }
}
