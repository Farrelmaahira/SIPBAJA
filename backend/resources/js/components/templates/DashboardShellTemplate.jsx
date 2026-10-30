import { useState } from 'react';
import DashboardSidebar from '../organisms/DashboardSidebar';
import DashboardTopbar from '../organisms/DashboardTopbar';

export default function DashboardShellTemplate({
    sidebarProps = {},
    topbarProps = {},
    children,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-[#F3F6F5] text-[#14201C] font-sans antialiased">
            <DashboardSidebar
                {...sidebarProps}
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                <main className="flex-1 p-5 md:py-7 md:px-10 max-w-7xl w-full mx-auto flex flex-col gap-7">
                    <DashboardTopbar
                        {...topbarProps}
                        onMenuClick={() => setMobileOpen(true)}
                    />

                    {children}
                </main>
            </div>
        </div>
    );
}
