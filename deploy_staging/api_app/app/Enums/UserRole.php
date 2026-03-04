<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'Admin';
    case Pastor = 'Pastor';
    case Clerk = 'Clerk';
    case Viewer = 'Viewer';
}
