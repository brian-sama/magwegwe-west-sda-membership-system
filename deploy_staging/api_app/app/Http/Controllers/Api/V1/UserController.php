<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->paginated(
            User::query()->select(['id', 'name', 'email', 'role', 'last_login', 'created_at'])->paginate((int) $request->integer('perPage', 25))
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        $user->syncRoles([$validated['role']]);

        return $this->success($user->only(['id', 'name', 'email', 'role', 'last_login', 'created_at']), 201);
    }

    public function show(User $user): JsonResponse
    {
        return $this->success($user->only(['id', 'name', 'email', 'role', 'last_login', 'created_at']));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return $this->success($user->fresh()->only(['id', 'name', 'email', 'role', 'last_login', 'created_at']));
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return $this->message('User deleted.');
    }
}
