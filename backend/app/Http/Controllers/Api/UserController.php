<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
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
        $this->authorize('viewAny', User::class);
        
        $users = User::all();
        if ($users->isEmpty()) {
            return $this->returnError("There is no users");
        }
        return $this->returnData("users", $users, "Users Data", Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);
        
        $user = User::create($request->validated());
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
        
        $this->authorize('view', $user);
        
        return $this->returnData("user", $user, "User Data");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->returnError("This user not found");
        }
        
        $this->authorize('update', $user);
        
        $user->update($request->validated());
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
        
        $this->authorize('delete', $user);
        
        $user->delete();
        return $this->returnData("user", $user, "User deleted Successfully");
    }
}
