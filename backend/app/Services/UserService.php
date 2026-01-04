<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function store($data): array
    {
        try {
            $user = User::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password']),
                'role' => $data['role'] ?? UserRole::USER,
            ]);

            return [
                'success' => 1,
                'user' => $user,
            ];
        } catch (\Exception $e) {
            return [
                'success' => 0,
                'message' => $e->getMessage(),
            ];
        }
    }

}
