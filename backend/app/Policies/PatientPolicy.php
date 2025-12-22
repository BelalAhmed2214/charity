<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    /**
     * Determine if the user can view any patients.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view patients (filtered in controller)
        return true;
    }

    /**
     * Determine if the user can view the patient.
     */
    public function view(User $user, Patient $patient): bool
    {
        // Admin can view any patient, regular users can only view own patients
        return $user->role === 'admin' || $patient->user_id === $user->id;
    }

    /**
     * Determine if the user can create patients.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create patients
        return true;
    }

    /**
     * Determine if the user can update the patient.
     */
    public function update(User $user, Patient $patient): bool
    {
        // Admin can update any patient, regular users can only update own patients
        return $user->role === 'admin' || $patient->user_id === $user->id;
    }

    /**
     * Determine if the user can delete the patient.
     */
    public function delete(User $user, Patient $patient): bool
    {
        // Admin can delete any patient, regular users can only delete own patients
        return $user->role === 'admin' || $patient->user_id === $user->id;
    }

    /**
     * Determine if the user can restore the patient.
     */
    public function restore(User $user, Patient $patient): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can permanently delete the patient.
     */
    public function forceDelete(User $user, Patient $patient): bool
    {
        return $user->role === 'admin';
    }
}
