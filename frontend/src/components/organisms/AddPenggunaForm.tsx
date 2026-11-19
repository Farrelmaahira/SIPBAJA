import normalizeOptions from "@/utils/normalizeOptions";
import FormField from "../molecules/FormField";
import SelectInput from "../molecules/SelectInput";
import TextInput from "../molecules/TextInput";
import { PenggunaFormData } from "@/types/admin";

export function PenggunaForm({
    data,
    setData,
    errors,
    roles,
    units,
    isEdit,
}: {
    data: PenggunaFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    roles: any[];
    units: any[];
    isEdit: boolean;
}) {
    return (
        <div className="space-y-4">
            <FormField label="Nama lengkap" error={errors.nama} htmlFor="pengguna-nama">
                <TextInput
                    id="pengguna-nama"
                    value={data.nama || ''}
                    onChange={(e) => setData('nama', e.target.value)}
                    placeholder="Nama lengkap pengguna"
                    error={errors.nama}
                />
            </FormField>
            <FormField label="Email" error={errors.email} htmlFor="pengguna-email">
                <TextInput
                    id="pengguna-email"
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="nama@pnj.ac.id"
                    error={errors.email}
                />
            </FormField>
            <FormField
                label={isEdit ? 'Password baru (kosongkan jika tidak diubah)' : 'Password'}
                error={errors.password}
                htmlFor="pengguna-password"
            >
                <TextInput
                    id="pengguna-password"
                    type="password"
                    value={data.password || ''}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Minimal 8 karakter"
                    error={errors.password}
                />
            </FormField>
            <FormField label="Peran" error={errors.role_id} htmlFor="pengguna-role">
                <SelectInput
                    id="pengguna-role"
                    value={data.role_id || ''}
                    onChange={(e) => setData('role_id', e.target.value)}
                    options={normalizeOptions(roles)}
                    placeholder="Pilih peran"
                    error={errors.role_id}
                />
            </FormField>
            <FormField label="Unit kerja" error={errors.unit_id} htmlFor="pengguna-unit">
                <SelectInput
                    id="pengguna-unit"
                    value={data.unit_id || ''}
                    onChange={(e) => setData('unit_id', e.target.value)}
                    options={normalizeOptions(units)}
                    placeholder="Pilih unit kerja (opsional)"
                    error={errors.unit_id}
                />
            </FormField>
        </div>
    );
}