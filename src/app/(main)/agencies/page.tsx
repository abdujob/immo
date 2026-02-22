import { getAgencies } from "@/lib/api";
import { Building2, MapPin, Phone, Mail, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AgenciesPage() {
    const agencies = await getAgencies();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Agences Immobilières
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Découvrez nos agences partenaires certifiées au Sénégal
                    </p>
                </div>

                {/* Agencies Grid */}
                {agencies.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Aucune agence disponible pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agencies.map((agency) => (
                            <Card key={agency.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">{agency.name}</CardTitle>
                                                {agency.verified && (
                                                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Vérifiée</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {agency.description && (
                                        <p className="text-gray-600 text-sm line-clamp-3">
                                            {agency.description}
                                        </p>
                                    )}

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{agency.address}, {agency.city}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <a href={`tel:${agency.phone}`} className="hover:text-blue-600">
                                                {agency.phone}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${agency.email}`} className="hover:text-blue-600">
                                                {agency.email}
                                            </a>
                                        </div>
                                    </div>

                                    {agency.website && (
                                        <Button variant="outline" className="w-full" asChild>
                                            <a href={agency.website} target="_blank" rel="noopener noreferrer">
                                                Visiter le site web
                                            </a>
                                        </Button>
                                    )}

                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                        <Link href={`/properties?agencyId=${agency.id}`}>
                                            Voir les annonces
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
