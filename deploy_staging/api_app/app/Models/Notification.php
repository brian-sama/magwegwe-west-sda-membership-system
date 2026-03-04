<?php

namespace App\Models;

use App\Enums\NotificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel',
        'provider',
        'recipient',
        'message',
        'status',
        'response_payload',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'response_payload' => 'array',
            'sent_at' => 'datetime',
            'status' => NotificationStatus::class,
        ];
    }
}
