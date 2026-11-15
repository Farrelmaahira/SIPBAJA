<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UnggahRkaklRequest extends FormRequest
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
            'tahun_anggaran' => ['nullable', 'string', 'max:36'],
            'berkas' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'filename' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tahun_anggaran.max' => 'Tahun anggaran maksimal 36 karakter.',
            'berkas.file' => 'Berkas RKAKL yang diunggah tidak valid.',
            'berkas.mimes' => 'Format berkas harus PDF, JPG, atau PNG.',
            'berkas.max' => 'Ukuran berkas maksimal 10 MB.',
            'file.file' => 'Berkas RKAKL yang diunggah tidak valid.',
            'file.mimes' => 'Format berkas harus PDF, JPG, atau PNG.',
            'file.max' => 'Ukuran berkas maksimal 10 MB.',
        ];
    }
}
