<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Society extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'leader',
        'assistant_leader',
        'meeting_day',
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'member_societies')->withPivot(['skills'])->withTimestamps();
    }
}
