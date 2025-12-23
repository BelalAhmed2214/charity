<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatsEndpointTest extends TestCase
{
    use RefreshDatabase;

    protected function actingAsUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    public function test_stats_returns_aggregates_and_response_time(): void
    {
        $user = $this->actingAsUser();

        Patient::factory()->count(3)->create([
            'status' => 'pending',
            'cost' => 100,
            'user_id' => $user->id,
        ]);

        Patient::factory()->count(2)->create([
            'status' => 'complete',
            'cost' => 200,
            'user_id' => $user->id,
        ]);

        $response = $this->getJson('/api/stats?date_from=2000-01-01&date_to=2100-01-01');

        $response->assertOk()
            ->assertJsonPath('stats.total_patients', 5)
            ->assertJsonPath('stats.pending_patients', 3)
            ->assertJsonPath('stats.completed_patients', 2)
            ->assertJsonPath('stats.total_costs', 700.0)
            ->assertJsonStructure(['stats' => ['response_time_ms']]);
    }
}

