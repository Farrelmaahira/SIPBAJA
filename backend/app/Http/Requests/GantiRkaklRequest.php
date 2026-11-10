<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GantiRkaklRequest extends FormRequest
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
            'berkas' => ['required_without:file', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'file' => ['required_without:berkas', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'berkas.required_without' => 'Berkas RKAKL pengganti wajib dipilih.',
            'berkas.file' => 'Berkas RKAKL pengganti tidak valid.',
            'berkas.mimes' => 'Format berkas harus PDF, JPG, atau PNG.',
            'berkas.max' => 'Ukuran berkas maksimal 10 MB.',
            'file.required_without' => 'Berkas RKAKL pengganti wajib dipilih.',
            'file.file' => 'Berkas RKAKL pengganti tidak valid.',
            'file.mimes' => 'Format berkas harus PDF, JPG, atau PNG.',
            'file.max' => 'Ukuran berkas maksimal 10 MB.',
        ];
    }
}
