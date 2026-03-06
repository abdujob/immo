import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center p-4 bg-gray-50 text-center">
            <div className="space-y-6 max-w-md w-full">
                <div className="text-9xl font-extrabold text-blue-600/20">
                    404
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Page introuvable
                </h1>
                <p className="text-lg text-gray-600">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/">
                            <Home className="w-5 h-5" />
                            Retour à l'accueil
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                        <Link href="/search">
                            <Search className="w-5 h-5" />
                            Rechercher un bien
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
