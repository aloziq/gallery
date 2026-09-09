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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('github_url')->nullable()->after('demo_url');
            $table->string('document_url')->nullable()->after('github_url');
            $table->string('academic_level', 10)->nullable()->after('department');
            $table->string('gender', 10)->nullable()->after('academic_level');
            $table->string('whatsapp_phone')->nullable()->after('gender');
            $table->string('contact_email')->nullable()->after('whatsapp_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'github_url',
                'document_url',
                'academic_level',
                'gender',
                'whatsapp_phone',
                'contact_email',
            ]);
        });
    }
};
