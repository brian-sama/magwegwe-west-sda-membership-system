<?php

namespace App\Enums;

enum NotificationStatus: string
{
    case Pending = 'PENDING';
    case Sent = 'SENT';
    case Failed = 'FAILED';
}
