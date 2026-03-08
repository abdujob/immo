"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2, MessageSquare, Phone, Mail, Building2,
    Send, User, ArrowLeft, MoreVertical, Search,
    Clock, CheckCheck
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { getConversations, getThreadMessages, sendContact, formatPrice } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

type UserBasic = {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
};

type Conversation = {
    id: string;
    otherUser: UserBasic;
    property: { id: string; title: string; city: string };
    lastMessage: {
        id: string;
        message: string;
        createdAt: string;
        senderId: string;
        status: string;
    };
    unreadCount: number;
};

type Message = {
    id: string;
    message: string;
    senderId: string;
    createdAt: string;
    status: string;
    sender: UserBasic;
};

export default function MessagesPage() {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const searchParams = useSearchParams();
    const targetPropertyId = searchParams.get('propertyId');
    const targetUserId = searchParams.get('senderId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeThread, setActiveThread] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) fetchConversations();
    }, [user, targetPropertyId, targetUserId]);

    useEffect(() => {
        if (activeThread) {
            fetchMessages(activeThread);
        }
    }, [activeThread]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const data = await getConversations();
            setConversations(data);

            // Auto-select conversation based on query params
            if (targetPropertyId && targetUserId) {
                const thread = data.find((c: Conversation) =>
                    c.property.id === targetPropertyId && c.otherUser.id === targetUserId
                );
                if (thread) {
                    setActiveThread(thread);
                }
            }
        } catch {
            toast({ title: "Erreur", description: "Impossible de charger les conversations.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conv: Conversation) => {
        setMessagesLoading(true);
        try {
            const data = await getThreadMessages(conv.otherUser.id, conv.property.id);
            setMessages(data);
            // Optionally update unread count locally
            setConversations(prev => prev.map(c =>
                c.id === conv.id ? { ...c, unreadCount: 0 } : c
            ));
        } catch {
            toast({ title: "Erreur", description: "Impossible de charger les messages.", variant: "destructive" });
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !activeThread || !user) return;

        setSending(true);
        try {
            const success = await sendContact(
                activeThread.property.id,
                reply,
                undefined,
                activeThread.lastMessage.id
            );

            if (success) {
                setReply("");
                // Refresh messages
                fetchMessages(activeThread);
                // Refresh conversations list (to update last message)
                const convs = await getConversations();
                setConversations(convs);
            } else {
                throw new Error();
            }
        } catch {
            toast({ title: "Erreur", description: "Impossible d'envoyer le message.", variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.otherUser.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.otherUser.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.property.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || (loading && !conversations.length)) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h1 className="text-2xl font-bold font-display">Mes Discussions</h1>
                <Badge variant="outline" className="font-semibold px-3 py-1 bg-primary/5 text-primary">
                    {conversations.length} Conversation{conversations.length > 1 ? 's' : ''}
                </Badge>
            </div>

            <Card className="flex-1 overflow-hidden border-none shadow-xl flex bg-white rounded-2xl">
                {/* Sidebar */}
                <div className={`w-full md:w-80 border-r flex flex-col bg-gray-50/50 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 bg-white border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9 bg-gray-100 border-none h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y divide-gray-100">
                            {filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Aucune discussion</p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setActiveThread(conv)}
                                        className={`w-full p-4 flex gap-3 text-left transition-all hover:bg-white relative ${activeThread?.id === conv.id ? 'bg-white shadow-[inset_4px_0_0_0_#2563eb]' : ''}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary border-2 border-white shadow-sm">
                                            {conv.otherUser.avatar ? (
                                                <img src={conv.otherUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                `${conv.otherUser.firstName[0]}${conv.otherUser.lastName[0]}`
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-sm truncate text-gray-900">
                                                    {conv.otherUser.firstName} {conv.otherUser.lastName}
                                                </h3>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {new Date(conv.lastMessage.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-primary truncate mb-1 bg-primary/5 px-2 py-0.5 rounded-md inline-block max-w-full">
                                                {conv.property.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.lastMessage.senderId === user?.id ? 'Moi: ' : ''}{conv.lastMessage.message}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <Badge className="absolute right-4 bottom-4 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary">
                                                {conv.unreadCount}
                                            </Badge>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`flex-1 flex flex-col bg-white relative ${!activeThread ? 'hidden md:flex items-center justify-center bg-gray-50' : 'flex'}`}>
                    {activeThread ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center justify-between bg-white z-10 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                        onClick={() => setActiveThread(null)}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                                        {activeThread.otherUser.firstName[0]}{activeThread.otherUser.lastName[0]}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base leading-tight">
                                            {activeThread.otherUser.firstName} {activeThread.otherUser.lastName}
                                        </h2>
                                        <Link
                                            href={`/properties/${activeThread.property.id}`}
                                            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                                        >
                                            <Building2 className="w-3 h-3" />
                                            {activeThread.property.title}
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-9 w-9">
                                        <Phone className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-9 w-9">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages History */}
                            <div
                                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
                                ref={scrollRef}
                            >
                                {messagesLoading ? (
                                    <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-primary" /></div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.senderId === user?.id;
                                        const isLastFromSender = i === messages.length - 1 || messages[i + 1].senderId !== msg.senderId;
                                        const showDate = i === 0 || new Date(messages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                                        return (
                                            <div key={msg.id} className="space-y-4">
                                                {showDate && (
                                                    <div className="flex justify-center my-4">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 bg-gray-100 px-3 py-1 rounded-full">
                                                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        {!isMe && isLastFromSender && (
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] flex-shrink-0 self-end mb-1">
                                                                {msg.sender.firstName[0]}{msg.sender.lastName[0]}
                                                            </div>
                                                        )}
                                                        <div className={!isMe && !isLastFromSender ? 'ml-10' : ''}>
                                                            <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${isMe
                                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                                : 'bg-white border text-gray-800 rounded-tl-none'
                                                                }`}>
                                                                {msg.message}
                                                                <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                                    {isMe && <CheckCheck className="w-3 h-3" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Reply Input */}
                            <div className="p-4 border-t bg-gray-50/50">
                                <form onSubmit={handleSend} className="flex gap-2 bg-white p-1 rounded-2xl shadow-sm border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <Input
                                        placeholder="Écrivez votre message..."
                                        className="flex-1 border-none bg-transparent focus-visible:ring-0 h-10 px-4"
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        disabled={sending}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={sending || !reply.trim()}
                                        className="rounded-xl px-5 transition-all shadow-md active:scale-95"
                                    >
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-12">
                            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-10 h-10 text-primary/20" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Sélectionnez une discussion</h2>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Choisissez une conversation dans la liste de gauche pour voir les messages.
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
