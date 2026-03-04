<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MemberController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\SocietyController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\YouthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware(['auth:sanctum', 'throttle:api-token', 'audit'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::apiResource('members', MemberController::class);
        Route::get('members/{member}/qr', [MemberController::class, 'qr']);

        Route::apiResource('societies', SocietyController::class);
        Route::apiResource('youth', YouthController::class);

        Route::middleware('role:Admin')->apiResource('users', UserController::class);

        Route::apiResource('attendance', AttendanceController::class);
        Route::post('attendance/scan', [AttendanceController::class, 'scan'])->middleware('throttle:scan');

        Route::get('audit-logs', [AuditLogController::class, 'index'])->middleware('role:Admin,Pastor');
        Route::post('audit-logs', [AuditLogController::class, 'store']);

        Route::get('reports/members', [ReportController::class, 'members']);
        Route::get('reports/youth', [ReportController::class, 'youth']);
        Route::get('reports/societies', [ReportController::class, 'societies']);
        Route::get('reports/attendance', [ReportController::class, 'attendance']);

        Route::get('search/global', [SearchController::class, 'global']);
        Route::post('notifications/sms', [NotificationController::class, 'sendSms'])->middleware('role:Admin,Pastor,Clerk');

        Route::post('analytics/insights', [AnalyticsController::class, 'insights'])->middleware('role:Admin,Pastor');
    });
});
