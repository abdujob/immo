"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    MessageSquare,
    Settings,
    LogOut,
    Home,
    PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/pro/dashboard" },
    { icon: Home, label: "Mes annonces", href: "/pro/annonces" },
    { icon: MessageSquare, label: "Messages", href: "/pro/messages" },
    { icon: Settings, label: "Paramètres agence", href: "/pro/settings" },
];

export default function ProLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const router = useRouter();

    const isOnboarding = pathname === "/pro/onboarding";
    if (isOnboarding) {
        return <div className="min-h-screen bg-gray-50">{children}</div>;
    }

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const NavContent = () => (
        <>
            <div className="flex items-center gap-2 px-2 mb-8">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                    <span className="text-lg font-bold tracking-tight text-gray-900">ImmoSénégal</span>
                    <p className="text-xs text-gray-500">Espace Agence</p>
                </div>
            </div>

            {/* Quick action */}
            <Link href="/properties/new" className="mb-6 block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Publier une annonce
                </Button>
            </Link>

            <nav className="flex-1 space-y-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t pt-4 mt-auto">
                {user && (
                    <div className="px-3 py-2 mb-2">
                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                )}
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                >
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
                    <span className="ml-4 font-bold text-lg">Espace Agence</span>
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
