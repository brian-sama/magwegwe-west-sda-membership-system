<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    public function global(Request $request): JsonResponse
    {
        $q = trim($request->string('q')->toString());

        if ($q === '') {
            return $this->success([]);
        }

        $results = Member::query()
            ->with('societies')
            ->where(function ($query) use ($q) {
                $query->whereRaw("concat(first_name, ' ', last_name) like ?", ["%{$q}%"])
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhereHas('societies', function ($societyQuery) use ($q) {
                        $societyQuery->where('name', 'like', "%{$q}%");
                    });
            })
            ->limit(25)
            ->get();

        return $this->success($results);
    }
}
