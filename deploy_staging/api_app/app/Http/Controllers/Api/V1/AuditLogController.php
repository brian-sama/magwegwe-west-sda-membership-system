<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->with('user');

        if ($action = $request->string('action')->toString()) {
            $query->where('action', 'like', "%{$action}%");
        }

        if ($entityType = $request->string('entity_type')->toString()) {
            $query->where('entity_type', $entityType);
        }

        return $this->paginated($query->latest('created_at')->paginate((int) $request->integer('perPage', 100)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'userId' => ['nullable'],
            'action' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
        ]);

        $log = AuditLog::query()->create([
            'user_id' => $validated['userId'] ?? optional($request->user())->id,
            'action' => $validated['action'],
            'entity_type' => 'manual',
            'entity_id' => null,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return $this->success($log, 201);
    }
}
