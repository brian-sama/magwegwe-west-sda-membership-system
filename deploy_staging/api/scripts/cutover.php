<?php

declare(strict_types=1);

use App\Config;
use App\Database;

require_once __DIR__.'/../src/bootstrap.php';

Config::init(dirname(__DIR__));

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this script via CLI: php scripts/cutover.php\n");
    exit(1);
}

$target = Database::target();
$source = Database::source();

$sameDb = sameDb();
$type = detectSourceType($source);
$sourceMap = sourceMap($type);

echo "[1/5] Source type: {$type}".($sameDb ? ' (same DB)' : '')."\n";

if ($sameDb) {
    echo "[2/5] Snapshot source tables...\n";
    foreach ($sourceMap as $key => $table) {
        if (!tableExists($target, $table)) {
            continue;
        }
        $snap = '_srcbak_'.$table;
        $target->exec('DROP TABLE IF EXISTS `'.$snap.'`');
        $target->exec('CREATE TABLE `'.$snap.'` AS SELECT * FROM `'.$table.'`');
        $sourceMap[$key] = $snap;
    }
} else {
    echo "[2/5] Snapshot skipped (different source DB).\n";
}

$tag = date('Ymd_His');
echo "[3/5] Backup target tables ({$tag})...\n";
backupTarget($target, $tag);

echo "[4/5] Apply fresh schema...\n";
applySchema($target, dirname(__DIR__).'/database/schema.sql');

echo "[5/5] Migrate data...\n";
if ($type === 'laravel') {
    migrateLaravel($target, $sourceMap);
} else {
    migrateLegacy($target, $sourceMap);
}

echo "Integrity checks...\n";
$checks = [
    'users' => countTable($target, 'users'),
    'members' => countTable($target, 'members'),
    'societies' => countTable($target, 'societies'),
    'member_societies' => countTable($target, 'member_societies'),
    'youth' => countTable($target, 'youth'),
    'attendance' => countTable($target, 'attendance'),
    'audit_logs' => countTable($target, 'audit_logs'),
    'notifications' => countTable($target, 'notifications'),
    'failed_notifications' => countTable($target, 'failed_notifications'),
    'orphans_youth_member' => countByQuery($target, 'SELECT COUNT(*) FROM youth y LEFT JOIN members m ON m.id = y.member_id WHERE m.id IS NULL'),
    'orphans_attendance_member' => countByQuery($target, 'SELECT COUNT(*) FROM attendance a LEFT JOIN members m ON m.id = a.member_id WHERE m.id IS NULL'),
    'orphans_ms_member' => countByQuery($target, 'SELECT COUNT(*) FROM member_societies ms LEFT JOIN members m ON m.id = ms.member_id WHERE m.id IS NULL'),
    'orphans_ms_society' => countByQuery($target, 'SELECT COUNT(*) FROM member_societies ms LEFT JOIN societies s ON s.id = ms.society_id WHERE s.id IS NULL'),
];

foreach ($checks as $name => $value) {
    echo "- {$name}: {$value}\n";
}

echo "Cutover completed.\n";

function sameDb(): bool
{
    $s = Config::get('source_db', []);
    $t = Config::get('db', []);

    return ($s['host'] ?? '') === ($t['host'] ?? '')
        && (string) ($s['port'] ?? '') === (string) ($t['port'] ?? '')
        && ($s['database'] ?? '') === ($t['database'] ?? '')
        && ($s['username'] ?? '') === ($t['username'] ?? '');
}

function detectSourceType(PDO $source): string
{
    if (tableExists($source, 'youth') || tableExists($source, 'personal_access_tokens')) {
        return 'laravel';
    }
    if (tableExists($source, 'youth_members') || tableExists($source, 'society_members')) {
        return 'legacy';
    }
    throw new RuntimeException('Unable to detect source schema (expected Laravel or legacy tables).');
}

function sourceMap(string $type): array
{
    if ($type === 'laravel') {
        return [
            'users' => 'users',
            'members' => 'members',
            'societies' => 'societies',
            'member_societies' => 'member_societies',
            'youth' => 'youth',
            'attendance' => 'attendance',
            'audit_logs' => 'audit_logs',
            'notifications' => 'notifications',
            'failed_notifications' => 'failed_notifications',
        ];
    }

    return [
        'users' => 'users',
        'members' => 'members',
        'youth_members' => 'youth_members',
        'society_members' => 'society_members',
        'audit_logs' => 'audit_logs',
    ];
}

function backupTarget(PDO $pdo, string $tag): void
{
    $tables = ['failed_notifications','notifications','attendance','youth','member_societies','members','societies','audit_logs','token_blocklist','users'];
    foreach ($tables as $table) {
        if (!tableExists($pdo, $table)) {
            continue;
        }
        $backup = 'backup_'.$table.'_'.$tag;
        $pdo->exec('DROP TABLE IF EXISTS `'.$backup.'`');
        $pdo->exec('CREATE TABLE `'.$backup.'` AS SELECT * FROM `'.$table.'`');
    }
}

