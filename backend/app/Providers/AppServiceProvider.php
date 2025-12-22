<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Patient;
use App\Policies\UserPolicy;
use App\Policies\PatientPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Explicitly register policies
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Patient::class, PatientPolicy::class);
    }
}
