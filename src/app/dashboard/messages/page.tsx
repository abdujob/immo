"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Phone, Mail, Building2, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { getContactsReceived, getContactsSent, updateContactStatus } from "@/lib/api";

type Contact = {
    id: string;
    message: string;
    phone?: string;
    status: string;
    createdAt: string;
    sender?: { id: string; firstName: string; lastName: string; email: string; phone?: string };
    property: { id: string; title: string; type: string; price: number; city: string };
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    SEEN: "bg-blue-100 text-blue-700",
    REPLIED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-600"
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: "En attente",
    SEEN: "Vu",
    REPLIED: "Répondu",
    CLOSED: "Fermé"
};

export default function MessagesPage() {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [tab, setTab] = useState<'received' | 'sent'>('received');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) fetchContacts();
    }, [tab, user]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const data = tab === 'received'
                ? await getContactsReceived()
                : await getContactsSent();
            setContacts(data);
        } catch {
            toast({ title: "Erreur", description: "Impossible de charger les messages.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            const success = await updateContactStatus(id, status);
            if (success) {
                setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
                toast({ title: "Statut mis à jour" });
            } else {
                throw new Error();
            }
        } catch {
            toast({ title: "Erreur", variant: "destructive" });
        } finally {
            setUpdatingId(null);
        }
    };

    if (authLoading) {
        return <div className="flex justify-center py-24"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display">Messages</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {(['received', 'sent'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${tab === t
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {t === 'received' ? 'Reçus' : 'Envoyés'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin w-8 h-8 text-primary" />
                </div>
            ) : contacts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="text-center py-16 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">Aucun message {tab === 'received' ? 'reçu' : 'envoyé'} pour le moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contacts.map((contact) => (
                        <Card key={contact.id} className="group hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/10 hover:border-l-primary">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        {/* Contact info */}
                                        {tab === 'received' && contact.sender && (
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {contact.sender.firstName[0]}{contact.sender.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">
                                                        {contact.sender.firstName} {contact.sender.lastName}
                                                    </p>
                                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                                        <a href={`mailto:${contact.sender.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                                            <Mail className="w-3.5 h-3.5" />{contact.sender.email}
                                                        </a>
                                                        {contact.sender.phone && (
                                                            <a href={`tel:${contact.sender.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                                                <Phone className="w-3.5 h-3.5" />{contact.sender.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Property info */}
                                        <Link
                                            href={`/properties/${contact.property.id}`}
                                            className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline mb-4 bg-primary/5 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            <Building2 className="w-4 h-4" />
                                            <span>{contact.property.title}</span>
                                            <span className="text-muted-foreground/60 font-normal">— {contact.property.city}</span>
                                        </Link>

                                        {/* Message Body */}
                                        <div className="text-foreground bg-muted/30 rounded-xl p-4 text-sm leading-relaxed border border-border/50">
                                            {contact.message}
                                        </div>

                                        <div className="flex items-center gap-4 mt-4 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {new Date(contact.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                            {contact.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3" />
                                                    {contact.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        <Badge variant="secondary" className={`${STATUS_COLORS[contact.status] ?? 'bg-muted text-muted-foreground'} border-none px-3 py-1`}>
                                            {STATUS_LABELS[contact.status] ?? contact.status}
                                        </Badge>

                                        {tab === 'received' && contact.status !== 'REPLIED' && contact.status !== 'CLOSED' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                                                    disabled={updatingId === contact.id}
                                                    onClick={() => updateStatus(contact.id, 'REPLIED')}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                    Répondu
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                                                    disabled={updatingId === contact.id}
                                                    onClick={() => updateStatus(contact.id, 'CLOSED')}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

import { Clock } from "lucide-react";
