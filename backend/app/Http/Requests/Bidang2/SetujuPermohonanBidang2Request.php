<?php

namespace App\Http\Requests\Bidang2;

use Illuminate\Foundation\Http\FormRequest;

class SetujuPermohonanBidang2Request extends FormRequest
{
    /**
     * Otorisasi: Hanya pengguna dengan peran 'Bidang 2' yang boleh menyetujui permohonan.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->Role?->nama === 'Bidang 2';
    }

    /**
     * Aturan validasi persetujuan permohonan oleh Bidang 2.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file_memo' => [
                'required',
                'file',
                'mimes:pdf',
                'max:20480', // Maksimal 20 MB sesuai UI mockup modal
            ],
        ];
    }

    /**
     * Pesan validasi berbahasa Indonesia sesuai kaidah DEVELOPMENT_RULES.md.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file_memo.required' => 'Dokumen memo persetujuan wajib dilampirkan.',
            'file_memo.file' => 'Berkas memo yang diunggah harus berupa file yang valid.',
            'file_memo.mimes' => 'Memo persetujuan harus berformat PDF (.pdf).',
            'file_memo.max' => 'Ukuran berkas memo persetujuan maksimal 20 MB.',
        ];
    }
}

