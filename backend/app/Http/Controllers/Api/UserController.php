<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(private UserService $service) {}
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
    public function store(StoreUserRequest $request) // Create user
    {
        $this->authorize('create', User::class);
        $storeResponse = $this->service->store($request->validated());

        if (!$storeResponse['success']) {
            return $this->returnError($storeResponse['message']);
        }

        return $this->returnData('data', [
            'user' => new UserResource($storeResponse['user']),
        ], 'User Created successfully', Response::HTTP_CREATED);
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
    public function changePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();
        $validated = $request->validate([
            'old_password' => ['required', 'string', 'min:8'],
            'new_password' =>  ['required', 'string', 'min:8']
        ]);

        if (!Hash::check($validated['old_password'], $user->password)) {
            return $this->returnError("Old Password is Incorrect", Response::HTTP_UNAUTHORIZED);
        }
        $user->must_change_password = false;
        $user->password = Hash::make($validated['new_password']);
        $user->save();
        return $this->returnSuccess("Password Updated Successfully", Response::HTTP_OK);
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
