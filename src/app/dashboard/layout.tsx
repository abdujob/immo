import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardProtection from "./DashboardProtection";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <DashboardProtection>
            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    {/* Sidebar */}
                    <DashboardSidebar />

                    {/* Main Content */}
                    <main className="flex-1 ml-64">
                        <div className="p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </DashboardProtection>
    );
}
