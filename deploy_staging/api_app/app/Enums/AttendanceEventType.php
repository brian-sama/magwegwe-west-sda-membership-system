<?php

namespace App\Enums;

enum AttendanceEventType: string
{
    case Sabbath = 'Sabbath';
    case Youth = 'Youth';
    case Society = 'Society';
    case Campmeeting = 'Campmeeting';
}
