<?php

declare(strict_types=1);

use App\Config;
use App\Database;

require_once __DIR__.'/../src/bootstrap.php';

Config::init(dirname(__DIR__));

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run via CLI: php scripts/check_integrity.php\n");
    exit(1);
}

$pdo = Database::target();

$checks = [
    'users' => countTable($pdo, 'users'),
    'members' => countTable($pdo, 'members'),
    'societies' => countTable($pdo, 'societies'),
    'member_societies' => countTable($pdo, 'member_societies'),
    'youth' => countTable($pdo, 'youth'),
    'attendance' => countTable($pdo, 'attendance'),
    'audit_logs' => countTable($pdo, 'audit_logs'),
    'notifications' => countTable($pdo, 'notifications'),
    'failed_notifications' => countTable($pdo, 'failed_notifications'),
    'orphans_youth_member' => countByQuery($pdo, 'SELECT COUNT(*) FROM youth y LEFT JOIN members m ON m.id = y.member_id WHERE m.id IS NULL'),
    'orphans_attendance_member' => countByQuery($pdo, 'SELECT COUNT(*) FROM attendance a LEFT JOIN members m ON m.id = a.member_id WHERE m.id IS NULL'),
    'orphans_ms_member' => countByQuery($pdo, 'SELECT COUNT(*) FROM member_societies ms LEFT JOIN members m ON m.id = ms.member_id WHERE m.id IS NULL'),
    'orphans_ms_society' => countByQuery($pdo, 'SELECT COUNT(*) FROM member_societies ms LEFT JOIN societies s ON s.id = ms.society_id WHERE s.id IS NULL'),
];

foreach ($checks as $name => $value) {
    echo sprintf("%-28s %d\n", $name, $value);
}

function tableExists(PDO $pdo, string $table): bool
{
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table');
    $stmt->execute(['table' => $table]);
    return (int) $stmt->fetchColumn() > 0;
}

function countTable(PDO $pdo, string $table): int
{
    if (!tableExists($pdo, $table)) {
        return 0;
    }

    return (int) $pdo->query('SELECT COUNT(*) FROM `'.$table.'`')->fetchColumn();
}

function countByQuery(PDO $pdo, string $sql): int
{
    return (int) $pdo->query($sql)->fetchColumn();
}