// src/sections/PopularSection.tsx
import PropertyCard from "../components/PropertyCard";

export default function PopularSection() {
  const properties = [
    {
      type: "Rumah",
      status: "Dijual",
      price: "300 - 400 Juta",
      landArea: "150m²",
      buildingArea: "130m²",
      bedrooms: 2,
      bathrooms: 2,
      garage: false,
      location: "Jababeka, Cikarang",
      colorType: "bg-green-600",
      colorStatus: "bg-blue-800",
      imageUrl: "../images/p1.png",
    },
    {
      type: "Apartemen",
      status: "Dijual",
      price: "1 - 2 Miliar",
      landArea: "150m²",
      buildingArea: "130m²",
      bedrooms: 2,
      bathrooms: 1,
      garage: false,
      location: "Lippo, Cikarang",
      colorType: "bg-purple-700",
      colorStatus: "bg-blue-800",
      imageUrl: "../images/p2.png",
    },
    {
      type: "Apartemen",
      status: "Disewa",
      price: "35 Juta / bulan",
      landArea: "150m²",
      buildingArea: "245m²",
      bedrooms: 2,
      bathrooms: 2,
      garage: false,
      location: "Deltamas, Cikarang",
      colorType: "bg-purple-700",
      colorStatus: "bg-red-700",
      imageUrl: "../images/p3.png",
    },
    {
      type: "Apartemen",
      status: "Disewa",
      price: "35 Juta / bulan",
      landArea: "150m²",
      buildingArea: "245m²",
      bedrooms: 2,
      bathrooms: 2,
      garage: false,
      location: "Deltamas, Cikarang",
      colorType: "bg-purple-700",
      colorStatus: "bg-red-700",
      imageUrl: "../images/p3.png",
    },
    {
      type: "Apartemen",
      status: "Dijual",
      price: "1 - 2 Miliar",
      landArea: "150m²",
      buildingArea: "130m²",
      bedrooms: 2,
      bathrooms: 1,
      garage: false,
      location: "Lippo, Cikarang",
      colorType: "bg-purple-700",
      colorStatus: "bg-blue-800",
      imageUrl: "../images/p2.png",
    },
    {
      type: "Rumah",
      status: "Dijual",
      price: "300 - 400 Juta",
      landArea: "150m²",
      buildingArea: "130m²",
      bedrooms: 2,
      bathrooms: 2,
      garage: false,
      location: "Jababeka, Cikarang",
      colorType: "bg-green-600",
      colorStatus: "bg-blue-800",
      imageUrl: "../images/p1.png",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Pilihan Populer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <PropertyCard key={index} {...property} />
          ))}
        </div>
      </div>
    </section>
  );
}
