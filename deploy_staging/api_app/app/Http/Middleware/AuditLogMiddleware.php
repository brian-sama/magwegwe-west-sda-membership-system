<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $response;
        }

        $user = $request->user();

        if (! $user || $response->getStatusCode() >= 500) {
            return $response;
        }

        $pathSegments = explode('/', trim($request->path(), '/'));
        $entityType = $pathSegments[2] ?? 'unknown';

        AuditLog::create([
            'user_id' => $user->id,
            'action' => sprintf('%s %s', $request->method(), $request->path()),
            'entity_type' => $entityType,
            'entity_id' => $request->route('member')
                ?? $request->route('society')
                ?? $request->route('youth')
                ?? $request->route('attendance')
                ?? $request->route('user')
                ?? null,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return $response;
    }
}
