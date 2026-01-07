<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'ssn' => ['required', 'string', 'unique:patients,ssn', 'min:14', 'max:14'],
            'age' => ['required', 'integer', 'min:1', 'max:150'],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('patients', 'phone'),
                'regex:/^(010|011|012|015)[0-9]{8}$/',
            ],
            'martial_status' => ['required', 'in:single,married,divorced,widowed'],
            'status' => ['nullable', 'in:pending,complete'],
            'children' => ['nullable', 'integer', 'min:0'],
            'governorate' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'solution' => ['nullable', 'string'],
            'cost' => ['required', 'numeric', 'min:0'],
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
