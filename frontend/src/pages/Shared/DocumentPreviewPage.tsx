import { useEffect, useState, type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  FileCode,
  Download,
  X,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import api from '../../services/api';

export const DocumentPreviewPage: FC = () => {
  const [searchParams] = useSearchParams();

  const urlParam = searchParams.get('url') || '';
  const nameParam = searchParams.get('name') || 'Dokumen';
  const typeParam = searchParams.get('type') || 'PDF';
  const sizeParam = searchParams.get('size') || '';
  const sessionKey = searchParams.get('sessionKey');

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [docName, setDocName] = useState<string>(nameParam);
  const [docType, setDocType] = useState<string>(typeParam.toUpperCase());
  const [docSize, setDocSize] = useState<string>(sizeParam);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Controls for images
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    // 1. Cek apakah dokumen berasal dari berkas lokal yang disimpan di sessionStorage
    if (sessionKey) {
      try {
        const stored = sessionStorage.getItem(sessionKey);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            name: string;
            type: string;
            size: string;
            blobUrl: string;
          };
          setDocName(parsed.name || nameParam);
          setDocType((parsed.type || typeParam).toUpperCase());
          setDocSize(parsed.size || sizeParam);
          setBlobUrl(parsed.blobUrl);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Gagal membaca sesi pratinjau lokal:', e);
      }
    }

    // 2. Jika bukan dari session, ambil berkas dari server menggunakan Axios (dengan Bearer Token)
    if (!urlParam) {
      setErrorMessage('Tautan dokumen tidak valid atau tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchDocumentBlob = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const targetUrl = urlParam.includes('disposition=')
          ? urlParam
          : `${urlParam}${urlParam.includes('?') ? '&' : '?'}disposition=inline`;

        const res = await api.get(targetUrl, {
          responseType: 'blob',
          signal: controller.signal,
        });

        const rawType = res.headers['content-type'];
        const contentType =
          typeof rawType === 'string'
            ? rawType
            : docType.includes('PDF')
            ? 'application/pdf'
            : 'application/octet-stream';

        const blob = new Blob([res.data], { type: contentType });
        const createdBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(createdBlobUrl);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        console.error('Gagal memuat pratinjau dokumen:', err);
        setErrorMessage(
          'Gagal memuat berkas dokumen dari server. Pastikan Anda memiliki hak akses atau coba unduh langsung.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchDocumentBlob();

    return () => {
      controller.abort();
    };
  }, [urlParam, sessionKey, nameParam, typeParam, sizeParam, docType]);

  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = docName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (urlParam) {
      const link = document.createElement('a');
      link.href = urlParam;
      link.download = docName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isPdf = docType === 'PDF' || docName.toLowerCase().endsWith('.pdf');
  const isImage =
    ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG'].includes(docType) ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(docName);

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#404347] select-none">
      {/* Top Bar Header */}
      <header className="h-16 shrink-0 bg-white border-b border-[#E4EBE8] px-4 sm:px-6 flex items-center justify-between gap-4 z-20 shadow-xs">
        {/* Left: Info Dokumen */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FEECEC] text-[#E5484D] flex items-center justify-center shrink-0">
            {isImage ? <FileText className="w-5 h-5 text-[#0E7C5A]" /> : <FileCode className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-bold text-[#14201C] truncate max-w-[280px] sm:max-w-md md:max-w-lg">
                {docName}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEF5F2] text-[#0E7C5A] border border-[#BDE8D1]">
                {docType}
              </span>
            </div>
            <p className="text-xs text-[#5F6F6A] font-medium mt-0.5">
              Pratinjau Dokumen {docSize ? `• ${docSize}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls for images */}
          {isImage && blobUrl && (
            <div className="hidden sm:flex items-center gap-1 mr-2 bg-[#F4F7F5] border border-[#E4EBE8] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 25, 50))}
                className="p-1.5 rounded-lg text-[#5F6F6A] hover:text-[#14201C] hover:bg-white transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-1 text-[#14201C] min-w-[45px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 25, 250))}
                className="p-1.5 rounded-lg text-[#5F6F6A] hover:text-[#14201C] hover:bg-white transition-colors cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1.5 rounded-lg text-[#5F6F6A] hover:text-[#14201C] hover:bg-white transition-colors cursor-pointer ml-1"
                title="Putar 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Unduh Berkas Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
            title="Unduh Berkas ke Komputer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh Dokumen</span>
          </button>

          {/* Tutup Tab Button */}
          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center justify-center p-2 rounded-xl border border-[#E4EBE8] bg-[#F4F7F5] hover:bg-[#E4EBE8] text-[#5F6F6A] hover:text-[#14201C] transition-colors cursor-pointer min-h-[38px] min-w-[38px]"
            title="Tutup Tab Pratinjau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="flex-1 w-full h-[calc(100vh-64px)] overflow-hidden relative flex items-center justify-center bg-[#525659]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E4EBE8] animate-in fade-in duration-200">
            <Loader2 className="w-9 h-9 text-[#0E7C5A] animate-spin" />
            <p className="text-sm font-bold text-[#14201C]">Memuat Pratinjau Dokumen...</p>
            <p className="text-xs text-[#5F6F6A]">Menyiapkan berkas untuk ditampilkan</p>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-2xl border border-[#E4EBE8] max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#FEECEC] text-[#E5484D] flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#14201C]">Pratinjau Tidak Tersedia</h3>
            <p className="text-xs text-[#5F6F6A] mt-1.5 leading-relaxed">{errorMessage}</p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Coba Unduh Langsung</span>
              </button>
              <button
                type="button"
                onClick={() => window.close()}
                className="px-4 py-2.5 rounded-xl border border-[#E4EBE8] bg-[#F4F7F5] hover:bg-[#E4EBE8] text-xs font-semibold text-[#14201C] transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : blobUrl && isPdf ? (
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=1`}
            className="w-full h-full border-0 bg-white"
            title={docName}
          />
        ) : blobUrl && isImage ? (
          <div className="w-full h-full overflow-auto flex items-center justify-center p-6 bg-[#2B2D30]">
            <img
              src={blobUrl}
              alt={docName}
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl border border-white/10"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-2xl border border-[#E4EBE8] max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#14201C]">{docName}</h3>
            <p className="text-xs text-[#5F6F6A] mt-1.5 leading-relaxed">
              Format berkas <strong className="font-semibold text-[#14201C]">{docType}</strong> tidak mendukung pratinjau langsung di dalam browser.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#09573E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas untuk Membuka</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocumentPreviewPage;
