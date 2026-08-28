<?php

namespace App\Models;

use Database\Factories\EvaluationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    /** @use HasFactory<EvaluationFactory> */
    use HasFactory;

    protected $guarded = [];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
