import { isValidationError } from '../types/api';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * Validasi berkas unggahan di sisi klien sesuai aturan:
 * - Format berkas harus PDF, JPG, atau PNG.
 * - Ukuran berkas maksimal 10 MB.
 */
export function validateUploadFile(file: File | null | undefined): string | null {
  if (!file) {
    return 'Berkas wajib dipilih.';
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = (file.type || '').toLowerCase();

  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeValid = mime === '' ? isExtValid : ALLOWED_MIMES.includes(mime);

  if (!isExtValid || !isMimeValid) {
    return 'Format berkas harus PDF, JPG, atau PNG.';
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return 'Ukuran berkas maksimal 10 MB.';
  }

  return null;
}

/**
 * Mengekstrak pesan error 422 dari server (Laravel ValidationException) ke map per kolom.
 */
export function extractServerErrors(error: unknown): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  let message = 'Terjadi kesalahan saat memproses permintaan.';

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: unknown } }).response;
    const data = response?.data;

    if (isValidationError(data)) {
      message = data.message || message;
      for (const [key, messages] of Object.entries(data.errors)) {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[key] = messages[0];
        }
      }
      return { message, fieldErrors };
    }

    if (typeof data === 'object' && data !== null && 'message' in data) {
      const serverMsg = (data as { message?: unknown }).message;
      if (typeof serverMsg === 'string' && serverMsg.trim() !== '') {
        message = serverMsg;
      }
    }
  }

  return { message, fieldErrors };
}
