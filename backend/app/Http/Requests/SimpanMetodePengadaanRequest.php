<?php

namespace App\Http\Requests;

use App\Models\MetodePengadaan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SimpanMetodePengadaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', MetodePengadaan::class)
            || ($this->route('metode_pengadaan') !== null && $this->user()->can('update', $this->route('metode_pengadaan')));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $metode = $this->route('metode_pengadaan');
        $metodeId = $metode instanceof MetodePengadaan ? $metode->id : $metode;

        return [
            'nama' => [
                'required', 'string', 'max:255',
                $metodeId ? Rule::unique('metode_pengadaan', 'nama')->ignore($metodeId) : 'unique:metode_pengadaan,nama',
            ],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama metode pengadaan wajib diisi.',
            'nama.unique' => 'Nama metode pengadaan sudah terdaftar.',
            'isActive.boolean' => 'Status aktif tidak valid.',
        ];
    }
}
