"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MapPin, Home, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fr } from "date-fns/locale";

const SLOTS = [
    "09:00", "09:30", "10:00", "11:00", "14:00", "14:30", "15:00", "16:00"
];

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [locationType, setLocationType] = useState("salon");

    const nextStep = () => {
        if (step === 1 && selectedSlot) setStep(2);
        if (step === 2) setStep(3); // Confirmation
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                {step === 1 && "Choisissez un créneau"}
                {step === 2 && "Lieu du rendez-vous"}
                {step === 3 && "Confirmation"}
            </h1>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-8 justify-center">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={cn("h-1 w-12 rounded-full transition-colors", step >= s ? "bg-primary" : "bg-gray-200")} />
                ))}
            </div>

            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8">

                {/* Step 1: Slot Selection */}
                {step === 1 && (
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={fr}
                                className="rounded-md border mx-auto"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold mb-4 text-foreground">Disponibilités</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {SLOTS.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={cn(
                                            "py-2 px-1 rounded-lg text-sm font-medium transition-all border",
                                            selectedSlot === slot
                                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                                : "bg-white hover:border-primary border-transparent text-foreground hover:bg-gray-50 bg-gray-50"
                                        )}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                            <Button
                                className="w-full mt-8"
                                disabled={!selectedSlot}
                                onClick={nextStep}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-4 text-foreground">Où souhaitez-vous la prestation ?</h3>
                            <RadioGroup defaultValue="salon" onValueChange={setLocationType} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <RadioGroupItem value="salon" id="salon" className="peer sr-only" />
                                    <Label
                                        htmlFor="salon"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
                                    >
                                        <Home className="mb-3 h-6 w-6" />
                                        Au Salon
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="home" id="home" className="peer sr-only" />
                                    <Label
                                        htmlFor="home"
                                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
                                    >
                                        <MapPin className="mb-3 h-6 w-6" />
                                        À Domicile ( +10€ )
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {locationType === "home" && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <Label className="mb-2 block">Votre adresse</Label>
                                <input
                                    type="text"
                                    placeholder="123 Rue Principale, Ville"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        )}

                        <Separator />

                        <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Coupe Homme</span>
                                <span>25€</span>
                            </div>
                            {locationType === "home" && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Frais déplacement</span>
                                    <span>10€</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                <span>Total</span>
                                <span>{locationType === "home" ? "35€" : "25€"}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="terms" />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                J&apos;accepte les conditions d&apos;annulation
                            </label>
                        </div>

                        <Button className="w-full" onClick={nextStep}>Confirmer et Payer</Button>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Réservation Confirmée !</h2>
                        <p className="text-muted-foreground mb-8">
                            Votre coiffeur a reçu votre demande pour le <br />
                            <span className="font-bold text-foreground">
                                {date?.toLocaleDateString()} à {selectedSlot}
                            </span>
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => window.location.href = '/'}>Retour à l&apos;accueil</Button>
                            <Button>Ajouter au calendrier</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
