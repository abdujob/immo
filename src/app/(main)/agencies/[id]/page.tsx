import { getAgencyById } from "@/lib/api";
import { notFound } from "next/navigation";
import AgencyDetailClient from "./AgencyDetailClient";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const agency = await getAgencyById(params.id);
    if (!agency) return { title: 'Agence non trouvée' };

    return {
        title: `${agency.name} | ImmoSénégal`,
        description: agency.description || `Découvrez les annonces immobilières de ${agency.name}`,
    };
}

export default async function AgencyPage({ params }: { params: { id: string } }) {
    const agency = await getAgencyById(params.id);

    if (!agency) {
        notFound();
    }

    return <AgencyDetailClient agency={agency} />;
}
