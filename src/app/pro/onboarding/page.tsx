"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Store, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

// Schema for Pro Onboarding
const proSchema = z.object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    bio: z.string().min(10, "La bio doit faire au moins 10 caractères"),
    experience: z.string().min(1, "L'expérience est requise"),
    // Agency fields
    agencyName: z.string().optional(),
    agencyAddress: z.string().optional(),
    // Individual fields
    operatingZone: z.string().optional()
});

type ProFormValues = z.infer<typeof proSchema>;

export default function OnboardingPage() {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<"AGENCE" | "PARTICULIER" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProFormValues>({
        resolver: zodResolver(proSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            bio: "",
            experience: ""
}
});

    const onSubmit = async (data: ProFormValues) => {
        setIsSubmitting(true);
        try {
            const user = localStorage.getItem('user');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

            const payload = {
                name: type === "AGENCE" ? data.agencyName : `${data.firstName} ${data.lastName}`,
                description: data.bio,
                address: type === "AGENCE" ? data.agencyAddress : data.operatingZone,
                city: type === "AGENCE" ? data.agencyAddress?.split(',')[0] || "Dakar" : data.operatingZone?.split(',')[0] || "Dakar",
                phone: "000000000", // On pourrait demander le téléphone, on met un dummy pour l'instant vu le schema
                email: "contact@pro.com", // Idem
                website: ""
};

            const response = await fetch(`${API_URL}/agencies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    
},
                body: JSON.stringify(payload)
});

            if (response.ok) {
                toast({ title: "Succès", description: "Votre espace Pro a été créé avec succès." });
                window.location.href = "/pro/dashboard";
            } else {
                const errData = await response.json();
                toast({ title: "Erreur", description: errData.message || "Une erreur est survenue.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            toast({ title: "Erreur", description: "Impossible de se connecter au serveur.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="mb-8 flex items-center justify-center gap-2">
                    <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-gray-200")} />
                    <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-gray-200")} />
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: Type Selection */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6 text-center"
                        >
                            <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur Platiny Pro</h1>
                            <p className="text-muted-foreground">Comment souhaitez-vous exercer ?</p>

                            <div className="grid gap-6 sm:grid-cols-2 mt-8">
                                {/* Domicile Card */}
                                <button
                                    onClick={() => setType("PARTICULIER")}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-4 rounded-2xl border-2 p-8 transition-all hover:border-primary/50 hover:bg-primary/5",
                                        type === "PARTICULIER" ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : "border-border bg-card"
                                    )}
                                >
                                    <div className="rounded-full bg-blue-100 p-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Home className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold">Particulier</h3>
                                        <p className="text-sm text-muted-foreground">Je vends ou loue un bien en direct</p>
                                    </div>
                                </button>

                                {/* Salon Card */}
                                <button
                                    onClick={() => setType("AGENCE")}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-4 rounded-2xl border-2 p-8 transition-all hover:border-primary/50 hover:bg-primary/5",
                                        type === "AGENCE" ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : "border-border bg-card"
                                    )}
                                >
                                    <div className="rounded-full bg-purple-100 p-4 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Store className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold">Agence Immobilière</h3>
                                        <p className="text-sm text-muted-foreground">Je représente une agence professionnelle</p>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button
                                    size="lg"
                                    disabled={!type}
                                    onClick={() => setStep(2)}
                                    className="gap-2"
                                >
                                    Continuer <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Details Form */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border"
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">Complétez votre profil</h2>
                                <p className="text-muted-foreground">
                                    Vous avez choisi : <span className="font-semibold text-primary">{type === "AGENCE" ? "Agence Immobilière" : "Particulier"}</span>
                                </p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Prénom</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Alex" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nom</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Dupont" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio courte</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Présentez-vous en quelques mots..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="experience"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Années d&apos;expérience</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="5" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Dynamic Fields based on Type */}
                                    {type === "AGENCE" ? (
                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="font-semibold">Informations de l&apos;agence</h3>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="agencyName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nom de l&apos;agence</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Immo Sénégal" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="agencyAddress"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Adresse de l&apos;agence</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Plateau, Dakar" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="font-semibold">Zone d&apos;activité</h3>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="operatingZone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Villes couvertes</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Dakar, Thiès..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-6">
                                        <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
                                            Retour
                                        </Button>
                                        <Button type="submit" size="lg" className="w-[200px]" disabled={isSubmitting}>
                                            {isSubmitting ? "Création..." : "Créer mon espace"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
