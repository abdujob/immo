import { getPropertyById, getProperties } from "@/lib/api";
import { notFound } from "next/navigation";
import PropertyDetailClient from "./PropertyDetailClient";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
    // Fetch property data from API
    const property = await getPropertyById(params.id);

    if (!property) {
        notFound();
    }

    // Fetch similar properties (same city and type)
    const allProperties = await getProperties();
    const similarProperties = allProperties
        .filter(p =>
            p.id !== property.id &&
            p.city === property.city &&
            p.type === property.type
        )
        .slice(0, 3);

    return <PropertyDetailClient property={property} similarProperties={similarProperties} />;
}
