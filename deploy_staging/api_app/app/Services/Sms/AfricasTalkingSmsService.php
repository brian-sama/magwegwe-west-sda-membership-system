<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;

class AfricasTalkingSmsService
{
    public function send(string $recipient, string $message): array
    {
        $username = config('services.africastalking.username');
        $apiKey = config('services.africastalking.key');
        $from = config('services.africastalking.from');

        if (! $username || ! $apiKey) {
            return [
                'success' => false,
                'message' => 'Africa\'s Talking credentials are not configured.',
                'payload' => null,
            ];
        }

        $response = Http::withHeaders([
            'apiKey' => $apiKey,
            'Accept' => 'application/json',
            'Content-Type' => 'application/x-www-form-urlencoded',
        ])->asForm()->post('https://api.africastalking.com/version1/messaging', [
            'username' => $username,
            'to' => $recipient,
            'message' => $message,
            'from' => $from,
        ]);

        return [
            'success' => $response->successful(),
            'message' => $response->successful() ? 'Message queued to provider.' : 'Failed to deliver message.',
            'payload' => $response->json(),
        ];
    }
}
