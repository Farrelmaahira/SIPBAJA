<?php

namespace App\Http\Requests\PPBJ;

use Illuminate\Foundation\Http\FormRequest;

class HapusDraftPengadaanRequest extends FormRequest
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
        return [];
    }
}

