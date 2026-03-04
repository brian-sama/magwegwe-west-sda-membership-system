<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Society\UpdateSocietyRequest;
use App\Models\Member;
use App\Models\Society;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SocietyController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('members')) {
            $flattened = Society::query()
                ->with(['members'])
                ->get()
                ->flatMap(function (Society $society) {
                    return $society->members->map(function (Member $member) use ($society) {
                        return [
                            'id' => (string) $member->id,
                            'firstName' => $member->first_name,
                            'lastName' => $member->last_name,
                            'nationalId' => $member->national_id,
                            'phone' => $member->phone,
                            'type' => strtoupper($society->name),
                            'skills' => $member->pivot?->skills,
                            'registrationDate' => optional($member->pivot?->created_at)->toISOString(),
                        ];
                    });
                })
                ->values();

            return $this->success($flattened);
        }

        $query = Society::query()->withCount('members');

        if ($search = $request->string('q')->toString()) {
            $query->where('name', 'like', "%{$search}%");
        }

        return $this->paginated($query->orderBy('name')->paginate((int) $request->integer('perPage', 25)));
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->hasAny(['type', 'firstName', 'first_name'])) {
            return $this->storeLegacyMembership($request);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:societies,name'],
            'leader' => ['nullable', 'string', 'max:120'],
            'assistant_leader' => ['nullable', 'string', 'max:120'],
            'meeting_day' => ['nullable', 'string', 'max:40'],
        ]);

        return $this->success(Society::query()->create($validated), 201);
    }

    private function storeLegacyMembership(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required_without:firstName', 'string', 'max:120'],
            'firstName' => ['required_without:first_name', 'string', 'max:120'],
            'last_name' => ['required_without:lastName', 'string', 'max:120'],
            'lastName' => ['required_without:last_name', 'string', 'max:120'],
            'national_id' => ['nullable', 'string', 'max:60'],
            'nationalId' => ['nullable', 'string', 'max:60'],
            'phone' => ['nullable', 'string', 'max:30'],
            'type' => ['required', 'string', 'max:60'],
            'skills' => ['nullable', 'string'],
        ]);

        $society = Society::query()->firstOrCreate([
            'name' => strtoupper($data['type']),
        ], [
            'leader' => null,
            'assistant_leader' => null,
            'meeting_day' => null,
        ]);

        $member = Member::query()->create([
            'first_name' => $data['first_name'] ?? $data['firstName'],
            'last_name' => $data['last_name'] ?? $data['lastName'],
            'national_id' => $data['national_id'] ?? ($data['nationalId'] ?? null),
            'phone' => $data['phone'] ?? null,
            'status' => 'ACTIVE',
        ]);

        $member->societies()->attach($society->id, [
            'skills' => $data['skills'] ?? null,
        ]);

        return $this->success([
            'id' => (string) $member->id,
            'firstName' => $member->first_name,
            'lastName' => $member->last_name,
            'nationalId' => $member->national_id,
            'phone' => $member->phone,
            'type' => strtoupper($society->name),
            'skills' => $data['skills'] ?? null,
            'registrationDate' => now()->toISOString(),
        ], 201);
    }

    public function show(Society $society): JsonResponse
    {
        return $this->success($society->load('members'));
    }

    public function update(UpdateSocietyRequest $request, Society $society): JsonResponse
    {
        $society->update($request->validated());

        return $this->success($society);
    }

    public function destroy(Society $society): JsonResponse
    {
        $society->delete();

        return $this->message('Society deleted.');
    }
}
