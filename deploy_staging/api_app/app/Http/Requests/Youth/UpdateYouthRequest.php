<?php

namespace App\Http\Requests\Youth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateYouthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
