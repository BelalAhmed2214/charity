<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    use ResponseTrait;

    public function index(Request $request)
    {
        $user = $request->user();

        $patientQuery = Patient::query();
        if ($user->role !== 'admin') {
            $patientQuery->where('user_id', $user->id);
        }

        $totalPatients = (clone $patientQuery)->count();
        $pendingPatients = (clone $patientQuery)->where('status', 'pending')->count();
        $completedPatients = (clone $patientQuery)->where('status', 'complete')->count();

        $totalCosts = (clone $patientQuery)->sum('cost');
        $trend = [];
        $avgPerPatient = $totalPatients > 0 ? round($totalCosts / $totalPatients, 2) : 0.00;

        return $this->returnData('stats', [
            'completed_patients' => $completedPatients,
            'pending_patients' => $pendingPatients,
            'total_patients' => $totalPatients,
            'total_costs' => round($totalCosts, 2),
            'avg_cost_per_patient' => $avgPerPatient,
            'cost_trend' => $trend,
        ], 'Stats retrieved successfully');
    }
}
