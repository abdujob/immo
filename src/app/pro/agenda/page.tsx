"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Cette page est remplacée par /pro/messages dans la version immobilière
export default function ProAgendaPage() {
    const router = useRouter();
    useEffect(() => { router.replace("/pro/messages"); }, [router]);
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
}
