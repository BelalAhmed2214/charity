<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    use ResponseTrait;

    /**
     * Display a listing of patients with optional filtering and search
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Patient::class);

        $query = Patient::with('user:id,name,phone');

        // Search by name, SSN, or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('ssn', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user_id (for admins viewing specific user's patients)
        if ($request->has('user_id') && $request->user()->role === 'admin') {
            $query->where('user_id', $request->user_id);
        }

        // Regular users can only see their own patients
        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $patients = $query->latest()->paginate($perPage);

        return $this->returnData('patients', $patients, 'Patients retrieved successfully');
    }

    /**
     * Store a newly created patient
     */
    public function store(StorePatientRequest $request)
    {
        $this->authorize('create', Patient::class);

        $patient = Patient::create($request->validated());
        $patient->load('user:id,name,phone');

        return $this->returnData('patient', $patient, 'Patient created successfully', 201);
    }

    /**
     * Display the specified patient
     */
    public function show(Patient $patient)
    {
        $this->authorize('view', $patient);

        $patient->load('user:id,name,phone');

        return $this->returnData('patient', $patient, 'Patient retrieved successfully');
    }

    /**
     * Update the specified patient
     */
    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $this->authorize('update', $patient);

        $patient->update($request->validated());
        $patient->load('user:id,name,phone');

        return $this->returnData('patient', $patient, 'Patient updated successfully');
    }

    /**
     * Remove the specified patient
     */
    public function destroy(Patient $patient)
    {
        $this->authorize('delete', $patient);

        $patient->delete();

        return $this->returnSuccess('Patient deleted successfully');
    }
}
