<?php

namespace App\Http\Requests;

use App\Models\Mak;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SimpanMakRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Mak::class)
            || ($this->route('mak') !== null && $this->user()->can('update', $this->route('mak')));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $mak = $this->route('mak');

        return [
            'nama' => [
                'required', 'string', 'max:255',
                $mak ? Rule::unique('maks', 'nama')->ignore($mak->id) : 'unique:maks,nama',
            ],
            'ppk_user_id' => ['required', 'exists:users,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama MAK wajib diisi.',
            'nama.unique' => 'Nama MAK sudah dipakai.',
            'ppk_user_id.required' => 'PPK yang bertugas wajib dipilih.',
            'ppk_user_id.exists' => 'PPK yang dipilih tidak valid.',
        ];
    }
}
