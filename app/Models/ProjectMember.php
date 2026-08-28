<?php

namespace App\Models;

use Database\Factories\ProjectMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectMember extends Model
{
    /** @use HasFactory<ProjectMemberFactory> */
    use HasFactory;

    protected $guarded = [];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
