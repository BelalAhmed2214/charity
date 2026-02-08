<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PatientFilter
{

    public static function apply(Request $request, Builder $query): Builder
    {
        //Filter With Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        //Search with Name,SSN,Phone
        if ($request->filled('search')) {
            $query->whereAny(
                ['name', 'ssn', 'phone'],
                'like',
                "%{$request->search}%"
            );
        }
        //Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $direction = in_array($request->get('direction'), ['asc', 'desc']) ? $request->direction : 'desc';

        $allowedSortColumns = ['name', 'ssn', 'phone', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }
}
