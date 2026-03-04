<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;

class GeminiAnalyticsService
{
    public function generate(string $query, array $context): string
    {
        $key = config('services.gemini.key');

        if (! $key) {
            return 'Gemini API key is not configured.';
        }

        $prompt = "You are a church analytics assistant. Query: {$query}. Context: ".json_encode($context);

        $response = Http::post(
            sprintf('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s', $key),
            [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ]
        );

        if (! $response->successful()) {
            return 'Unable to generate analytics insight right now.';
        }

        return data_get($response->json(), 'candidates.0.content.parts.0.text', 'No insight generated.');
    }
}
