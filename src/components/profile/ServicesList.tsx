"use client";

import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

interface ServicesListProps {
    services: any[];
    selectedServices: string[];
    onToggle: (serviceId: string) => void;
}

export function ServicesList({ services, selectedServices, onToggle }: ServicesListProps) {
    if (!services || services.length === 0) {
        return (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mt-6 text-center text-muted-foreground">
                Aucun service proposé.
            </div>
        );
    }

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mt-6">
            <h2 className="text-xl font-bold mb-6">Services</h2>

            <div className="flex flex-col gap-4">
                {services.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                        <div
                            key={service.id}
                            onClick={() => onToggle(service.id)}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer border ${isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50 border-transparent'}`}
                        >
                            <div>
                                <h3 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{service.name}</h3>
                                <p className="text-sm text-muted-foreground">{service.durationMin} min</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg">{service.priceSalon !== null ? service.priceSalon : service.priceDomicile}€</span>
                                <Button
                                    size="sm"
                                    className={`rounded-full h-8 w-8 p-0 transition-all ${isSelected ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
                                >
                                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
