<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'gender',
        'phone',
        'email',
        'national_id',
        'date_of_birth',
        'address',
        'baptism_date',
        'society_id',
        'status',
        'department',
        'previous_church',
        'destination_church',
        'transfer_date',
        'board_approval_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'baptism_date' => 'date',
            'transfer_date' => 'datetime',
            'board_approval_date' => 'date',
        ];
    }

    public function primarySociety(): BelongsTo
    {
        return $this->belongsTo(Society::class, 'society_id');
    }

    public function societies(): BelongsToMany
    {
        return $this->belongsToMany(Society::class, 'member_societies')->withPivot(['skills'])->withTimestamps();
    }

    public function youthProfiles(): HasMany
    {
        return $this->hasMany(Youth::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
