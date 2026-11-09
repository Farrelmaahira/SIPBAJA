<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SimpanJenisMakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->hasRole('Perencanaan');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'kode' => ['nullable', 'string', 'max:20'],
            'nama' => ['required', 'string', 'max:255'],
            'ppk_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'penanggung_jawab' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama Jenis MAK wajib diisi.',
            'nama.max' => 'Nama Jenis MAK maksimal 255 karakter.',
        ];
    }
}
