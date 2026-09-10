<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * Get the project's cover image path or auto-detect from storage.
     *
     * @return Attribute<string|null, never>
     */
    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: function (?string $value, array $attributes): ?string {
                if ($value) {
                    return $value;
                }
                $slug = $attributes['slug'] ?? null;
                if (! $slug) {
                    return null;
                }
                foreach (['webp', 'svg', 'jpg', 'jpeg', 'png'] as $ext) {
                    $rel = "projects/{$slug}/cover.{$ext}";
                    if (file_exists(public_path("storage/{$rel}")) || file_exists(storage_path("app/public/{$rel}"))) {
                        return $rel;
                    }
                }

                return null;
            }
        );
    }

    /**
     * @return BelongsToMany<Member, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'project_members')
            ->withPivot(['role', 'photo', 'display_order'])
            ->withTimestamps()
            ->orderBy('project_members.display_order');
    }

    /**
     * @return HasMany<ProjectMember, $this>
     */
    public function projectMembers(): HasMany
    {
        return $this->hasMany(ProjectMember::class)->orderBy('display_order');
    }

    /**
     * @return HasMany<Evaluation, $this>
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }
}
