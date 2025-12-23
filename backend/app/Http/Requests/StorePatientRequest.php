<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'user_id' => ['prohibited'], // creator is set server-side
            'name' => ['required', 'string', 'max:255'],
            'ssn' => ['required', 'string', 'unique:patients,ssn', 'max:255'],
            'age' => ['nullable', 'integer', 'min:0', 'max:150'],
            'phone' => ['nullable', 'string', 'max:20'],
            'martial_status' => ['nullable', 'in:single,married,divorced,widowed'],
            'status' => ['nullable', 'in:pending,complete'],
            'children' => ['nullable', 'integer', 'min:0'],
            'governorate' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'solution' => ['nullable', 'string'],
            'cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Patient name is required',
            'ssn.required' => 'SSN is required',
            'ssn.unique' => 'This SSN is already registered',
            'age.min' => 'Age must be a positive number',
            'age.max' => 'Age cannot exceed 150',
            'martial_status.in' => 'Invalid marital status',
            'status.in' => 'Invalid status',
            'children.min' => 'Number of children cannot be negative',
            'cost.min' => 'Cost must be zero or positive',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Map legacy key if present
        if ($this->has('childrens') && !$this->has('children')) {
            $this->merge([
                'children' => $this->input('childrens'),
            ]);
        }
    }
}
