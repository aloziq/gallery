<?php

namespace App\Observers;

use App\Models\Evaluation;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class EvaluationObserver
{
    /**
     * Handle the Evaluation "created" event.
     */
    public function created(Evaluation $evaluation): void
    {
        $this->updateProjectAggregates($evaluation->project);
    }

    /**
     * Handle the Evaluation "updated" event.
     */
    public function updated(Evaluation $evaluation): void
    {
        // If rating or weight changed, update the aggregates
        if ($evaluation->wasChanged('rating') || $evaluation->wasChanged('weight')) {
            $this->updateProjectAggregates($evaluation->project);
        }
    }

    /**
     * Handle the Evaluation "deleted" event.
     */
    public function deleted(Evaluation $evaluation): void
    {
        $this->updateProjectAggregates($evaluation->project);
    }

    /**
     * Handle the Evaluation "restored" event.
     */
    public function restored(Evaluation $evaluation): void
    {
        $this->updateProjectAggregates($evaluation->project);
    }

    /**
     * Handle the Evaluation "force deleted" event.
     */
    public function forceDeleted(Evaluation $evaluation): void
    {
        $this->updateProjectAggregates($evaluation->project);
    }

    /**
     * Update the denormalized aggregates on the Project model
     * and invalidate related caches.
     *
     * Uses weighted average: sum(rating * weight) / sum(weight)
     * so teacher votes (weight=3) count more than visitor votes (weight=1).
     */
    protected function updateProjectAggregates(Project $project): void
    {
        $evaluations = $project->evaluations()->get(['rating', 'weight']);
        $totalWeight = $evaluations->sum('weight');
        $weightedSum = $evaluations->sum(fn (Evaluation $e): int|float => $e->rating * $e->weight);

        $project->update([
            'evaluations_count' => $evaluations->count(),
            'evaluations_avg_rating' => $totalWeight > 0
                ? round($weightedSum / $totalWeight, 2)
                : 0.00,
        ]);

        // Single source of truth for cache invalidation after evaluation changes
        Cache::forget('projects.all');
        Cache::forget("project.show.{$project->slug}");
        Cache::forget('admin.dashboard.stats');
    }
}
