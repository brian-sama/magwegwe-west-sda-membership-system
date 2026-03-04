<?php

namespace App\Http\Requests\Member;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:120'],
            'last_name' => ['sometimes', 'required', 'string', 'max:120'],
            'gender' => ['nullable', 'in:Male,Female,Other'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:190'],
            'national_id' => ['nullable', 'string', 'max:60'],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'baptism_date' => ['nullable', 'date'],
            'society_id' => ['nullable', 'integer', 'exists:societies,id'],
            'status' => ['sometimes', 'required', 'in:BAPTIZED,TRANSFERRED_IN,ACTIVE,INACTIVE,TRANSFERRED_OUT'],
            'department' => ['nullable', 'string', 'max:255'],
            'previous_church' => ['nullable', 'string', 'max:190'],
            'destination_church' => ['nullable', 'string', 'max:190'],
            'transfer_date' => ['nullable', 'date'],
            'board_approval_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
