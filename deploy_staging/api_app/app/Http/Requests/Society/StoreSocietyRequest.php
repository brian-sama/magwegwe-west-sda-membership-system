<?php

namespace App\Http\Requests\Society;

use Illuminate\Foundation\Http\FormRequest;

class StoreSocietyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'unique:societies,name'],
            'leader' => ['nullable', 'string', 'max:120'],
            'assistant_leader' => ['nullable', 'string', 'max:120'],
            'meeting_day' => ['nullable', 'string', 'max:40'],
        ];
    }
}
