<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    use ResponseTrait;

    /**
     * Display a listing of patients with optional filtering and search
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Patient::class);
        $query = Patient::with('user:id,name,phone,email');
        
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

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortColumns = ['name', 'ssn', 'phone', 'status', 'created_at', 'cost'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $patients = $query->paginate($perPage);

        Log::info('patients.index accessed', [
            'user_id' => $request->user()->id,
            'params' => $request->only(['search', 'status', 'page', 'per_page']),
        ]);

        return $this->returnData('patients', $patients, 'Patients retrieved successfully');
    }

    /**
     * Store a newly created patient
     */
    public function store(StorePatientRequest $request)
    {
        $this->authorize('create', Patient::class);

        $data = $request->validated();
        // Enforce creator association server-side
        $data['user_id'] = $request->user()->id;

        $patient = Patient::create($data);
        $patient->load('user:id,name,phone,email');

        Log::info('patients.store', [
            'user_id' => $request->user()->id,
            'patient_id' => $patient->id,
        ]);

        return $this->returnData('patient', $patient, 'Patient created successfully', 201);
    }

    /**
     * Display the specified patient
     */
    public function show(Patient $patient)
    {
        $this->authorize('view', $patient);

        $patient->load('user:id,name,phone,email');

        Log::info('patients.show accessed', [
            'user_id' => request()->user()->id,
            'patient_id' => $patient->id,
        ]);

        return $this->returnData('patient', $patient, 'Patient retrieved successfully');
    }

    /**
     * Update the specified patient
     */
    public function update(UpdatePatientRequest $request, Patient $patient)
    {
        $this->authorize('update', $patient);

        $data = $request->validated();
        // Prevent changing creator
        unset($data['user_id']);

        $patient->update($data);
        $patient->load('user:id,name,phone,email');

        Log::info('patients.update', [
            'user_id' => $request->user()->id,
            'patient_id' => $patient->id,
            'payload' => $data,
        ]);

        return $this->returnData('patient', $patient, 'Patient updated successfully');
    }

    /**
     * Remove the specified patient
     */
    public function destroy(Request $request, Patient $patient)
    {
        $this->authorize('delete', $patient);

        $patient->delete();

        Log::info('patients.destroy', [
            'user_id' => $request->user()->id,
            'patient_id' => $patient->id,
        ]);

        return $this->returnSuccess('Patient deleted successfully');
    }
}
