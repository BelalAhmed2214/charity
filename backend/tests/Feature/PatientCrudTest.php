<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function actingAsUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    public function test_authenticated_user_can_create_read_update_delete_patient(): void
    {
        $user = $this->actingAsUser();

        // Create
        $createPayload = [
            'name' => 'Test Patient',
            'ssn' => '12345678901234',
            'status' => 'pending',
            'children' => 1,
        ];

        $createResponse = $this->postJson('/api/patients', $createPayload);
        $createResponse->assertCreated()->assertJsonPath('patient.name', 'Test Patient');

        $patientId = $createResponse->json('patient.id');

        // Read
        $this->getJson("/api/patients/{$patientId}")
            ->assertOk()
            ->assertJsonPath('patient.id', $patientId);

        // Update
        $updatePayload = [
            'name' => 'Updated Patient',
            'status' => 'complete',
            'children' => 2,
        ];

        $this->putJson("/api/patients/{$patientId}", $updatePayload)
            ->assertOk()
            ->assertJsonPath('patient.name', 'Updated Patient')
            ->assertJsonPath('patient.status', 'complete');

        // Delete
        $this->deleteJson("/api/patients/{$patientId}")
            ->assertOk();

        $this->assertDatabaseMissing('patients', ['id' => $patientId]);
    }
}

