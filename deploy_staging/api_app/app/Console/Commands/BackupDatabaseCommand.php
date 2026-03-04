<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class BackupDatabaseCommand extends Command
{
    protected $signature = 'backup:database';

    protected $description = 'Create a SQL backup of the configured MySQL database';

    public function handle(): int
    {
        if (config('database.default') !== 'mysql') {
            $this->warn('Skipping backup because current default database is not MySQL.');
            return self::SUCCESS;
        }

        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port');
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');

        $backupDir = storage_path('app/backups');
        if (! is_dir($backupDir)) {
            mkdir($backupDir, 0775, true);
        }

        $file = sprintf('%s/%s_%s.sql', $backupDir, $database, now()->format('Ymd_His'));
        $command = sprintf(
            'mysqldump -h%s -P%s -u%s -p"%s" %s > "%s"',
            $host,
            $port,
            $username,
            $password,
            $database,
            $file
        );

        $result = Process::run($command);

        if ($result->failed()) {
            $this->error('Backup failed: '.$result->errorOutput());
            return self::FAILURE;
        }

        $this->info('Backup created: '.$file);

        return self::SUCCESS;
    }
}
