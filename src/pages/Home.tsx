import { useState, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import PopularSection from "../components/PopularSection";
import Container from "../components/Container";
import { useApp } from "../context/AppContext";
import type { Property } from "../types/Property";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const { dispatch, state } = useApp();
  const locations = [
    "Semua Lokasi",
    "Cikarang",
    "Bekasi",
    "Jakarta",
    "Karawang",
    "Bandung",
  ];

  // Initialize with sample data if no properties exist
  useEffect(() => {
    const sampleProperties: Property[] = [
      {
        id: "1",
        title: "Rumah Modern Jababeka",
        description:
          "Rumah modern dengan fasilitas lengkap di kawasan Jababeka, Cikarang",
        type: "rumah",
        status: "dijual",
        price: 350000000,
        location: "Cikarang",
        subLocation: "Jababeka",
        bedrooms: 2,
        bathrooms: 2,
        area: 130,
        landArea: 150,
        images: ["/images/p1.png"],
        features: ["Garasi", "Halaman", "Dapur Modern"],
        whatsappNumber: "6281234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Apartemen Lippo Cikarang",
        description:
          "Apartemen mewah dengan lokasi strategis di Lippo, Cikarang",
        type: "apartemen",
        status: "dijual",
        price: 1500000000,
        location: "Cikarang",
        subLocation: "Lippo",
        bedrooms: 2,
        bathrooms: 1,
        area: 130,
        landArea: 150,
        images: ["/images/p2.png"],
        features: ["Pool", "Gym", "Security 24 Jam"],
        whatsappNumber: "6281234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        title: "Apartemen Deltamas Cikarang",
        description:
          "Apartemen nyaman dengan harga terjangkau di Deltamas, Cikarang",
        type: "apartemen",
        status: "disewa",
        price: 35000000,
        location: "Cikarang",
        subLocation: "Deltamas",
        bedrooms: 2,
        bathrooms: 2,
        area: 245,
        landArea: 150,
        images: ["/images/p3.png"],
        features: ["Furnished", "AC", "Water Heater"],
        whatsappNumber: "6281234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Only add sample data if no properties exist
    if (state.properties.length === 0) {
      sampleProperties.forEach((property) => {
        dispatch({ type: "ADD_PROPERTY", payload: property });
      });
    }
  }, [dispatch, state.properties.length]);

  // Sync selected location to global context
  useEffect(() => {
    dispatch({ type: "SET_SELECTED_LOCATION", payload: selectedLocation });
  }, [selectedLocation, dispatch]);

  return (
    <div className="relative min-h-screen">
      <section className="relative" style={{ height: "100vh" }}>
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/images/hero-bg.png)` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center px-4 py-12 pt-38">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <img
                  src="/images/logo.png"
                  alt="ADA Property"
                  className="h-32 mx-auto mb-6 drop-shadow-2xl"
                />
              </div>

              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
                Temukan Hunian Impian Anda
                <br />
                Bersama Kami!
              </h1>

              <p className="text-white text-lg md:text-xl mb-8 drop-shadow-md max-w-3xl mx-auto">
                Kami membantu anda menemukan rumah idaman, apartemen nyaman,
                atau
                <br />
                investasi yang pas - cepat, mudah, dan terpercaya!
              </p>

              <div className="max-w-md mx-auto">
                <Dropdown
                  options={locations}
                  selected={selectedLocation}
                  onSelect={setSelectedLocation}
                />
              </div>
            </div>
          </Container>
        </div>
      </section>

      <section className="relative py-20">
        <PopularSection />
      </section>
    </div>
  );
}
