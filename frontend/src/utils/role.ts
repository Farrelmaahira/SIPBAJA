/**
 * Maps role to its primary dashboard route.
 * Handles roles such as "Admin", "Pemohon", "Bidang 2", "PPBJ", etc.
 */
export const getRoleDashboardPath = (role?: string | null): string => {
  if (!role) {
    return '/';
  }
  const slug = role.trim().toLowerCase().replace(/[\s_]+/g, '-');
  return `/${slug}/dashboard`;
};

/**
 * Normalizes role string for comparison (case-insensitive, ignores spaces, hyphens, underscores).
 */
export const normalizeRole = (role?: string | null): string => {
  if (!role) {
    return '';
  }
  return role.trim().toLowerCase().replace(/[-_\s]+/g, '');
};
