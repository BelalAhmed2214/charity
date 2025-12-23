<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StatsController extends Controller
{
    use ResponseTrait;

    public function index(Request $request)
    {
        $startTime = microtime(true);

        $patientQuery = Patient::query();

        // Date range filtering
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $patientQuery->whereBetween('created_at', [
                $request->date_from,
                $request->date_to,
            ]);
        } elseif ($request->filled('date_from')) {
            $patientQuery->where('created_at', '>=', $request->date_from);
        } elseif ($request->filled('date_to')) {
            $patientQuery->where('created_at', '<=', $request->date_to);
        }

        if ($request->filled('status')) {
            $patientQuery->where('status', $request->status);
        }

        $aggregates = $patientQuery->selectRaw("
            COUNT(*) as total_patients,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_patients,
            SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) as completed_patients,
            COALESCE(SUM(cost),0) as total_costs
        ")->first();

        $avgPerPatient = ($aggregates->total_patients ?? 0) > 0
            ? round($aggregates->total_costs / $aggregates->total_patients, 2)
            : 0.00;

        $responseTimeMs = round((microtime(true) - $startTime) * 1000, 2);

        Log::info('stats.index accessed', [
            'user_id' => $request->user()->id,
            'filters' => $request->only(['date_from', 'date_to', 'status']),
            'response_time_ms' => $responseTimeMs,
        ]);

        return $this->returnData('stats', [
            'completed_patients' => (int) $aggregates->completed_patients,
            'pending_patients' => (int) $aggregates->pending_patients,
            'total_patients' => (int) $aggregates->total_patients,
            'total_costs' => round((float) $aggregates->total_costs, 2),
            'avg_cost_per_patient' => $avgPerPatient,
            'cost_trend' => [],
            'response_time_ms' => $responseTimeMs,
        ], 'Stats retrieved successfully');
    }
}
