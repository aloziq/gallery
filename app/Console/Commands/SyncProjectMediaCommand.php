<?php

namespace App\Console\Commands;

use App\Services\MediaSyncService;
use Illuminate\Console\Command;

class SyncProjectMediaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'projects:sync-media
                            {--source= : Path to local directory or .zip file containing Google Drive downloads}
                            {--download : Attempt direct HTTP download from Google Drive (if links are shared publicly)}
                            {--generate-fallbacks : Generate branded SVG cover banners for projects without screenshots}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ingest, download, and database-link project screenshots, documents, and member photos';

    /**
     * Execute the console command.
     */
    public function handle(MediaSyncService $service): int
    {
        $this->info('Initializing media sync catalog from projects.xlsx...');
        $catalog = $service->buildMediaCatalog();
        $this->info('Indexed '.count($catalog).' projects.');

        $source = $this->option('source');
        $download = $this->option('download');
        $generateFallbacks = $this->option('generate-fallbacks');

        $hasAction = false;

        // 1. Ingest from local directory or ZIP
        if ($source) {
            $hasAction = true;
            $sourcePath = base_path($source);
            if (! file_exists($sourcePath)) {
                $sourcePath = $source; // Try absolute path
            }

            if (! file_exists($sourcePath)) {
                $this->error("Source path not found: {$source}");

                return self::FAILURE;
            }

            $this->info("Ingesting media from: {$sourcePath}");
            $counts = $service->ingestFromSource($sourcePath);

            $this->info('Ingestion completed:');
            $this->line("  - Screenshots linked: {$counts['screenshots']}");
            $this->line("  - Documents linked:   {$counts['documents']}");
            $this->line("  - Member portraits:   {$counts['member_photos']}");
        }

        // 2. Direct download from Google Drive
        if ($download) {
            $hasAction = true;
            $this->info('Attempting direct download of public Google Drive files...');
            $counts = $service->downloadDirect();

            $this->info('Direct download completed:');
            $this->line("  - Screenshots downloaded: {$counts['screenshots']}");
            $this->line("  - Documents downloaded:   {$counts['documents']}");
            $this->line("  - Member portraits:       {$counts['member_photos']}");
        }

        // 3. Fallback SVG banner generation
        if ($generateFallbacks || ! $hasAction) {
            $this->info('Checking for projects lacking cover images...');
            $generated = $service->generateFallbackCovers();

            if ($generated > 0) {
                $this->info("Generated {$generated} branded SVG cover banners for projects without screenshots.");
            } else {
                $this->info('All projects already have cover images.');
            }
        }

        $this->info('Media sync complete! Storage link is ready at public/storage.');

        return self::SUCCESS;
    }
}
