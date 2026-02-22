"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Mock Appointments
const APPOINTMENTS = [
    {
        id: 1,
        client: "Jean Dupont",
        service: "Coupe Homme",
        start: new Date().setHours(10, 0, 0, 0),
        duration: 30,
        type: "SALON",
    },
    {
        id: 2,
        client: "Marc Levy",
        service: "Barbe",
        start: new Date().setHours(14, 0, 0, 0),
        duration: 20,
        type: "DOMICILE",
    },
];

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9h to 19h

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start Monday

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    // Fetch appointments when startDate changes
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const startStr = format(startDate, 'yyyy-MM-dd');
                const endStr = format(addDays(startDate, 6), 'yyyy-MM-dd');
                const token = localStorage.getItem('token');

                const res = await fetch(`http://localhost:4000/appointments?start=${startStr}&end=${endStr}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data);
                }
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            }
        };
        fetchAppointments();
    }, [startDate]);

    const changeWeek = (amount: number) => {
        setCurrentDate(addDays(currentDate, amount * 7));
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white rounded-md border shadow-sm">
                        <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="w-[240px] font-normal">
                                    {format(startDate, "d MMMM", { locale: fr })} - {format(addDays(startDate, 6), "d MMMM yyyy", { locale: fr })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={currentDate}
                                    onSelect={(date) => date && setCurrentDate(date)}
                                    locale={fr}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="icon" onClick={() => changeWeek(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto bg-white rounded-lg border shadow-sm flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b">
                    <div className="p-4 border-r bg-gray-50/50"></div>
                    {weekDays.map((day, i) => (
                        <div key={i} className={cn(
                            "p-4 text-center border-r last:border-r-0 font-medium",
                            isSameDay(day, new Date()) ? "bg-primary/5 text-primary" : ""
                        )}>
                            <div className="capitalize text-sm text-muted-foreground">
                                {format(day, "EEE", { locale: fr })}
                            </div>
                            <div className={cn("text-xl mt-1", isSameDay(day, new Date()) && "font-bold")}>
                                {format(day, "d")}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time Grid */}
                <div className="flex-1 overflow-y-auto">
                    {HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 h-20 min-h-[5rem] group">
                            {/* Time Label */}
                            <div className="border-r border-b p-2 text-xs text-muted-foreground text-right sticky left-0 bg-white group-hover:bg-gray-50/50">
                                {hour}:00
                            </div>

                            {/* Days Columns */}
                            {weekDays.map((day, dayIndex) => {
                                // Match appointments for this day and hour
                                const dayAppts = appointments.filter(app => {
                                    const appDate = new Date(app.date); // assuming 'date' is ISO string 'YYYY-MM-DDT...'
                                    const appHour = parseInt(app.startTime.split(':')[0], 10);

                                    // Make sure it matches the day (ignoring time part of day variable which is 00:00)
                                    const sameDay = format(appDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');

                                    return sameDay && appHour === hour;
                                });

                                return (
                                    <div key={dayIndex} className="border-r border-b relative p-1 transition-colors hover:bg-gray-50">
                                        {dayAppts.map(app => (
                                            <div key={app.id} className={cn(
                                                "absolute left-1 right-1 p-2 rounded-md text-xs font-medium border shadow-sm cursor-pointer hover:brightness-95 transition-all z-10",
                                                app.locationType === "DOMICILE" ? "bg-blue-100 border-blue-200 text-blue-700" : "bg-green-100 border-green-200 text-green-700"
                                            )}
                                                style={{ top: "2px", height: "calc(100% - 5px)" }} // Keeping fixed height for MVP
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="truncate">{app.services[0]?.name || "Service"}</span>
                                                    {app.locationType === "DOMICILE" && <MapPin className="h-3 w-3" />}
                                                </div>
                                                <div className="font-bold mt-1 truncate">{app.client?.firstName} {app.client?.lastName}</div>
                                            </div>
                                        ))}

                                        {/* Empty Slot Click Area (Could link to manual creation later) */}
                                        <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center pointer-events-none">

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
