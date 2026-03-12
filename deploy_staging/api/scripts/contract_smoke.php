<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run via CLI.\n");
    exit(1);
}

$baseUrl = rtrim($argv[1] ?? '', '/');
$email = $argv[2] ?? '';
$password = $argv[3] ?? '';

if ($baseUrl === '' || $email === '' || $password === '') {
    fwrite(STDERR, "Usage: php scripts/contract_smoke.php <baseUrl> <email> <password>\n");
    fwrite(STDERR, "Example: php scripts/contract_smoke.php https://example.com admin@example.com secret\n");
    exit(1);
}

$api = $baseUrl.'/api/v1';

$login = request('POST', $api.'/auth/login', ['email' => $email, 'password' => $password]);
assertStatus($login, [200], 'auth/login');
$token = $login['json']['data']['token'] ?? '';
if ($token === '') {
    fail('auth/login returned no token');
}

echo "OK auth/login\n";

$headers = ['Authorization: Bearer '.$token];

$checks = [
    ['GET', '/auth/me', null],
    ['GET', '/members?perPage=1', null],
    ['GET', '/youth?perPage=1', null],
    ['GET', '/societies?members=1', null],
    ['GET', '/attendance?perPage=1', null],
    ['GET', '/audit-logs?perPage=1', null],
    ['GET', '/search/global?q=test', null],
    ['POST', '/analytics/insights', ['query' => 'Smoke test query']],
];

foreach ($checks as [$method, $path, $payload]) {
    $response = request($method, $api.$path, $payload, $headers);
    assertStatus($response, [200, 201, 403], trim($path, '/'));
    echo "OK {$method} {$path} ({$response['status']})\n";
}

echo "Smoke contract checks complete.\n";

function request(string $method, string $url, ?array $payload = null, array $headers = []): array
{
    $curl = curl_init($url);
    $sendHeaders = array_merge(['Accept: application/json'], $headers);

    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_TIMEOUT, 30);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $sendHeaders);

    if ($payload !== null) {
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
        $sendHeaders[] = 'Content-Type: application/json';
        curl_setopt($curl, CURLOPT_HTTPHEADER, $sendHeaders);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $json);
    }

    $body = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($body === false) {
        $error = curl_error($curl);
        curl_close($curl);
        fail('Request failed: '.$error);
    }

    curl_close($curl);

    $decoded = json_decode($body, true);

    return [
        'status' => $status,
        'body' => $body,
        'json' => is_array($decoded) ? $decoded : null,
    ];
}

function assertStatus(array $response, array $allowed, string $label): void
{
    if (!in_array($response['status'], $allowed, true)) {
        fail($label.' failed with status '.$response['status'].' and body: '.$response['body']);
    }
}

function fail(string $message): never
{
    fwrite(STDERR, 'ERROR: '.$message."\n");
    exit(1);
}