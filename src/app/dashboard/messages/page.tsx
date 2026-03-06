"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Phone, Mail, Building2, CheckCircle, Clock, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
    }, [tab]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/contacts/${tab}`, {
                credentials: 'include'
});
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch {
            toast({ title: "Erreur", description: "Impossible de charger les messages.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`${API_URL}/contacts/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ status })
});
            if (res.ok) {
                setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
                toast({ title: "Statut mis à jour" });
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
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {(['received', 'sent'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t === 'received' ? 'Reçus' : 'Envoyés'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                </div>
            ) : contacts.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">Aucun message {tab === 'received' ? 'reçu' : 'envoyé'} pour le moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contacts.map((contact) => (
                        <Card key={contact.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Contact info */}
                                        {tab === 'received' && contact.sender && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                                                    {contact.sender.firstName[0]}{contact.sender.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {contact.sender.firstName} {contact.sender.lastName}
                                                    </p>
                                                    <div className="flex gap-3 text-xs text-gray-500">
                                                        <a href={`mailto:${contact.sender.email}`} className="flex items-center gap-1 hover:text-blue-600">
                                                            <Mail className="w-3 h-3" />{contact.sender.email}
                                                        </a>
                                                        {contact.sender.phone && (
                                                            <a href={`tel:${contact.sender.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                                                                <Phone className="w-3 h-3" />{contact.sender.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Property */}
                                        <Link
                                            href={`/properties/${contact.property.id}`}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-3"
                                        >
                                            <Building2 className="w-4 h-4" />
                                            <span className="font-medium truncate">{contact.property.title}</span>
                                            <span className="text-gray-400">— {contact.property.city}</span>
                                        </Link>

                                        {/* Message */}
                                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
                                            {contact.message}
                                        </p>

                                        {contact.phone && (
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {contact.phone}
                                            </p>
                                        )}

                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(contact.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    {/* Status + Actions */}
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <Badge className={`${STATUS_COLORS[contact.status] ?? 'bg-gray-100 text-gray-600'} text-xs`}>
                                            {STATUS_LABELS[contact.status] ?? contact.status}
                                        </Badge>

                                        {tab === 'received' && contact.status !== 'REPLIED' && contact.status !== 'CLOSED' && (
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    disabled={updatingId === contact.id}
                                                    onClick={() => updateStatus(contact.id, 'REPLIED')}
                                                >
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Répondu
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 text-xs text-gray-400"
                                                    disabled={updatingId === contact.id}
                                                    onClick={() => updateStatus(contact.id, 'CLOSED')}
                                                >
                                                    <X className="w-3 h-3" />
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
