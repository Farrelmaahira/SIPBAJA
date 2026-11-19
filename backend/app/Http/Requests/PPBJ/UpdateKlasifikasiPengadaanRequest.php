<?php

namespace App\Http\Requests\PPBJ;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKlasifikasiPengadaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->Role?->nama === 'PPBJ';
    }

    public function rules(): array
    {
        return [
            'permohonan_mak_id' => ['required', 'integer', 'exists:permohonan_mak,id'],
            'jenis_id' => ['required', 'integer', 'exists:jenis_pengadaan,id'],
            'metode_id' => ['required', 'integer', 'exists:metode_pengadaan,id'],
            'level_id' => ['nullable', 'integer', 'exists:level_pengadaan,id'],
            'nominal' => ['required', 'numeric', 'min:1'],
            'dokumen' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'permohonan_mak_id.required' => 'Mata anggaran (MAK) wajib dipilih.',
            'permohonan_mak_id.exists' => 'Mata anggaran (MAK) tidak valid.',
            'jenis_id.required' => 'Jenis pengadaan wajib dipilih.',
            'jenis_id.exists' => 'Jenis pengadaan tidak valid.',
            'metode_id.required' => 'Metode pengadaan wajib dipilih.',
            'metode_id.exists' => 'Metode pengadaan tidak valid.',
            'nominal.required' => 'Nominal pengadaan wajib diisi.',
            'nominal.numeric' => 'Nominal pengadaan harus berupa angka.',
            'nominal.min' => 'Nominal pengadaan minimal Rp 1.',
            'dokumen.mimes' => 'Dokumen pengadaan harus berupa berkas PDF.',
            'dokumen.max' => 'Ukuran dokumen pengadaan maksimal 10 MB.',
        ];
    }
}
