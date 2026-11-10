<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetujuiPermohonanPpkRequest extends FormRequest
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
            'memo' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'memo.required' => 'Berkas Memo Persetujuan Surat Permohonan wajib diunggah.',
            'memo.file' => 'Format berkas harus PDF, JPG, atau PNG.',
            'memo.mimes' => 'Format berkas harus PDF, JPG, atau PNG.',
            'memo.max' => 'Ukuran berkas maksimal 10 MB.',
            'catatan.max' => 'Catatan persetujuan maksimal 1000 karakter.',
        ];
    }
}
