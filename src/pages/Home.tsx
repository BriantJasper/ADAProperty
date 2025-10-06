import { useState } from "react";
import heroBg from "../../public/images/hero-bg.png";
import Dropdown from "../components/Dropdown";
import PopularSection from "../components/PopularSection";
import Container from "../components/Container";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const locations = ["Cikarang", "Bekasi", "Jakarta", "Karawang", "Bandung"];

  return (
    <div className="relative min-h-screen">
      <section className="relative" style={{ height: "100vh" }}>
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <img
                  src="../images/logo.png"
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
                Kami membantu Anda menemukan rumah, apartemen, dan properti
                <br />
                terbaik sesuai kebutuhan dan budget
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
