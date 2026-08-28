<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ExhibitionBackupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exhibition:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup the SQLite database and uploaded images';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting exhibition backup...');

        $backupDir = storage_path('app/backups');
        if (! is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d_H-i-s');

        // Backup Database
        $dbPath = database_path('database.sqlite');
        if (file_exists($dbPath)) {
            $dbBackupPath = $backupDir.'/database_'.$timestamp.'.sqlite';
            copy($dbPath, $dbBackupPath);
            $this->info("Database backed up to: {$dbBackupPath}");
        } else {
            $this->error("Database file not found at: {$dbPath}");
        }

        $this->info('Backup completed successfully.');
    }
}
