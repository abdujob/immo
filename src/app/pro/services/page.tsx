"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Cette page est remplacée par /pro/annonces dans la version immobilière
export default function ProServicesPage() {
    const router = useRouter();
    useEffect(() => { router.replace("/pro/annonces"); }, [router]);
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
}
