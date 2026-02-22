import { Hero } from "@/components/home/Hero";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { getFeaturedProperties } from "@/lib/api";

export default async function Home() {
  // Fetch featured properties from the backend
  const properties = await getFeaturedProperties();

  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProperties properties={properties} />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Annonces actives</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Agences partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15K+</div>
              <div className="text-gray-600">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10</div>
              <div className="text-gray-600">Villes couvertes</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
