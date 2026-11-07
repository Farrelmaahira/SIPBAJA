<?php

namespace App\Http\Requests\Bidang2;

use Illuminate\Foundation\Http\FormRequest;

class TolakPermohonanBidang2Request extends FormRequest
{
    /**
     * Otorisasi: Hanya pengguna dengan peran 'Bidang 2' yang boleh menolak permohonan.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->Role?->nama === 'Bidang 2';
    }

    /**
     * Aturan validasi penolakan permohonan oleh Bidang 2.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'alasan' => ['required', 'string', 'min:5', 'max:500'],
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
            'alasan.required' => 'Catatan penolakan wajib diisi.',
            'alasan.string' => 'Catatan penolakan harus berupa teks.',
            'alasan.min' => 'Catatan penolakan minimal 5 karakter.',
            'alasan.max' => 'Catatan penolakan maksimal 500 karakter.',
        ];
    }
}