function applySchema(PDO $pdo, string $schemaPath): void
{
    $sql = file_get_contents($schemaPath);
    if ($sql === false) {
        throw new RuntimeException('Unable to read schema file: '.$schemaPath);
    }

    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        $pdo->exec($statement);
    }
}

function migrateLaravel(PDO $pdo, array $m): void
{
    if (tableExists($pdo, $m['users'])) {
        $pdo->exec("INSERT INTO users (id,name,email,password,role,last_login,created_at,updated_at)
            SELECT CAST(id AS CHAR), name, email, password,
            CASE UPPER(role)
                WHEN 'ADMIN' THEN 'Admin'
                WHEN 'PASTOR' THEN 'Pastor'
                WHEN 'CLERK' THEN 'Clerk'
                ELSE 'Viewer'
            END,
            last_login, COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['users']}`");
    }

    if (tableExists($pdo, $m['societies'])) {
        $pdo->exec("INSERT INTO societies (id,name,leader,assistant_leader,meeting_day,created_at,updated_at)
            SELECT CAST(id AS CHAR), name, leader, assistant_leader, meeting_day,
            COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['societies']}`");
    }

    if (tableExists($pdo, $m['members'])) {
        $pdo->exec("INSERT INTO members (
            id,first_name,last_name,gender,phone,email,national_id,date_of_birth,address,baptism_date,
            society_id,status,department,previous_church,destination_church,transfer_date,board_approval_date,notes,created_at,updated_at
        ) SELECT
            CAST(id AS CHAR), first_name, last_name, gender, phone, email, national_id, date_of_birth, address, baptism_date,
            CASE WHEN society_id IS NULL THEN NULL ELSE CAST(society_id AS CHAR) END,
            UPPER(COALESCE(status,'ACTIVE')),
            department, previous_church, destination_church, transfer_date, board_approval_date, notes,
            COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['members']}`");
    }

    if (tableExists($pdo, $m['member_societies'])) {
        $pdo->exec("INSERT INTO member_societies (id,member_id,society_id,skills,created_at,updated_at)
            SELECT CAST(id AS CHAR), CAST(member_id AS CHAR), CAST(society_id AS CHAR), skills,
            COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['member_societies']}`");
    }

    if (tableExists($pdo, $m['youth'])) {
        $pdo->exec("INSERT INTO youth (id,member_id,school,guardian_name,guardian_phone,grade,club,rank,health_notes,created_at,updated_at)
            SELECT CAST(id AS CHAR), CAST(member_id AS CHAR), school, guardian_name, guardian_phone, grade, club, rank, health_notes,
            COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['youth']}`");
    }

    if (tableExists($pdo, $m['attendance'])) {
        $pdo->exec("INSERT INTO attendance (id,member_id,event_type,date,status,created_at,updated_at)
            SELECT CAST(id AS CHAR), CAST(member_id AS CHAR), event_type, date, status,
            COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['attendance']}`");
    }

    if (tableExists($pdo, $m['audit_logs'])) {
        $pdo->exec("INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,ip_address,created_at)
            SELECT CAST(id AS CHAR), CASE WHEN user_id IS NULL THEN NULL ELSE CAST(user_id AS CHAR) END,
            action, entity_type, entity_id, ip_address, COALESCE(created_at,NOW())
            FROM `{$m['audit_logs']}`");
    }

    if (tableExists($pdo, $m['notifications'])) {
        $pdo->exec("INSERT INTO notifications (id,channel,provider,recipient,message,status,response_payload,sent_at,created_at,updated_at)
            SELECT CAST(id AS CHAR), channel, provider, recipient, message, status, response_payload, sent_at,
            COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['notifications']}`");
    }

    if (tableExists($pdo, $m['failed_notifications'])) {
        $pdo->exec("INSERT INTO failed_notifications (id,notification_id,provider,recipient,message,reason,payload,failed_at,created_at,updated_at)
            SELECT CAST(id AS CHAR), CASE WHEN notification_id IS NULL THEN NULL ELSE CAST(notification_id AS CHAR) END,
            provider, recipient, message, reason, payload, COALESCE(failed_at,NOW()),
            COALESCE(created_at,NOW()), COALESCE(updated_at,COALESCE(created_at,NOW()))
            FROM `{$m['failed_notifications']}`");
    }
}

function migrateLegacy(PDO $pdo, array $m): void
{
    if (tableExists($pdo, $m['users'])) {
        $pdo->exec("INSERT INTO users (id,name,email,password,role,last_login,created_at,updated_at)
            SELECT CAST(id AS CHAR), name, email, password_hash,
            CASE UPPER(role)
                WHEN 'ADMIN' THEN 'Admin'
                WHEN 'PASTOR' THEN 'Pastor'
                WHEN 'CLERK' THEN 'Clerk'
                ELSE 'Viewer'
            END,
            last_login, COALESCE(created_at,NOW()), COALESCE(created_at,NOW())
            FROM `{$m['users']}`");
    }

    if (tableExists($pdo, $m['members'])) {
        $pdo->exec("INSERT INTO members (
            id,first_name,last_name,gender,phone,email,national_id,date_of_birth,address,baptism_date,
            society_id,status,department,previous_church,destination_church,transfer_date,board_approval_date,notes,created_at,updated_at
        ) SELECT
            CAST(id AS CHAR), first_name, last_name, NULL, phone, email, national_id, NULL, address, baptism_date,
            NULL, UPPER(COALESCE(status,'ACTIVE')), department, previous_church, destination_church, transfer_date, board_approval_date, notes,
            COALESCE(created_at, CONCAT(registration_date,' 00:00:00'), NOW()),
            COALESCE(updated_at, COALESCE(created_at, CONCAT(registration_date,' 00:00:00'), NOW()))
            FROM `{$m['members']}`");
    }

    if (tableExists($pdo, $m['society_members'])) {
        $pdo->exec("INSERT INTO societies (id,name,leader,assistant_leader,meeting_day,created_at,updated_at)
            SELECT SHA2(CONCAT('society_',UPPER(type)),256), UPPER(type), NULL, NULL, NULL, NOW(), NOW()
            FROM `{$m['society_members']}`
            GROUP BY UPPER(type)");

        $pdo->exec("INSERT IGNORE INTO members (
            id,first_name,last_name,gender,phone,email,national_id,date_of_birth,address,baptism_date,
            society_id,status,department,previous_church,destination_church,transfer_date,board_approval_date,notes,created_at,updated_at
        ) SELECT
            CAST(sm.id AS CHAR), sm.first_name, sm.last_name, NULL, sm.phone, NULL, sm.national_id, NULL, NULL, NULL,
            SHA2(CONCAT('society_',UPPER(sm.type)),256), 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL,
            COALESCE(sm.created_at, CONCAT(sm.registration_date,' 00:00:00'), NOW()),
            COALESCE(sm.created_at, CONCAT(sm.registration_date,' 00:00:00'), NOW())
            FROM `{$m['society_members']}` sm");

        $pdo->exec("INSERT INTO member_societies (id,member_id,society_id,skills,created_at,updated_at)
            SELECT SHA2(CONCAT('ms_',sm.id,'_',UPPER(sm.type)),256), CAST(sm.id AS CHAR), SHA2(CONCAT('society_',UPPER(sm.type)),256), sm.skills,
            COALESCE(sm.created_at, CONCAT(sm.registration_date,' 00:00:00'), NOW()),
            COALESCE(sm.created_at, CONCAT(sm.registration_date,' 00:00:00'), NOW())
            FROM `{$m['society_members']}` sm");
    }

    if (tableExists($pdo, $m['youth_members'])) {
        $pdo->exec("INSERT IGNORE INTO members (
            id,first_name,last_name,gender,phone,email,national_id,date_of_birth,address,baptism_date,
            society_id,status,department,previous_church,destination_church,transfer_date,board_approval_date,notes,created_at,updated_at
        ) SELECT
            CAST(ym.id AS CHAR), ym.first_name, ym.last_name, NULL, NULL, NULL, NULL, ym.dob, NULL, NULL,
            NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL,
            COALESCE(ym.created_at, CONCAT(ym.registration_date,' 00:00:00'), NOW()),
            COALESCE(ym.created_at, CONCAT(ym.registration_date,' 00:00:00'), NOW())
            FROM `{$m['youth_members']}` ym");

        $pdo->exec("INSERT INTO youth (id,member_id,school,guardian_name,guardian_phone,grade,club,rank,health_notes,created_at,updated_at)
            SELECT SHA2(CONCAT('y_',ym.id),256), CAST(ym.id AS CHAR), NULL, ym.parent_name, ym.parent_phone, ym.grade, ym.club, ym.rank, ym.health_notes,
            COALESCE(ym.created_at, CONCAT(ym.registration_date,' 00:00:00'), NOW()),
            COALESCE(ym.created_at, CONCAT(ym.registration_date,' 00:00:00'), NOW())
            FROM `{$m['youth_members']}` ym");
    }

    if (tableExists($pdo, $m['audit_logs'])) {
        $pdo->exec("INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,ip_address,created_at)
            SELECT CAST(id AS CHAR), user_id, action, 'manual', details, NULL, COALESCE(timestamp,NOW())
            FROM `{$m['audit_logs']}`");
    }
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
    $stmt = $pdo->query('SELECT COUNT(*) FROM `'.$table.'`');
    return (int) $stmt->fetchColumn();
}

function countByQuery(PDO $pdo, string $sql): int
{
    $stmt = $pdo->query($sql);
    return (int) $stmt->fetchColumn();
}