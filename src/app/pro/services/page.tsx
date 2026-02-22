"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form State
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newDuration, setNewDuration] = useState("");

    const fetchServices = async () => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/auth/login');
        try {
            const res = await fetch('http://localhost:4000/services/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleCreate = async () => {
        if (!newName || !newPrice || !newDuration) return;
        setCreating(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:4000/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName,
                    priceDomicile: parseFloat(newPrice), // Simplification: using domicile price by default
                    priceSalon: parseFloat(newPrice),
                    durationMin: parseInt(newDuration, 10)
                })
            });
            if (res.ok) {
                await fetchServices();
                setIsCreateOpen(false);
                setNewName("");
                setNewPrice("");
                setNewDuration("");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:4000/services/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setServices(services.filter(s => s.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mes Services</h1>
                    <p className="text-muted-foreground">Gérez vos prestations, tarifs et durées.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Ajouter un service
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un service</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom du service</Label>
                                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Coupe Homme" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Prix (€)</Label>
                                    <Input id="price" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="25" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Durée (min)</Label>
                                    <Input id="duration" type="number" value={newDuration} onChange={e => setNewDuration(e.target.value)} placeholder="30" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                            <Button onClick={handleCreate} disabled={creating}>
                                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom du service</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Aucun service pour le moment.
                                </TableCell>
                            </TableRow>
                        ) : services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell>{service.durationMin} min</TableCell>
                                <TableCell>{service.priceDomicile || service.priceSalon} €</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {/* Edit not implemented for brevity yet */}
                                            {/* <DropdownMenuItem>
                                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem> */}
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(service.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
