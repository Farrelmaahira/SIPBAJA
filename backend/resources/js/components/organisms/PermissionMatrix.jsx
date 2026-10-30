import CheckboxInput from '../molecules/CheckboxInput';

export default function PermissionMatrix({ groupedPermissions = {}, checked = [], onToggle }) {
    const groups = Object.entries(groupedPermissions ?? {});

    if (groups.length === 0) {
        return (
            <p className="text-sm text-[#5F6F6A]">
                Belum ada izin terdaftar di sistem.
            </p>
        );
    }

    return (
        <div className="space-y-5">
            {groups.map(([group, permissions]) => (
                <div
                    key={group}
                    className="bg-white border border-[#E4EBE8] rounded-[20px] p-5 sm:p-6"
                >
                    <h3 className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-2">
                        {group}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        {(permissions ?? []).map((permission) => (
                            <CheckboxInput
                                key={permission.id}
                                id={`permission-${permission.id}`}
                                label={permission.kode}
                                checked={(checked ?? []).includes(permission.id)}
                                onChange={() => onToggle && onToggle(permission.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
