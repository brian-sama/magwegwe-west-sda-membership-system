<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\ScanAttendanceRequest;
use App\Http\Requests\Attendance\StoreAttendanceRequest;
use App\Models\Attendance;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Attendance::query()->with('member');

        if ($eventType = $request->string('event_type')->toString()) {
            $query->where('event_type', $eventType);
        }

        if ($from = $request->string('date_from')->toString()) {
            $query->whereDate('date', '>=', $from);
        }

        if ($to = $request->string('date_to')->toString()) {
            $query->whereDate('date', '<=', $to);
        }

        return $this->paginated($query->latest('date')->paginate((int) $request->integer('perPage', 25)));
    }

    public function store(StoreAttendanceRequest $request): JsonResponse
    {
        $attendance = Attendance::query()->updateOrCreate(
            [
                'member_id' => $request->integer('member_id'),
                'event_type' => $request->string('event_type')->toString(),
                'date' => $request->date('date')?->toDateString() ?? $request->string('date')->toString(),
            ],
            [
                'status' => $request->input('status', 'Present'),
            ]
        );

        return $this->success($attendance->load('member'), 201);
    }

    public function scan(ScanAttendanceRequest $request): JsonResponse
    {
        $memberId = $request->input('member_id');

        if (! $memberId && $request->filled('qr_payload')) {
            $decoded = json_decode($request->string('qr_payload')->toString(), true);
            $memberId = $decoded['member_id'] ?? null;
        }

        if (! $memberId) {
            return $this->error('Could not resolve member from scan payload.', 422);
        }

        $attendance = Attendance::query()->firstOrCreate([
            'member_id' => (int) $memberId,
            'event_type' => $request->string('event_type')->toString(),
            'date' => $request->date('date')?->toDateString() ?? $request->string('date')->toString(),
        ], [
            'status' => 'Present',
        ]);

        return $this->success([
            'recorded' => true,
            'attendance' => $attendance,
        ], 201);
    }

    public function show(Attendance $attendance): JsonResponse
    {
        return $this->success($attendance->load('member'));
    }

    public function update(StoreAttendanceRequest $request, Attendance $attendance): JsonResponse
    {
        $attendance->update($request->validated());

        return $this->success($attendance->fresh()->load('member'));
    }

    public function destroy(Attendance $attendance): JsonResponse
    {
        $attendance->delete();

        return $this->message('Attendance record deleted.');
    }
}
