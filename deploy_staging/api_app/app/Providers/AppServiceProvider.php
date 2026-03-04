<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return [
                Limit::perMinute(5)->by($request->ip().$request->input('email')),
            ];
        });

        RateLimiter::for('api-token', function (Request $request) {
            return [
                Limit::perMinute(120)->by($request->user()?->id ?: $request->ip()),
            ];
        });

        RateLimiter::for('scan', function (Request $request) {
            return [
                Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()),
            ];
        });
    }
}
