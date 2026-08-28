<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description')->nullable();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('team_name')->nullable();
            $table->string('department')->nullable();
            $table->string('category')->nullable();
            $table->string('technologies')->nullable();
            $table->string('demo_url')->nullable();
            $table->boolean('is_published')->default(true);
            $table->integer('display_order')->default(0);

            // Denormalized aggregates for extreme read performance
            $table->unsignedInteger('evaluations_count')->default(0)->index();
            $table->decimal('evaluations_avg_rating', 3, 2)->default(0.00)->index();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
