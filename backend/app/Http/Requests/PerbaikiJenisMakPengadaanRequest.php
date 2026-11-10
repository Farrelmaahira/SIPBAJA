<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PerbaikiJenisMakPengadaanRequest extends FormRequest
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
            'permohonan_mak_id' => ['required', 'integer', 'exists:permohonan_mak,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'permohonan_mak_id.required' => 'Jenis MAK wajib dipilih.',
            'permohonan_mak_id.integer' => 'Format pilihan Jenis MAK tidak valid.',
            'permohonan_mak_id.exists' => 'Jenis MAK yang dipilih tidak ditemukan pada permohonan ini.',
        ];
    }
}
