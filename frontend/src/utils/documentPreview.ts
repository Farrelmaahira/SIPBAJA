import api from '../services/api';

export interface DocumentPreviewOptions {
  nama: string;
  url?: string;
  tipe?: string;
  ukuran?: string;
  file?: File;
}

/**
 * Membuka pratinjau dokumen di tab baru dengan viewer lengkap
 */
export const openDocumentPreviewInNewTab = (options: DocumentPreviewOptions): void => {
  const { nama, url, tipe, ukuran, file } = options;
  const resolvedType = tipe || nama.split('.').pop()?.toUpperCase() || 'PDF';

  // Jika berupa berkas lokal baru (File object dari upload yang belum disimpan)
  if (file) {
    const localBlobUrl = URL.createObjectURL(file);
    const sessionKey = `sipbaja_preview_${Date.now()}`;

    try {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({
          name: file.name,
          type: resolvedType,
          size: ukuran || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          blobUrl: localBlobUrl,
          isLocal: true,
        })
      );
    } catch (e) {
      console.warn('Gagal menyimpan sesi preview:', e);
    }

    const previewUrl = `/preview/dokumen?sessionKey=${sessionKey}&name=${encodeURIComponent(
      file.name
    )}&type=${encodeURIComponent(resolvedType)}&size=${encodeURIComponent(ukuran || '')}`;

    window.open(previewUrl, '_blank', 'noopener');
    return;
  }

  // Jika berupa dokumen dari server dengan URL
  const query = new URLSearchParams({
    url: url || '',
    name: nama,
    type: resolvedType,
    size: ukuran || '',
  });

  const previewUrl = `/preview/dokumen?${query.toString()}`;
  window.open(previewUrl, '_blank', 'noopener');
};

/**
 * Unduh dokumen langsung menggunakan Axios (dengan Bearer token)
 */
export const downloadDocumentFile = async (url: string, filename: string): Promise<void> => {
  try {
    const res = await api.get(url, { responseType: 'blob' });
    const rawType = res.headers['content-type'];
    const contentType = typeof rawType === 'string' ? rawType : 'application/octet-stream';
    const blob = new Blob([res.data], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.error('Gagal mengunduh dokumen:', err);
    // Fallback direct link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
