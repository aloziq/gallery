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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->nullable()->after('email_verified_at');
        });

        Schema::table('evaluations', function (Blueprint $table) {
            $table->integer('weight')->default(1)->after('rating');
            $table->text('comment')->nullable()->after('weight');
            $table->string('evaluator_name')->nullable()->after('comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn(['weight', 'comment', 'evaluator_name']);
        });
    }
};
