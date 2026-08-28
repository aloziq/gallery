<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    protected $guarded = [];

    public function members()
    {
        return $this->hasMany(ProjectMember::class)->orderBy('display_order');
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }
}
