"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
});

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    if (!token) {
        return (
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader className="text-center text-red-500">
                    <CardTitle>Lien invalide</CardTitle>
                    <CardDescription>Le jeton de réinitialisation est manquant.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/auth/login">Retour à la connexion</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        const result = await resetPassword({ token: token!, password: values.password });
        setLoading(false);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.message);
        }
    }

    return (
        <Card className="w-full max-w-md shadow-lg border-none">
            <CardHeader>
                <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
                <CardDescription>
                    Choisissez un nouveau mot de passe sécurisé pour votre compte.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success ? (
                    <div className="flex flex-col items-center py-4 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-bold">Succès !</h3>
                        <p className="text-sm text-muted-foreground mb-6">Votre mot de passe a été réinitialisé avec succès.</p>
                        <Button asChild className="w-full">
                            <Link href="/auth/login">Se connecter</Link>
                        </Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md">
                                    {error}
                                </div>
                            )}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nouveau mot de passe</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmer le mot de passe</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "Réinitialiser le mot de passe"}
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 px-4">
            <Suspense fallback={<Loader2 className="animate-spin" />}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
