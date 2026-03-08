"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    coiffeur: any;
    selectedServices: any[];
    totalPrice: number;
    totalDuration: number;
}

export function BookingModal({ isOpen, onClose, coiffeur, selectedServices, totalPrice, totalDuration }: BookingModalProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch slots when date changes
    useEffect(() => {
        if (!date || !coiffeur) return;

        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                // Ensure correct date format YYYY-MM-DD
                const dateStr = format(date, 'yyyy-MM-dd');
                const res = await fetch(`http://localhost:4000/availability/slots?coiffeurId=${coiffeur.id}&date=${dateStr}&serviceDuration=${totalDuration}&locationType=${coiffeur.type}`);

                if (res.ok) {
                    const data = await res.json();
                    setSlots(data);
                } else {
                    setSlots([]);
                }
            } catch (e) {
                console.error(e);
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [date, coiffeur, totalDuration]);

    const handleBooking = async () => {
        if (!date || !selectedSlot) return;
        setIsSubmitting(true);

        try {
            const user = localStorage.getItem('user');
            if (!user) {
                alert("Vous devez être connecté pour réserver.");
                router.push('/auth/login');
                return;
            }

            const res = await fetch('http://localhost:4000/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    coiffeurId: coiffeur.id,
                    serviceIds: selectedServices.map(s => s.id),
                    date: format(date, 'yyyy-MM-dd'),
                    startTime: selectedSlot,
                    locationType: coiffeur.type, // Assuming simplified for now
                    addressClient: coiffeur.type === 'DOMICILE' ? "Adresse du client" : undefined // Simplify for MVP
                })
            });

            if (res.ok) {
                setStep(3); // Success
            } else {
                const err = await res.json();
                alert(err.message || "Erreur lors de la réservation");
            }

        } catch (error) {
            console.error(error);
            alert("Erreur technique");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                <DialogTitle className="sr-only">Réservation - {coiffeur.firstName} {coiffeur.lastName}</DialogTitle>
                <div className="bg-primary p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">Réservation</h2>
                    <p className="opacity-90">{coiffeur.firstName} {coiffeur.lastName}</p>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-4">1. Choisissez une date</h3>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow-sm mx-auto"
                                    locale={fr}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </div>
                            <div>
                                <h3 className="font-bold mb-4">2. Choisissez une heure</h3>
                                <div className="h-[300px] overflow-y-auto scrollbar-thin pr-2">
                                    {loadingSlots ? (
                                        <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                                    ) : slots.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">Aucun créneau disponible ce jour.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {slots.map(slot => (
                                                <Button
                                                    key={slot}
                                                    variant={selectedSlot === slot ? "default" : "outline"}
                                                    className="w-full"
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-full border-t pt-4 mt-2 flex justify-end">
                                <Button
                                    className="w-full sm:w-auto font-bold text-lg"
                                    disabled={!selectedSlot}
                                    onClick={() => setStep(2)}
                                >
                                    Continuer ({totalPrice} €)
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold">Récapitulatif</h3>

                            <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium">{date && format(date, "d MMMM yyyy", { locale: fr })} à {selectedSlot}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Prestations</span>
                                    <div className="text-right">
                                        {selectedServices.map(s => (
                                            <div key={s.id} className="font-medium">{s.name} ({s.priceSalon || s.priceDomicile}€)</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                    <span>Total à payer</span>
                                    <span>{totalPrice} €</span>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                En confirmant, vous acceptez les conditions générales de vente.
                                Le paiement se fera sur place.
                            </p>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Retour</Button>
                                <Button className="flex-1 font-bold" onClick={handleBooking} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Valider la réservation
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold">Réservation confirmée !</h2>
                            <p className="text-center text-muted-foreground max-w-sm">
                                Votre rendez-vous avec {coiffeur.firstName} est validé.
                                Vous allez recevoir un email de confirmation.
                            </p>
                            <Button className="mt-6" onClick={() => router.push('/')}>
                                Retour à l'accueil
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
