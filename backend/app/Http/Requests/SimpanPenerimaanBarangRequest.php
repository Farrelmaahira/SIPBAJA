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
            'dokumen_barang' => ['required', 'array', 'min:1'],
            'dokumen_barang.*' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx'],
            'dokumen_barang_nama' => ['nullable', 'array'],
            'dokumen_barang_nama.*' => ['nullable', 'string', 'max:255'],
            'dokumentasi_foto' => ['nullable', 'array'],
            'dokumentasi_foto.*' => ['nullable', 'file', 'max:20480', 'mimes:jpg,jpeg,png,mp4'],
        ];
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
