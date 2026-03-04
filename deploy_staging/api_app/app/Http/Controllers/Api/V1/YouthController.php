<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Youth\StoreYouthRequest;
use App\Http\Requests\Youth\UpdateYouthRequest;
use App\Models\Member;
use App\Models\Youth;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class YouthController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Youth::query()->with('member');

        if ($club = $request->string('club')->toString()) {
            $query->where('club', $club);
        }

        return $this->paginated($query->latest()->paginate((int) $request->integer('perPage', 25)));
    }

    public function store(StoreYouthRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $memberId = $validated['member_id'] ?? null;

        if (! $memberId) {
            $member = Member::query()->create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'status' => 'ACTIVE',
            ]);
            $memberId = $member->id;
        }

        $youth = Youth::query()->create([
            'member_id' => $memberId,
            'school' => $validated['school'] ?? null,
            'guardian_name' => $validated['guardian_name'] ?? null,
            'guardian_phone' => $validated['guardian_phone'] ?? null,
            'grade' => $validated['grade'] ?? null,
            'club' => $validated['club'] ?? null,
            'rank' => $validated['rank'] ?? null,
            'health_notes' => $validated['health_notes'] ?? null,
        ]);

        return $this->success($youth->load('member'), 201);
    }

    public function show(Youth $youth): JsonResponse
    {
        return $this->success($youth->load('member'));
    }

    public function update(UpdateYouthRequest $request, Youth $youth): JsonResponse
    {
        $youth->update($request->validated());

        return $this->success($youth->fresh()->load('member'));
    }

    public function destroy(Youth $youth): JsonResponse
    {
        $youth->delete();

        return $this->message('Youth profile deleted.');
    }
}
