import { useState, useEffect, type FC } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface FlashMessageProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message?: string | null;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export const FlashMessage: FC<FlashMessageProps> = ({
  type = 'success',
  message,
  duration = 4000,
  onClose,
  className = '',
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(Boolean(message));
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    if (!message) {
      setIsFadingOut(false);
      setIsMounted(false);
      return;
    }

    setIsMounted(true);
    setIsFadingOut(false);

    if (duration > 0) {
      // Mulai animasi fade-out 350ms sebelum unmount
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, Math.max(0, duration - 350));

      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
        onClose?.();
      }, duration);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [message, duration, onClose]);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsMounted(false);
      onClose?.();
    }, 350);
  };

  if (!isMounted || !message) {
    return null;
  }

  const styles = {
    success: 'bg-[#E4F6EC] border-[#A8DFBF] text-[#0B7A4E]',
    error: 'bg-[#FDECEC] border-[#FECDCA] text-[#B42318]',
    warning: 'bg-[#FEF6EE] border-[#FEDF89] text-[#B54708]',
    info: 'bg-[#EBF7F3] border-[#BDE8D1] text-[#0E7C5A]',
  };

  const iconStyles = {
    success: 'text-[#0B7A4E]',
    error: 'text-[#B42318]',
    warning: 'text-[#B54708]',
    info: 'text-[#0E7C5A]',
  };

  const icons = {
    success: <CheckCircle2 className={`w-5 h-5 shrink-0 ${iconStyles.success}`} />,
    error: <AlertCircle className={`w-5 h-5 shrink-0 ${iconStyles.error}`} />,
    warning: <AlertCircle className={`w-5 h-5 shrink-0 ${iconStyles.warning}`} />,
    info: <Info className={`w-5 h-5 shrink-0 ${iconStyles.info}`} />,
  };

  return (
    <div
      role="alert"
      className={`inline-flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-semibold shadow-[0_4px_16px_rgba(13,51,38,0.08)] w-fit max-w-md sm:max-w-lg transition-all duration-300 ease-out transform ${
        isFadingOut
          ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100'
      } ${styles[type]} ${className}`}
    >
      {icons[type]}
      <span className="leading-snug">{message}</span>
      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 rounded-md hover:bg-black/5 active:bg-black/10 transition-colors shrink-0 cursor-pointer ml-1 text-current opacity-60 hover:opacity-100"
        aria-label="Tutup pesan"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FlashMessage;
