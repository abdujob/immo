import { Navbar } from "@/components/layout/Navbar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-[65px]">
                {children}
            </main>
        </>
    );
}
