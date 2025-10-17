import { useState, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import PopularSection from "../components/PopularSection";
import Container from "../components/Container";
import { useApp } from "../context/AppContext";
import type { Property } from "../types/Property";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const { dispatch, state } = useApp();
  const locations = ["Cikarang", "Bekasi", "Jakarta", "Karawang", "Bandung"];

  // Initialize with sample data if no properties exist
  useEffect(() => {
    const sampleProperties: Property[] = [
      {
        id: "1",
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
        imageUrl: "/images/p1.png",
        phoneNumber: "6281234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
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
        imageUrl: "/images/p2.png",
        phoneNumber: "6281234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
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
        imageUrl: "/images/p3.png",
        phoneNumber: "6281234567890",
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

        <div className="relative z-10 h-full flex items-center justify-center px-4">
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
                Kami membantu anda menemukan rumah idaman, apartemen nyaman, atau
                <br />
                investasi yang pas - cepat, mudah, dan terpercaya!
              </p>

              <div className="max-w-md mx-auto">
                <Dropdown
                  label="Pilih Lokasi"
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
