"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email("Veuillez entrer un email valide."),
});

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        const result = await forgotPassword(values.email);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            setMessage(result.message);
        } else {
            form.setError("email", { message: result.message });
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 px-4">
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader>
                    <div className="mb-4">
                        <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </Link>
                    </div>
                    <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
                    <CardDescription>
                        Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="flex flex-col items-center py-4 text-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                            <p className="text-sm font-medium">{message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                N'oubliez pas de vérifier vos courriers indésirables.
                            </p>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="votre@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t py-4">
                    <p className="text-sm text-muted-foreground">
                        Vous vous en souvenez ? <Link href="/auth/login" className="text-primary hover:underline">Se connecter</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
