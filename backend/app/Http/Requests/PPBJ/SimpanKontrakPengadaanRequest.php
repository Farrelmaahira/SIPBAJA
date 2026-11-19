<?php

namespace App\Http\Requests\PPBJ;

use Illuminate\Foundation\Http\FormRequest;

class SimpanKontrakPengadaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->Role?->nama === 'PPBJ';
    }

    public function rules(): array
    {
        return [
            'tipe' => ['required', 'string', 'in:Kontrak,SPK,Surat Pesanan,Kwitansi'],
            'nomor' => ['required', 'string', 'max:100'],
            'tanggal' => ['required', 'date'],
            'vendor_nama' => ['required', 'string', 'max:255'],
            'nominal_kontrak' => ['required', 'numeric', 'min:1'],
            'tanggal_jatuh_tempo' => ['required', 'date', 'after_or_equal:tanggal'],
            'tanggal_reminder' => ['required', 'date', 'before_or_equal:tanggal_jatuh_tempo'],
            'dokumen' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipe.required' => 'Tipe instrumen dokumen pembelian wajib dipilih.',
            'tipe.in' => 'Tipe instrumen harus salah satu dari: Kontrak, SPK, Surat Pesanan, atau Kwitansi.',
            'nomor.required' => 'Nomor surat/kontrak wajib diisi.',
            'tanggal.required' => 'Tanggal dokumen wajib diisi.',
            'tanggal.date' => 'Format tanggal dokumen tidak valid.',
            'vendor_nama.required' => 'Nama penyedia/vendor wajib diisi.',
            'nominal_kontrak.required' => 'Nominal biaya riil/kontrak wajib diisi.',
            'nominal_kontrak.numeric' => 'Nominal biaya riil harus berupa angka.',
            'nominal_kontrak.min' => 'Nominal biaya riil minimal Rp 1.',
            'tanggal_jatuh_tempo.required' => 'Tanggal jatuh tempo wajib diisi.',
            'tanggal_jatuh_tempo.after_or_equal' => 'Tanggal jatuh tempo tidak boleh mendahului tanggal dokumen.',
            'tanggal_reminder.required' => 'Tanggal pengingat wajib diisi.',
            'tanggal_reminder.before_or_equal' => 'Tanggal pengingat tidak boleh melewati tanggal jatuh tempo.',
            'dokumen.mimes' => 'Dokumen pembelian harus berupa berkas PDF.',
            'dokumen.max' => 'Ukuran dokumen pembelian maksimal 10 MB.',
        ];
    }
}
