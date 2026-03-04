<?php

namespace App\Http\Requests\Youth;

use Illuminate\Foundation\Http\FormRequest;

class StoreYouthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
            'first_name' => ['required_without:member_id', 'string', 'max:120'],
            'last_name' => ['required_without:member_id', 'string', 'max:120'],
            'school' => ['nullable', 'string', 'max:120'],
            'guardian_name' => ['nullable', 'string', 'max:120'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'grade' => ['nullable', 'string', 'max:40'],
            'club' => ['nullable', 'in:PATHFINDER,ADVENTURER'],
            'rank' => ['nullable', 'string', 'max:60'],
            'health_notes' => ['nullable', 'string'],
        ];
    }
}
