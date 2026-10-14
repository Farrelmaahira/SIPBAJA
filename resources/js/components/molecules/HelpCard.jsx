export default function HelpCard({ className = '' }) {
    return (
        <div
            className={`p-4 rounded-2xl bg-[#EAF5F1] border border-[#D5EAE1] ${className}`}
        >
            <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0E7C5A]" />
                <h3 className="text-[13px] font-semibold text-[#0A5C43]">
                    Pusat Bantuan
                </h3>
            </div>
            <p className="text-xs text-[#5F6F6A] leading-relaxed mb-3">
                Butuh bantuan panduan administrasi atau pengaturan sistem?
            </p>
            <a
                href="#bantuan"
                className="inline-flex items-center text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] transition-colors"
            >
                Buka dokumentasi &rarr;
            </a>
        </div>
    );
}
