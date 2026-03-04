<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Youth extends Model
{
    use HasFactory;

    protected $table = 'youth';

    protected $fillable = [
        'member_id',
        'school',
        'guardian_name',
        'guardian_phone',
        'grade',
        'club',
        'rank',
        'health_notes',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
