<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SimpanPermohonanRequest extends FormRequest
{
    /**
     * Otorisasi: Hanya pengguna dengan peran 'Pemohon' yang boleh mengajukan permohonan.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->Role?->nama === 'Pemohon';
    }

    /**
     * Aturan validasi data pengajuan permohonan.
     */
    public function rules(): array
    {
        return [
            'judul' => ['required', 'string', 'max:255'],
            'estimasi_anggaran' => ['required', 'numeric', 'min:1'],
            'nomor_surat' => ['nullable', 'string', 'max:100'],
            'ringkasan_tujuan' => ['nullable', 'string', 'max:1000'],
            'file_dokumen' => [
                'required',
                'file',
                'mimes:pdf',
                'max:10240', // Maksimal 10 MB sesuai PRD
            ],
        ];
    }

    /**
     * Pesan validasi berbahasa Indonesia sesuai standar DEVELOPMENT_RULES.md.
     */
    public function messages(): array
    {
        return [
            'judul.required' => 'Judul pengadaan wajib diisi.',
            'judul.string' => 'Judul pengadaan harus berupa teks.',
            'judul.max' => 'Judul pengadaan tidak boleh lebih dari 255 karakter.',
            'estimasi_anggaran.required' => 'Nominal atau estimasi anggaran wajib diisi.',
            'estimasi_anggaran.numeric' => 'Estimasi anggaran harus berupa angka yang valid.',
            'estimasi_anggaran.min' => 'Estimasi anggaran minimal Rp 1.',
            'file_dokumen.required' => 'Surat permohonan berformat PDF wajib diunggah.',
            'file_dokumen.file' => 'Berkas yang diunggah harus berupa file yang valid.',
            'file_dokumen.mimes' => 'Surat permohonan harus berformat PDF (.pdf).',
            'file_dokumen.max' => 'Ukuran berkas surat permohonan maksimal 10 MB.',
        ];
    }
}
