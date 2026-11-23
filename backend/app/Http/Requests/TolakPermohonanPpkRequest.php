<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TolakPermohonanPpkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->hasRole('PPK');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'alasan' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'alasan.required' => 'Alasan penolakan wajib diisi.',
            'alasan.min' => 'Alasan penolakan minimal 5 karakter.',
            'alasan.max' => 'Alasan penolakan maksimal 1000 karakter.',
        ];
    }
}
