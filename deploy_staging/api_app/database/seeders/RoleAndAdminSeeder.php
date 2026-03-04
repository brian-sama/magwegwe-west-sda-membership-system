<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['Admin', 'Pastor', 'Clerk', 'Viewer'];

        foreach ($roles as $role) {
            Role::findOrCreate($role, 'web');
        }

        $email = env('DEFAULT_ADMIN_EMAIL', 'admin@magwegwesda.org');

        $admin = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => env('DEFAULT_ADMIN_NAME', 'System Administrator'),
                'password' => Hash::make(env('DEFAULT_ADMIN_PASSWORD', 'ChangeMe123!')),
                'role' => 'Admin',
            ]
        );

        $admin->assignRole('Admin');
    }
}
