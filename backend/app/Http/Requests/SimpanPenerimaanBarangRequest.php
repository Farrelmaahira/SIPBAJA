<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SimpanPenerimaanBarangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->Role?->nama === 'Perlengkapan';
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'tanggal_terima' => ['nullable', 'date'],
            'retained_dokumen_ids' => ['nullable', 'array'],
            'retained_dokumen_ids.*' => ['nullable'],
            'retained_foto_ids' => ['nullable', 'array'],
            'retained_foto_ids.*' => ['nullable'],
            'clear_dokumen_barang' => ['nullable'],
            'clear_dokumentasi_foto' => ['nullable'],
            'dokumen_barang' => ['nullable', 'array'],
            'dokumen_barang.*' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx'],
            'dokumen_barang_nama' => ['nullable', 'array'],
            'dokumen_barang_nama.*' => ['nullable', 'string', 'max:255'],
            'dokumentasi_foto' => ['nullable', 'array'],
            'dokumentasi_foto.*' => ['nullable', 'file', 'max:20480', 'mimes:jpg,jpeg,png,mp4'],
        ];
    }

    /**
     * Konfigurasi validator untuk memastikan minimal 1 dokumen barang/jasa ada (baik berkas baru maupun yang dipertahankan).
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $hasNewFiles = $this->hasFile('dokumen_barang') && ! empty($this->file('dokumen_barang'));
            $hasRetained = ! empty($this->input('retained_dokumen_ids', []));

            if (! $hasNewFiles && ! $hasRetained) {
                $validator->errors()->add('dokumen_barang', 'Minimal 1 dokumen barang/jasa (BAST) wajib dilampirkan.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'dokumen_barang.required' => 'Dokumen barang/jasa (minimal BAST) wajib diunggah.',
            'dokumen_barang.min' => 'Dokumen barang/jasa (minimal BAST) wajib diunggah.',
            'dokumen_barang.*.required' => 'Berkas dokumen wajib dilampirkan.',
            'dokumen_barang.*.file' => 'Berkas dokumen harus berupa file.',
            'dokumen_barang.*.max' => 'Ukuran berkas dokumen maksimal 10 MB per file.',
            'dokumen_barang.*.mimes' => 'Format berkas dokumen harus berupa PDF, Word, atau Excel.',
            'dokumentasi_foto.*.max' => 'Ukuran berkas dokumentasi maksimal 20 MB per file.',
            'dokumentasi_foto.*.mimes' => 'Format berkas dokumentasi harus berupa JPG, PNG, atau MP4.',
        ];
    }
}
