<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewPengadaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('PP') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('alasan') && $this->filled('catatan')) {
            $this->merge(['alasan' => $this->input('catatan')]);
        }

        if (! $this->filled('catatan') && $this->filled('alasan')) {
            $this->merge(['catatan' => $this->input('alasan')]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'alasan' => ['required', 'string', 'min:5', 'max:500'],
            'catatan' => ['nullable', 'string', 'min:5', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'alasan.required' => 'Catatan revisi atau alasan penolakan dokumen pengadaan wajib diisi.',
            'alasan.min' => 'Catatan revisi minimal berisi 5 karakter.',
            'alasan.max' => 'Catatan revisi maksimal 500 karakter.',
            'catatan.min' => 'Catatan revisi minimal berisi 5 karakter.',
            'catatan.max' => 'Catatan revisi maksimal 500 karakter.',
        ];
    }
}
