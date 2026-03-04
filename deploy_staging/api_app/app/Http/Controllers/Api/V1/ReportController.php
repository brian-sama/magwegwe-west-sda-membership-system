<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Society;
use App\Models\Youth;
use App\Support\ApiResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    use ApiResponse;

    public function members(Request $request)
    {
        return $this->export(
            ['Name', 'Email', 'Phone', 'Status', 'Baptism Date'],
            Member::query()->orderBy('last_name')->orderBy('first_name')->get()->map(fn ($m) => [
                trim($m->first_name.' '.$m->last_name),
                $m->email,
                $m->phone,
                $m->status,
                optional($m->baptism_date)->toDateString(),
            ])->toArray(),
            'members_report',
            $request
        );
    }

    public function youth(Request $request)
    {
        return $this->export(
            ['Name', 'Club', 'School', 'Guardian', 'Guardian Phone'],
            Youth::query()->with('member')->latest()->get()->map(fn ($y) => [
                $y->member ? trim($y->member->first_name.' '.$y->member->last_name) : '-',
                $y->club,
                $y->school,
                $y->guardian_name,
                $y->guardian_phone,
            ])->toArray(),
            'youth_report',
            $request
        );
    }

    public function societies(Request $request)
    {
        return $this->export(
            ['Society', 'Leader', 'Assistant Leader', 'Meeting Day', 'Members'],
            Society::query()->withCount('members')->orderBy('name')->get()->map(fn ($s) => [
                $s->name,
                $s->leader,
                $s->assistant_leader,
                $s->meeting_day,
                $s->members_count,
            ])->toArray(),
            'societies_report',
            $request
        );
    }

    public function attendance(Request $request)
    {
        return $this->export(
            ['Name', 'Event Type', 'Date', 'Status'],
            Attendance::query()->with('member')->latest('date')->get()->map(fn ($a) => [
                $a->member ? trim($a->member->first_name.' '.$a->member->last_name) : '-',
                $a->event_type?->value ?? $a->event_type,
                optional($a->date)->toDateString(),
                $a->status?->value ?? $a->status,
            ])->toArray(),
            'attendance_report',
            $request
        );
    }

    private function export(array $headings, array $rows, string $filename, Request $request)
    {
        $format = strtolower($request->string('format')->toString() ?: 'pdf');

        if ($format === 'xlsx') {
            $export = new class($headings, $rows) implements FromArray, WithHeadings {
                public function __construct(private array $headings, private array $rows)
                {
                }

                public function array(): array
                {
                    return $this->rows;
                }

                public function headings(): array
                {
                    return $this->headings;
                }
            };

            return Excel::download($export, $filename.'.xlsx');
        }

        $html = '<h1 style="font-family: sans-serif;">'.strtoupper(str_replace('_', ' ', $filename)).'</h1>';
        $html .= '<table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse; font-family: sans-serif;">';
        $html .= '<thead><tr>';
        foreach ($headings as $heading) {
            $html .= '<th>'.e($heading).'</th>';
        }
        $html .= '</tr></thead><tbody>';
        foreach ($rows as $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $html .= '<td>'.e((string) $cell).'</td>';
            }
            $html .= '</tr>';
        }
        $html .= '</tbody></table>';

        return Pdf::loadHTML($html)->download($filename.'.pdf');
    }
}
