<?php

namespace App\Http\Requests;

use App\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SimpanUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Unit::class)
            || ($this->route('unit') !== null && $this->user()->can('update', $this->route('unit')));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $unit = $this->route('unit');

        return [
            'nama' => [
                'required', 'string', 'max:255',
                $unit ? Rule::unique('units', 'nama')->ignore($unit->id) : 'unique:units,nama',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama unit kerja wajib diisi.',
            'nama.unique' => 'Nama unit kerja sudah dipakai.',
        ];
    }
}
