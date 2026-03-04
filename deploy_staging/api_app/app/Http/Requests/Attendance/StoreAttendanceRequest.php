<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'event_type' => ['required', 'in:Sabbath,Youth,Society,Campmeeting'],
            'date' => ['required', 'date'],
            'status' => ['nullable', 'in:Present,Absent,Late'],
        ];
    }
}
