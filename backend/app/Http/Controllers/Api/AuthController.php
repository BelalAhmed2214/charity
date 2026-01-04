<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use App\Traits\ResponseTrait;
use App\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ResponseTrait;

    public function register(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        $user = User::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email ?? null,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? UserRole::USER,
        ]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->returnData('data', [
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully', Response::HTTP_CREATED);
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->returnData('data', [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->returnSuccessMessage('Successfully logged out');
    }

    public function user(Request $request)
    {
        return $this->returnData('user', $request->user(), 'User data retrieved successfully');
    }

    // public function refresh(Request $request)
    // {
    //     $user = $request->user();
    //     $user->currentAccessToken()->delete();

    //     $token = $user->createToken('auth-token')->plainTextToken;

    //     return $this->returnData('data', [
    //         'token' => $token,
    //         'token_type' => 'Bearer',
    //     ], 'Token refreshed successfully');
    // }
}
