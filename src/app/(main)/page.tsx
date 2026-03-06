import { Hero } from "@/components/home/Hero";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { RecentProperties } from "@/components/home/RecentProperties";
import { getFeaturedProperties, getRecentProperties, getStats } from "@/lib/api";

export default async function Home() {
  // Fetch real data from backend
  const [featuredProperties, recentProperties, stats] = await Promise.all([
    getFeaturedProperties(),
    getRecentProperties(6),
    getStats()
  ]);

  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProperties properties={featuredProperties} />
      <RecentProperties properties={recentProperties} />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.propertiesCount > 0 ? `${stats.propertiesCount}+` : '0'}
              </div>
              <div className="text-gray-600">Annonces actives</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.agenciesCount > 0 ? `${stats.agenciesCount}+` : '0'}
              </div>
              <div className="text-gray-600">Agences partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.usersCount > 0 ? `${stats.usersCount}+` : '0'}
              </div>
              <div className="text-gray-600">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">14</div>
              <div className="text-gray-600">Régions couvertes</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
