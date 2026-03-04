<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\Member;
use App\Models\Society;
use App\Models\Youth;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportLegacyDataCommand extends Command
{
    protected $signature = 'legacy:import';

    protected $description = 'Import legacy Node/PHP tables into new normalized schema';

    public function handle(): int
    {
        $this->importLegacyMembers();
        $this->importLegacyYouth();
        $this->importLegacySocietyMembers();
        $this->importLegacyAuditLogs();

        $this->info('Legacy import finished.');

        return self::SUCCESS;
    }

    private function importLegacyMembers(): void
    {
        if (! $this->tableExists('legacy_members')) {
            $this->warn('legacy_members not found, skipping members import.');
            return;
        }

        DB::table('legacy_members')->orderBy('id')->chunk(250, function ($rows) {
            foreach ($rows as $row) {
                Member::query()->updateOrCreate(
                    [
                        'national_id' => $row->national_id,
                        'first_name' => $row->first_name,
                        'last_name' => $row->last_name,
                    ],
                    [
                        'email' => $row->email,
                        'phone' => $row->phone,
                        'status' => $row->status ?: 'ACTIVE',
                        'department' => $row->department,
                        'baptism_date' => $row->baptism_date,
                        'previous_church' => $row->previous_church,
                        'destination_church' => $row->destination_church,
                        'transfer_date' => $row->transfer_date,
                        'board_approval_date' => $row->board_approval_date,
                        'address' => $row->address,
                        'notes' => $row->notes,
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => $row->updated_at ?? now(),
                    ]
                );
            }
        });

        $this->info('Imported legacy_members.');
    }

    private function importLegacyYouth(): void
    {
        if (! $this->tableExists('legacy_youth_members')) {
            $this->warn('legacy_youth_members not found, skipping youth import.');
            return;
        }

        DB::table('legacy_youth_members')->orderBy('id')->chunk(250, function ($rows) {
            foreach ($rows as $row) {
                $member = Member::query()->firstOrCreate(
                    [
                        'first_name' => $row->first_name,
                        'last_name' => $row->last_name,
                        'phone' => $row->parent_phone,
                    ],
                    [
                        'status' => 'ACTIVE',
                        'date_of_birth' => $row->dob,
                    ]
                );

                Youth::query()->updateOrCreate(
                    ['member_id' => $member->id, 'club' => $row->club],
                    [
                        'school' => $row->school ?? null,
                        'guardian_name' => $row->parent_name,
                        'guardian_phone' => $row->parent_phone,
                        'grade' => $row->grade,
                        'rank' => $row->rank,
                        'health_notes' => $row->health_notes,
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => $row->created_at ?? now(),
                    ]
                );
            }
        });

        $this->info('Imported legacy_youth_members.');
    }

    private function importLegacySocietyMembers(): void
    {
        if (! $this->tableExists('legacy_society_members')) {
            $this->warn('legacy_society_members not found, skipping society members import.');
            return;
        }

        DB::table('legacy_society_members')->orderBy('id')->chunk(250, function ($rows) {
            foreach ($rows as $row) {
                $society = Society::query()->firstOrCreate(['name' => strtoupper($row->type)]);

                $member = Member::query()->firstOrCreate(
                    [
                        'first_name' => $row->first_name,
                        'last_name' => $row->last_name,
                        'national_id' => $row->national_id,
                    ],
                    [
                        'phone' => $row->phone,
                        'status' => 'ACTIVE',
                    ]
                );

                $member->societies()->syncWithoutDetaching([
                    $society->id => [
                        'skills' => $row->skills,
                    ],
                ]);
            }
        });

        $this->info('Imported legacy_society_members.');
    }

    private function importLegacyAuditLogs(): void
    {
        if (! $this->tableExists('legacy_audit_logs')) {
            $this->warn('legacy_audit_logs not found, skipping audit import.');
            return;
        }

        DB::table('legacy_audit_logs')->orderBy('id')->chunk(250, function ($rows) {
            foreach ($rows as $row) {
                AuditLog::query()->create([
                    'user_id' => $row->user_id,
                    'action' => $row->action,
                    'entity_type' => 'legacy',
                    'entity_id' => $row->id,
                    'ip_address' => null,
                    'created_at' => $row->timestamp ?? now(),
                ]);
            }
        });

        $this->info('Imported legacy_audit_logs.');
    }

    private function tableExists(string $table): bool
    {
        return DB::getSchemaBuilder()->hasTable($table);
    }
}
