"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    Scissors,
    LogOut,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/pro/dashboard" },
    { icon: Calendar, label: "Agenda", href: "/pro/agenda" },
    { icon: Scissors, label: "Services", href: "/pro/services" },
    { icon: UserCircle, label: "Mon Profil", href: "/pro/settings" },
];

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function ProLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isOnboarding = pathname === "/pro/onboarding";

    if (isOnboarding) {
        return <div className="min-h-screen bg-gray-50">{children}</div>;
    }

    const NavContent = () => (
        <>
            <div className="flex items-center gap-2 px-2 mb-8">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">P</div>
                <span className="text-xl font-bold tracking-tight">Platiny Pro</span>
            </div>

            <nav className="flex-1 space-y-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t pt-4 mt-auto">
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                </Button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - Desktop */}
            <aside className="hidden w-64 border-r bg-white px-4 py-6 md:flex md:flex-col shadow-sm fixed h-full z-10">
                <NavContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden h-16 border-b bg-white flex items-center px-4 sticky top-0 z-20">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 px-4 py-6 flex flex-col">
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                    <span className="ml-4 font-bold text-lg">Platiny Pro</span>
                </div>

                <div className="p-4 md:p-8">
                    <div className="mx-auto max-w-5xl">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
