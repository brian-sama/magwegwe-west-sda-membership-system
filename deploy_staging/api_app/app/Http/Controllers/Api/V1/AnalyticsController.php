<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Society;
use App\Services\Ai\GeminiAnalyticsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly GeminiAnalyticsService $gemini)
    {
    }

    public function insights(Request $request): JsonResponse
    {
        $query = $request->string('query')->toString() ?: 'Provide church membership insights.';

        $context = [
            'members_total' => Member::query()->count(),
            'youth_total' => Member::query()->whereHas('youthProfiles')->count(),
            'societies_total' => Society::query()->count(),
            'attendance_total' => Attendance::query()->count(),
            'inactive_members' => Member::query()->where('status', 'INACTIVE')->count(),
        ];

        $insight = $this->gemini->generate($query, $context);

        return $this->success([
            'query' => $query,
            'context' => $context,
            'insight' => $insight,
        ]);
    }
}
