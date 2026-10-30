<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class FilterStatistikRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization oleh middleware role:Pemohon di routes/web.php
        return true;
    }

    public function rules(): array
    {
        return [
            'tahun' => ['nullable', 'integer', 'digits:4', 'min:2000', 'max:'.Carbon::now()->year],
        ];
    }

    public function messages(): array
    {
        return [
            'tahun.integer' => 'Tahun harus berupa angka.',
            'tahun.digits' => 'Tahun harus terdiri dari 4 digit.',
            'tahun.min' => 'Tahun tidak boleh sebelum tahun 2000.',
            'tahun.max' => 'Tahun tidak boleh melebihi tahun berjalan.',
        ];
    }

    /** Kembalikan tahun yang sudah divalidasi, atau tahun berjalan jika kosong. */
    public function tahun(): int
    {
        return (int) ($this->validated()['tahun'] ?? Carbon::now()->year);
    }
}
