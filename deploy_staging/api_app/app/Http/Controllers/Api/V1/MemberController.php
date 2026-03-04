<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreMemberRequest;
use App\Http\Requests\Member\UpdateMemberRequest;
use App\Models\Member;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class MemberController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Member::query()->with(['societies']);

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($inner) use ($search) {
                $inner->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('national_id', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($societyId = $request->integer('society_id')) {
            $query->where('society_id', $societyId);
        }

        return $this->paginated(
            $query->orderBy('last_name')->orderBy('first_name')->paginate((int) $request->integer('perPage', 25))
        );
    }

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $member = Member::query()->create($request->validated());

        if ($request->filled('societies')) {
            $member->societies()->sync($request->input('societies', []));
        }

        return $this->success($member->load('societies'), 201);
    }

    public function show(Member $member): JsonResponse
    {
        return $this->success($member->load(['societies', 'attendances', 'youthProfiles']));
    }

    public function update(UpdateMemberRequest $request, Member $member): JsonResponse
    {
        $member->update($request->validated());

        if ($request->has('societies')) {
            $member->societies()->sync($request->input('societies', []));
        }

        return $this->success($member->fresh()->load('societies'));
    }

    public function destroy(Member $member): JsonResponse
    {
        $member->delete();

        return $this->message('Member deleted.');
    }

    public function qr(Member $member)
    {
        $payload = json_encode([
            'member_id' => $member->id,
            'name' => trim($member->first_name.' '.$member->last_name),
        ]);

        $svg = QrCode::size(280)->generate($payload);

        return response($svg, 200, ['Content-Type' => 'image/svg+xml']);
    }
}
