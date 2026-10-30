<?php

namespace App\Http\Requests\PPBJ;

use Illuminate\Foundation\Http\FormRequest;

class StoreDraftPengadaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->Role?->nama === 'PPBJ';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.permohonan_mak_id' => ['required', 'integer'],
            'items.*.jenis_id' => ['required', 'integer', 'exists:jenis_pengadaan,id'],
            'items.*.metode_id' => ['required', 'integer', 'exists:metode_pengadaan,id'],
            'items.*.nominal' => ['required', 'numeric', 'min:1'],
            'items.*.level_id' => ['nullable', 'integer', 'exists:level_pengadaan,id'],
            'items.*.dokumen' => ['nullable', 'file', 'max:20480', 'mimes:pdf,doc,docx'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Setidaknya harus ada satu paket pengadaan.',
            'items.*.permohonan_mak_id.required' => 'Mata Anggaran Kegiatan wajib dipilih.',
            'items.*.jenis_id.required' => 'Jenis pengadaan wajib dipilih.',
            'items.*.metode_id.required' => 'Metode pengadaan wajib dipilih.',
            'items.*.nominal.required' => 'Nominal pengadaan wajib diisi.',
            'items.*.nominal.min' => 'Nominal pengadaan harus lebih dari 0.',
            'items.*.dokumen.max' => 'Ukuran berkas dokumen pengadaan maksimal 20 MB.',
            'items.*.dokumen.mimes' => 'Format berkas dokumen pengadaan harus berupa PDF, DOC, atau DOCX.',
        ];
    }
}
