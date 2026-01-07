<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\User;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Policies\PatientPolicy;

class PatientController extends Controller
{
    use ResponseTrait;

    /**
     * Display a listing of patients with optional filtering and search
     */
    public function index(Request $request)
    {
        $authUser = auth('api')->user();
        if ($authUser->role === UserRole::ADMIN) {
            $patients = Patient::with('user:id,name,email,phone,role')->get();
        } else {
            $patients = Patient::with('user:id,name,email,phone,role')->where('user_id', $authUser->id)->get();
        }

        if ($patients->isEmpty()) {
            return $this->returnError("No Patients Found");
        }
        return $this->returnData("patients", $patients, "Patients Data");

        // $query = Patient::with('user:id,name,phone,email');
        // // Search by name, SSN, or phone
        // if ($request->has('search')) {
        //     $search = $request->search;
        //     $query->where(function ($q) use ($search) {
        //         $q->where('name', 'like', "%{$search}%")
        //             ->orWhere('ssn', 'like', "%{$search}%")
        //             ->orWhere('phone', 'like', "%{$search}%");
        //     });
        // }

        // // Filter by status
        // if ($request->has('status')) {
        //     $query->where('status', $request->status);
        // }

        // // Sorting
        // $sortBy = $request->get('sort_by', 'created_at');
        // $sortOrder = $request->get('sort_order', 'desc');

        // $allowedSortColumns = ['name', 'ssn', 'phone', 'status', 'created_at', 'cost'];
        // if (in_array($sortBy, $allowedSortColumns)) {
        //     $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        // } else {
        //     $query->latest();
        // }

        // // Pagination
        // $perPage = $request->get('per_page', 15);
        // $patients = $query->paginate($perPage);

        // Log::info('patients.index accessed', [
        //     'user_id' => $request->user()->id,
        //     'params' => $request->only(['search', 'status', 'page', 'per_page']),
        // ]);

        // return $this->returnData('patients', $patients, 'Patients retrieved successfully');
    }

    /**
     * Store a newly created patient
     */
    public function store(StorePatientRequest $request)
    {
        //Authorize any authenticated user to create patients
        $authUser = auth('api')->user();
        $this->authorizeForUser($authUser, 'create', Patient::class);
        // Store the validated data only in array (data);
        $data = $request->validated();
        // put the id of auth user by default for patient
        $data['user_id'] = $authUser->id;
        $patient = Patient::create($data);
        // load data of user that create the patient 
        $patient->load('user:id,name,phone,email');
        return $this->returnData('patient', $patient, 'Patient created successfully', 201);
    }

    /**
     * Display the specified patient
     */
    public function show(Patient $patient)
    {
        $authUser = auth('api')->user();
        $this->authorizeForUser($authUser, 'view', $patient);
        $patient->load('user:id,name,phone,email');
        return $this->returnData('patient', $patient, 'Patient retrieved successfully');
    }
    /**
     * Update the specified patient
     */
    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $this->authorize('update', $patient);
        $data = $request->validated();
        $patient->update($data);
        $patient->load('user:id,name,phone,email');



        return $this->returnData('patient', $patient, 'Patient updated successfully');
    }

    /**
     * Remove the specified patient
     */
    public function destroy(Request $request, Patient $patient)
    {
        $this->authorize('delete', $patient);
        $patient->delete();
        return $this->returnSuccess('Patient deleted successfully');
    }
}
