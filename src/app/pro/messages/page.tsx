"use client";

// Redirige vers dashboard/messages qui est identique
// Les agents immobiliers ont accès aux messages via le dashboard principal

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProMessagesPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/messages");
    }, [router]);

    return (
        <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        </div>
    );
}
