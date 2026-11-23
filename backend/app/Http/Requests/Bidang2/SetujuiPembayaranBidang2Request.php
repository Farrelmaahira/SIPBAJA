<?php

namespace App\Http\Requests\Bidang2;

use Illuminate\Foundation\Http\FormRequest;

class SetujuiPembayaranBidang2Request extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'memo' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'memo.required' => 'Dokumen memo persetujuan pembayaran wajib diunggah.',
            'memo.mimes' => 'Dokumen memo persetujuan pembayaran harus berformat PDF.',
            'memo.max' => 'Ukuran dokumen memo persetujuan pembayaran maksimal 10 MB.',
        ];
    }
}
