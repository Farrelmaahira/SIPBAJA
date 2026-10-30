<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SimpanRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Role::class)
            || ($this->route('role') !== null && $this->user()->can('update', $this->route('role')));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $role = $this->route('role');

        return [
            'nama' => [
                'required', 'string', 'max:255',
                $role ? Rule::unique('roles', 'nama')->ignore($role->id) : 'unique:roles,nama',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama peran wajib diisi.',
            'nama.unique' => 'Nama peran sudah dipakai.',
        ];
    }
}
