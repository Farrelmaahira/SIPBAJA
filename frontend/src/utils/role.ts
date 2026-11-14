/**
 * Normalizes role string for comparison (case-insensitive, ignores spaces, hyphens, underscores).
 * Normalizes all Bidang 2 / Wakil Direktur II variations to "bidang2".
 */
export const normalizeRole = (role?: string | null): string => {
  if (!role) {
    return '';
  }
  const clean = role.trim().toLowerCase().replace(/[-_\s]+/g, '');
  if (
    clean === 'bidang2' ||
    clean === 'wakildirekturii' ||
    clean === 'wakildirektur2' ||
    clean === 'wadir2' ||
    clean === 'wadirii'
  ) {
    return 'bidang2';
  }
  return clean;
};

/**
 * Maps role to its primary dashboard route.
 * Handles roles such as "Admin", "Pemohon", "Bidang 2", "PPBJ", etc.
 * Always resolves any Bidang 2 variant to "/bidang-2/dashboard".
 */
export const getRoleDashboardPath = (role?: string | null): string => {
  if (!role) {
    return '/';
  }
  const normalized = normalizeRole(role);
  if (normalized === 'bidang2') {
    return '/bidang-2/dashboard';
  }
  const slug = role.trim().toLowerCase().replace(/[\s_]+/g, '-');
  return `/${slug}/dashboard`;
};
