"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Heart, PlusCircle, Menu, LogOut, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const success = await markNotificationAsRead(id);
            if (success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const success = await markAllNotificationsAsRead();
            if (success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const userInitials = user
        ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
        : '';

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div
                        onClick={() => router.push('/')}
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">
                            Immo<span className="text-blue-600">Sénégal</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Annonces
                        </Link>
                        <Link href="/agencies" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Agences
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link href="/favorites">
                                    <Button variant="ghost" size="icon" title="Mes favoris">
                                        <Heart className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/properties/new">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Publier
                                    </Button>
                                </Link>

                                {/* Notifications */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative" title="Notifications">
                                            <Bell className="h-5 w-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80">
                                        <div className="flex items-center justify-between px-4 py-2 border-b">
                                            <span className="font-semibold text-sm">Notifications</span>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                                                    Tout marquer comme lu
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    Aucune notification
                                                </div>
                                            ) : (
                                                notifications.map((notif: any) => {
                                                    const handleSelect = () => {
                                                        if (!notif.read) markAsRead(notif.id);

                                                        let meta = notif.data;
                                                        if (typeof meta === 'string') {
                                                            try { meta = JSON.parse(meta); } catch (e) { }
                                                        }

                                                        if (notif.type === 'CONTACT' && meta) {
                                                            const { propertyId, senderId } = meta;
                                                            if (propertyId && senderId) {
                                                                router.push(`/dashboard/messages?propertyId=${propertyId}&senderId=${senderId}`);
                                                            } else {
                                                                router.push('/dashboard/messages');
                                                            }
                                                        }
                                                    };

                                                    return (
                                                        <DropdownMenuItem
                                                            key={notif.id}
                                                            className={`flex flex-col items-start p-3 cursor-pointer border-b last:border-0 ${notif.read ? 'opacity-70' : 'bg-blue-50/50'}`}
                                                            onSelect={handleSelect}
                                                        >
                                                            <div className="flex w-full justify-between items-start mb-1">
                                                                <span className="text-xs font-semibold text-gray-500">{notif.type}</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-800 line-clamp-2">{notif.message}</p>
                                                        </DropdownMenuItem>
                                                    );
                                                })
                                            )}
                                        </div>
                                        <DropdownMenuSeparator />
                                        <div className="p-2 text-center text-xs text-gray-500">
                                            Dernières notifications d'ImmoSénégal
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* User dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-full overflow-hidden w-9 h-9">
                                            {user?.avatar ? (
                                                <Image
                                                    src={user.avatar}
                                                    alt="Avatar"
                                                    width={36}
                                                    height={36}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-blue-600">{userInitials}</span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <div className="px-3 py-2 text-sm">
                                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard">Mon tableau de bord</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/properties">Mes annonces</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/profile">Mon profil</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 cursor-pointer"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Se déconnecter
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost">
                                        Connexion
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Inscription
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px]">
                                <div className="flex flex-col space-y-4 mt-8">
                                    {isAuthenticated && (
                                        <div className="pb-4 border-b">
                                            <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    )}

                                    <Link
                                        href="/properties"
                                        className="text-lg font-medium text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Annonces
                                    </Link>
                                    <Link
                                        href="/agencies"
                                        className="text-lg font-medium text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Agences
                                    </Link>

                                    {isAuthenticated ? (
                                        <>
                                            <Link
                                                href="/favorites"
                                                className="text-lg font-medium text-gray-700 hover:text-blue-600"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Mes favoris
                                            </Link>
                                            <Link
                                                href="/dashboard"
                                                className="text-lg font-medium text-gray-700 hover:text-blue-600"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Mon compte
                                            </Link>
                                            <Link
                                                href="/properties/new"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                    Publier une annonce
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Se déconnecter
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth/login"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button variant="outline" className="w-full">
                                                    Connexion
                                                </Button>
                                            </Link>
                                            <Link
                                                href="/auth/register"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    Inscription
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
