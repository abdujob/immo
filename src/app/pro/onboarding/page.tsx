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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

// Schema for Pro Onboarding
const proSchema = z.object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    bio: z.string().min(10, "La bio doit faire au moins 10 caractères"),
    experience: z.string().min(1, "L'expérience est requise"),
    // Salon fields
    salonName: z.string().optional(),
    salonAddress: z.string().optional(),
    // Home fields
    travelRadius: z.string().optional(),
    travelFee: z.string().optional(),
});

type ProFormValues = z.infer<typeof proSchema>;

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<"SALON" | "DOMICILE" | null>(null);

    const form = useForm<ProFormValues>({
        resolver: zodResolver(proSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            bio: "",
            experience: "",
        },
    });

    const onSubmit = (data: ProFormValues) => {
        console.log("Onboarding Data:", { ...data, type });
        // Simulate API call and redirect
        window.location.href = "/pro/dashboard";
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
                                    onClick={() => setType("DOMICILE")}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-4 rounded-2xl border-2 p-8 transition-all hover:border-primary/50 hover:bg-primary/5",
                                        type === "DOMICILE" ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : "border-border bg-card"
                                    )}
                                >
                                    <div className="rounded-full bg-blue-100 p-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Home className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold">Coiffeur à Domicile</h3>
                                        <p className="text-sm text-muted-foreground">Je me déplace chez mes clients</p>
                                    </div>
                                </button>

                                {/* Salon Card */}
                                <button
                                    onClick={() => setType("SALON")}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-4 rounded-2xl border-2 p-8 transition-all hover:border-primary/50 hover:bg-primary/5",
                                        type === "SALON" ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : "border-border bg-card"
                                    )}
                                >
                                    <div className="rounded-full bg-purple-100 p-4 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Store className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold">Salon de Coiffure</h3>
                                        <p className="text-sm text-muted-foreground">Je reçois dans mon établissement</p>
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
                                    Vous avez choisi : <span className="font-semibold text-primary">{type === "SALON" ? "Salon de Coiffure" : "Coiffeur à Domicile"}</span>
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
                                    {type === "SALON" ? (
                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="font-semibold">Infos du Salon</h3>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="salonName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nom du salon</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Studio Luxe" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="salonAddress"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Adresse complète</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="123 Rue de la Paix..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="font-semibold">Zone & Déplacement</h3>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="travelRadius"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Rayon de déplacement (km)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" placeholder="20" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="travelFee"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Frais de déplacement (€)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" placeholder="10" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-6">
                                        <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                            Retour
                                        </Button>
                                        <Button type="submit" size="lg" className="w-[200px]">
                                            Créer mon espace
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
