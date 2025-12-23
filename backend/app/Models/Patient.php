<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'age',
        'ssn',
        'phone',
        'martial_status',
        'status',
        'children',
        'governorate',
        'address',
        'diagnosis',
        'solution',
        'cost',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
