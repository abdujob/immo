"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardProtection({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('user');

        if (!user) {
            router.push('/auth/login');
            return;
        }

        const userData = JSON.parse(user);
        // Only allow AGENCY_AGENT and ADMIN roles
        if (userData.role !== 'AGENCY_AGENT' && userData.role !== 'ADMIN') {
            router.push('/');
        }
    }, [router]);

    return <>{children}</>;
}
