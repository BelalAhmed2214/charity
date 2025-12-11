<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    use ResponseTrait;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return $this->returnError("There is no users");
        }
        return $this->returnData("users", $users, "Users Data", Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->only(["name", "email", "phone", "role", "password"]);
        $user = User::create($data);
        if (!$user) {
            return $this->returnError("Failed to create user");
        }
        return $this->returnData("user", $user, "User created Successfully", Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->returnError("This user not found");
        }
        return $this->returnData("user", $user, "User Data");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->returnError("This user not found");
        }
        $data = $request->only(['name', 'phone', 'email']);
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }
        $user->update($data);
        return $this->returnData("user", $user, "User updated Successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->returnError("This user not found");
        }
        $user->delete();
        return $this->returnData("user", $user, "User deleted Successfully");
    }
}
