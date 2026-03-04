<?php

namespace App\Http\Requests\Society;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSocietyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120', Rule::unique('societies', 'name')->ignore($this->route('society'))],
            'leader' => ['nullable', 'string', 'max:120'],
            'assistant_leader' => ['nullable', 'string', 'max:120'],
            'meeting_day' => ['nullable', 'string', 'max:40'],
        ];
    }
}
