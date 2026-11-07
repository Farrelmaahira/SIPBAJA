<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewPengadaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('PP') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'alasan' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'alasan.required' => 'Alasan penolakan dokumen pengadaan wajib diisi.',
            'alasan.min' => 'Alasan penolakan minimal berisi 5 karakter.',
            'alasan.max' => 'Alasan penolakan maksimal 500 karakter.',
        ];
    }
}
