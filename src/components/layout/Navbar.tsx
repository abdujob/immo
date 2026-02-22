"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Heart, User, PlusCircle, Menu } from "lucide-react";
import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    // TODO: Replace with actual auth state
    const isAuthenticated = false;

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">
                            Immo<span className="text-blue-600">Sénégal</span>
                        </span>
                    </Link>

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
                                    <Button variant="ghost" size="icon">
                                        <Heart className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/properties/new">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Publier une annonce
                                    </Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button variant="outline" size="icon">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>
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
                                                href="/properties/new"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                    Publier une annonce
                                                </Button>
                                            </Link>
                                            <Link
                                                href="/dashboard"
                                                className="text-lg font-medium text-gray-700 hover:text-blue-600"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Mon compte
                                            </Link>
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
