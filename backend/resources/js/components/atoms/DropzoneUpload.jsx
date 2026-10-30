import { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function DropzoneUpload({
    id = 'file_dokumen',
    file,
    onChange,
    error,
    maxSizeMb = 10,
}) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState(null);

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateAndSelectFile = (selectedFile) => {
        setLocalError(null);

        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setLocalError('Format berkas harus berupa dokumen PDF (.pdf).');
            return;
        }

        const maxBytes = maxSizeMb * 1024 * 1024;
        if (selectedFile.size > maxBytes) {
            setLocalError(`Ukuran berkas melebihi batas maksimal ${maxSizeMb} MB.`);
            return;
        }

        onChange(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSelectFile(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSelectFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        onChange(null);
        setLocalError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const displayedError = error || localError;

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleInputChange}
            />

            {!file ? (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2 ${
                        isDragging
                            ? 'border-[#0E7C5A] bg-[#E4F6EC]/40 scale-[0.99]'
                            : displayedError
                            ? 'border-[#FDA29B] bg-[#FDECEC]/30'
                            : 'border-[#A3D9C9] bg-[#F2F9F6] hover:bg-[#EAF5F0]'
                    }`}
                >
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0E7C5A] mb-3">
                        <UploadCloud className="w-6 h-6 stroke-[2]" />
                    </div>
                    <p className="text-sm text-[#344054] text-center mb-1">
                        <span className="font-semibold text-[#0E7C5A] hover:underline">Klik untuk upload</span>{' '}
                        atau drag & drop
                    </p>
                    <p className="text-xs text-[#667085] text-center">PDF (Maks {maxSizeMb}MB)</p>
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#A3D9C9] bg-[#F2F9F6]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1D2939] truncate" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-xs text-[#667085]">{formatBytes(file.size)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pl-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="text-xs font-semibold text-[#0E7C5A] hover:text-[#0B6348] px-2.5 py-1.5 rounded-lg border border-[#A3D9C9] bg-white hover:bg-[#F2F9F6] transition-colors"
                        >
                            Ganti
                        </button>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="w-8 h-8 rounded-lg text-[#667085] hover:text-[#B42318] hover:bg-[#FDECEC] flex items-center justify-center transition-colors"
                            aria-label="Hapus berkas"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {displayedError && (
                <p className="mt-1.5 text-xs text-[#D92D20] font-medium" role="alert">
                    {displayedError}
                </p>
            )}
        </div>
    );
}
