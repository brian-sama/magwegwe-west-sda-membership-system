<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class ScanAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required_without:qr_payload', 'integer', 'exists:members,id'],
            'qr_payload' => ['required_without:member_id', 'string'],
            'event_type' => ['required', 'in:Sabbath,Youth,Society,Campmeeting'],
            'date' => ['required', 'date'],
        ];
    }
}
