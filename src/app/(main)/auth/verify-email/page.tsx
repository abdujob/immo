"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { verifyEmail } from "@/lib/api";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (token) {
            handleVerification();
        } else {
            setStatus("error");
            setMessage("Jeton manquant.");
        }
    }, [token]);

    const handleVerification = async () => {
        const result = await verifyEmail(token!);
        if (result.success) {
            setStatus("success");
            setMessage(result.message);
            // Auto redirect to login after 3 seconds on success
            setTimeout(() => {
                router.push("/auth/login?verified=true");
            }, 3000);
        } else {
            setStatus("error");
            setMessage(result.message || "La vérification a échoué.");
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-none">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Vérification de l'email</CardTitle>
                <CardDescription>
                    Activation de votre compte ImmoSénégal
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6 text-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p>Vérification en cours...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Compte activé !</h3>
                        <p className="text-muted-foreground mb-4">{message}</p>
                        <p className="text-sm text-blue-600 animate-pulse mb-6">
                            Redirection vers la connexion dans quelques secondes...
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/auth/login">Se connecter</Link>
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Erreur</h3>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/auth/login">Retour à la connexion</Link>
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 px-4">
            <Suspense fallback={<Loader2 className="animate-spin" />}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
