<?php

namespace App\Models;

use Database\Factories\MemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Member extends Model
{
    /** @use HasFactory<MemberFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'photo',
    ];

    protected $appends = [
        'role',
    ];

    /**
     * The projects that belong to this member.
     *
     * @return BelongsToMany<Project, $this>
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members')
            ->withPivot(['role', 'photo', 'display_order'])
            ->withTimestamps();
    }

    /**
     * Backward-compatible accessor for member's role in the current project context.
     */
    public function getRoleAttribute(): ?string
    {
        return $this->pivot?->role ?? null;
    }

    /**
     * Accessor for member photo (prefers project-specific photo if provided, fallback to member default).
     */
    public function getPhotoAttribute(?string $value): ?string
    {
        return $this->pivot?->photo ?: $value;
    }
}
