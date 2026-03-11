"use client";

import { Mail, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyRequestPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8">
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Mail className="w-12 h-12 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Vérifiez votre boîte mail</CardTitle>
                    <CardDescription>
                        Nous avons envoyé un lien de confirmation à votre adresse email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Veuillez cliquer sur le lien dans l'email pour activer votre compte. 
                        Si vous ne le trouvez pas, vérifiez votre dossier de courriers indésirables (Spam).
                    </p>
                    <div className="bg-amber-50 p-4 rounded-lg text-amber-800 text-sm border border-amber-100 italic">
                        "Un compte vérifié est nécessaire pour publier des annonces ou envoyer des messages."
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href="/auth/login">Retour à la connexion</Link>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        Une erreur ? Contactez notre support à support@immosenegal.sn
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
