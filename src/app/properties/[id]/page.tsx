import { getPropertyById, getSimilarProperties } from "@/lib/api";
import { notFound } from "next/navigation";
import PropertyDetailClient from "./PropertyDetailClient";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
    // Fetch property data from API
    const property = await getPropertyById(params.id);

    if (!property) {
        notFound();
    }

    // Fetch similar properties from the dedicated backend endpoint
    const similarProperties = await getSimilarProperties(property!.id, 3);

    return <PropertyDetailClient property={property!} similarProperties={similarProperties} />;
}
