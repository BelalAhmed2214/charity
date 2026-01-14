<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Filters\PatientFilter;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientService
{
    public function getAllPatients(Request $request, $authUser)
    {
        $query = Patient::query()->with('user:id,name,email,phone,role');
        if ($authUser->role !== UserRole::ADMIN) {
            $query->where('user_id', $authUser->id);
        }
        //Filtering & Searching & Sorting
        PatientFilter::apply($request, $query);
        //Pagination
        $perPage = (int)$request->get('per_page', 15);
        $patients = $query->paginate($perPage);
        return $patients;
    }
}
