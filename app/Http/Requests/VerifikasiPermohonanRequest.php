<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifikasiPermohonanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->hasRole('Perencanaan');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'mak_ids' => ['required', 'array', 'min:1'],
            'mak_ids.*' => ['required', 'integer', 'exists:maks,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'mak_ids.required' => 'Pilih minimal satu Jenis MAK sebelum menyetujui permohonan.',
            'mak_ids.min' => 'Pilih minimal satu Jenis MAK sebelum menyetujui permohonan.',
            'mak_ids.*.exists' => 'Jenis MAK yang dipilih tidak valid.',
        ];
    }
}
