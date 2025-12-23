<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => 'required|in:medication,procedure,diagnostics,other',
            'amount' => ['required','numeric','min:0','regex:/^\d+(\.\d{1,2})?$/'],
            'note' => 'nullable|string|max:255',
        ];
    }
}
