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
use App\Filters\PatientFilter;
use App\Services\PatientService;

class PatientController extends Controller
{
    use ResponseTrait;
    public function __construct(private PatientService $service) {}

    public function index(Request $request)
    {
        $authUser = auth('api')->user();
        $patients = $this->service->getAllPatients($request, $authUser);
        return $this->returnData("patients", $patients, "Patients Data");
    }

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


    public function show(Patient $patient)
    {
        $authUser = auth('api')->user();
        $this->authorizeForUser($authUser, 'view', $patient);
        $patient->load('user:id,name,phone,email');
        return $this->returnData('patient', $patient, 'Patient retrieved successfully');
    }

    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $this->authorize('update', $patient);
        $data = $request->validated();
        $patient->update($data);
        $patient->load('user:id,name,phone,email');



        return $this->returnData('patient', $patient, 'Patient updated successfully');
    }

    public function destroy(Request $request, Patient $patient)
    {
        $this->authorize('delete', $patient);
        $patient->delete();
        return $this->returnSuccess('Patient deleted successfully');
    }
}
