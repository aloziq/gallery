<?php

namespace App\Console\Commands;

use App\Services\ExcelProjectImporter;
use Illuminate\Console\Command;

class ImportProjectsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'projects:import
                            {--file= : Optional path to projects.xlsx (defaults to base_path("projects.xlsx"))}
                            {--dry-run : Inspect and preview parsed projects without database changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import and normalize exhibition projects from projects.xlsx';

    /**
     * Execute the console command.
     */
    public function handle(ExcelProjectImporter $importer): int
    {
        $filePath = $this->option('file') ?: base_path('projects.xlsx');

        if (! file_exists($filePath)) {
            $this->error("Excel file not found at: {$filePath}");

            return self::FAILURE;
        }

        $this->info("Parsing projects from: {$filePath}");

        $parsed = $importer->parse($filePath);
        $this->info('Successfully parsed and normalized '.count($parsed).' unique projects.');

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN: Displaying preview (no database records created).');

            $tableRows = array_map(function ($p) {
                return [
                    $p['row_number'],
                    mb_substr($p['name'], 0, 32),
                    $p['academic_level'] ?? '-',
                    $p['gender'] ?? '-',
                    $p['department'] ?? 'None',
                    mb_substr($p['category'], 0, 20),
                    count($p['members']),
                    $p['whatsapp_phone'] ?? '-',
                    $p['demo_url'] ? 'Yes' : '-',
                    $p['github_url'] ? 'Yes' : '-',
                ];
            }, $parsed);

            $this->table(
                ['Row', 'Title', 'Level', 'Gender', 'Major', 'Category', 'Members', 'WhatsApp', 'Demo', 'GitHub'],
                $tableRows
            );

            return self::SUCCESS;
        }

        $this->info('Importing projects into the database...');
        $result = $importer->import($filePath);

        $this->info("Import complete! Created {$result['created_projects']} projects and {$result['created_members']} members.");

        return self::SUCCESS;
    }
}
