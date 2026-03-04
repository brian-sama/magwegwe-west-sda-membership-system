<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\NotificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\SendSmsRequest;
use App\Models\Notification;
use App\Support\ApiResponse;
use App\Services\Sms\AfricasTalkingSmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AfricasTalkingSmsService $smsService)
    {
    }

    public function sendSms(SendSmsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $notification = Notification::query()->create([
            'channel' => 'sms',
            'provider' => 'africastalking',
            'recipient' => $validated['recipient'],
            'message' => $validated['message'],
            'status' => NotificationStatus::Pending,
        ]);

        $response = $this->smsService->send($validated['recipient'], $validated['message']);

        if ($response['success']) {
            $notification->update([
                'status' => NotificationStatus::Sent,
                'response_payload' => $response['payload'],
                'sent_at' => now(),
            ]);

            return $this->message('SMS sent successfully.', 200, ['data' => $notification->fresh()]);
        }

        $notification->update([
            'status' => NotificationStatus::Failed,
            'response_payload' => $response['payload'],
        ]);

        DB::table('failed_notifications')->insert([
            'notification_id' => $notification->id,
            'provider' => 'africastalking',
            'recipient' => $validated['recipient'],
            'message' => $validated['message'],
            'reason' => $response['message'],
            'payload' => json_encode($response['payload']),
            'failed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->error('SMS delivery failed.', 502, $response['payload']);
    }
}
