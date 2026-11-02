import type { FC } from 'react';
import StatusPill from '../atoms/StatusPill';
import { Eye, Users } from 'lucide-react';

export interface RecentUserItem {
  id: number | string;
  nama?: string;
  email?: string;
  role?: string;
  unit?: string;
  status?: string;
  [key: string]: unknown;
}

export interface RecentUsersTableProps {
  users?: RecentUserItem[];
  onViewUser?: (user: RecentUserItem) => void;
  onViewAll?: () => void;
  className?: string;
}

export const RecentUsersTable: FC<RecentUsersTableProps> = ({
  users = [],
  onViewUser,
  onViewAll,
  className = '',
}) => {
  const hasUsers = users && users.length > 0;

  return (
    <section
      className={`bg-white border border-[#E4EBE8] rounded-[20px] shadow-[0_1px_3px_rgba(20,32,28,0.04)] overflow-hidden ${className}`}
      aria-labelledby="recent-users-title"
    >
      {/* Header Card */}
      <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4EBE8]">
        <div>
          <h2
            id="recent-users-title"
            className="text-base font-bold text-[#14201C]"
          >
            Pengguna Terbaru
          </h2>
          <p className="text-xs text-[#5F6F6A] mt-0.5">
            Daftar pengguna yang baru didaftarkan atau aktif dalam sistem.
          </p>
        </div>
        {hasUsers && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] transition-colors cursor-pointer self-start sm:self-auto min-h-[44px] flex items-center"
          >
            Lihat semua pengguna &rarr;
          </button>
        )}
      </div>

      {/* Table Content */}
      {!hasUsers ? (
        <div className="py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#5F6F6A] mx-auto flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#14201C]">
            Belum ada pengguna terdaftar
          </p>
          <p className="text-xs text-[#5F6F6A] mt-1 max-w-sm mx-auto">
            Data pengguna yang baru ditambahkan ke dalam sistem SIPBAJA akan ditampilkan di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F7F4] border-b border-[#E4EBE8] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
                <th scope="col" className="py-3.5 px-6">
                  Nama & Email
                </th>
                <th scope="col" className="py-3.5 px-6">
                  Peran
                </th>
                <th scope="col" className="py-3.5 px-6">
                  Unit Kerja
                </th>
                <th scope="col" className="py-3.5 px-6">
                  Status
                </th>
                <th scope="col" className="py-3.5 px-6 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4EBE8] text-sm">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-[#F7FAF9] transition-colors"
                >
                  {/* Name & Email */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] font-bold text-xs flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        {u.nama ? u.nama.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#14201C] truncate max-w-[200px]">
                          {u.nama}
                        </p>
                        <p className="text-xs text-[#8A9A95] truncate max-w-[200px]">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6 text-sm text-[#14201C] font-medium whitespace-nowrap">
                    {u.role}
                  </td>

                  {/* Unit */}
                  <td className="py-4 px-6 text-sm text-[#5F6F6A] whitespace-nowrap">
                    {u.unit}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <StatusPill status={u.status} />
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewUser && onViewUser(u)}
                      className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-xl text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                      aria-label={`Lihat detail ${u.nama}`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default RecentUsersTable;
