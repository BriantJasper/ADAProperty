import { useApp } from "../context/AppContext";
import PropertyCard from "../components/PropertyCard";

export default function PopularSection() {
  const { state } = useApp();

  // Prioritaskan properti yang ditandai featured oleh admin
  const featured = state.properties.filter((p) => p.isFeatured);
  // Jika tidak ada yang featured, fallback ke filter lokasi seperti sebelumnya
  const filtered =
    featured.length > 0
      ? featured
      : state.selectedLocation && state.selectedLocation !== "Semua Lokasi"
      ? state.properties.filter((p) =>
          p.location
            .toLowerCase()
            .includes(state.selectedLocation.toLowerCase())
        )
      : state.properties;

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">
              ✨ Rekomendasi Terbaik
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Pilihan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Populer
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Properti pilihan dengan lokasi strategis dan harga terbaik
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.slice(0, 6).map((property, index) => (
            <div
              key={property.id}
              className="transform transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PropertyCard
                property={property}
                showAdminControls={false}
                showComparisonButton={true}
                showWhatsAppButton={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
