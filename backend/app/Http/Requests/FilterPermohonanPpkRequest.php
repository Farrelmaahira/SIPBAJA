<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FilterPermohonanPpkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->hasRole('PPK');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:255'],
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
            'statuses' => ['nullable', 'array'],
            'statuses.*' => ['string', 'max:50'],
            'bulan' => ['nullable', 'integer', 'between:1,12'],
            'tahun' => ['nullable', 'integer', 'digits:4'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'bulan.integer' => 'Bulan harus berupa angka.',
            'bulan.between' => 'Bulan harus berada di antara 1 sampai 12.',
            'tahun.integer' => 'Tahun harus berupa angka.',
            'tahun.digits' => 'Tahun harus terdiri dari 4 digit.',
            'per_page.between' => 'Jumlah data per halaman harus di antara 1 sampai 100.',
        ];
    }
}
