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
        // If the rating changed, update the aggregates
        if ($evaluation->wasChanged('rating')) {
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
     */
    protected function updateProjectAggregates(Project $project): void
    {
        $project->update([
            'evaluations_count' => $project->evaluations()->count(),
            'evaluations_avg_rating' => $project->evaluations()->avg('rating') ?? 0.00,
        ]);

        // Single source of truth for cache invalidation after evaluation changes
        Cache::forget('projects.index');
        Cache::forget("project.show.{$project->slug}");
        Cache::forget('admin.dashboard.stats');
    }
}
