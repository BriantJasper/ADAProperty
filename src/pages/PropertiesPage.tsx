import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import PropertyCard from "../components/PropertyCard";
import Dropdown from "../components/Dropdown";
import Container from "../components/Container";
import { motion, AnimatePresence } from "framer-motion";

import { Search, SlidersHorizontal, Home, Building2, X } from "lucide-react";

const PropertiesPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeSub, setActiveSub] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPriceDisplay, setMinPriceDisplay] = useState<string>("");
  const [maxPriceDisplay, setMaxPriceDisplay] = useState<string>("");

  const location = state.selectedLocation;

  // Generate unique locations from property data, always include 'Semua Lokasi' at the top
  const locations = useMemo(() => {
    const locSet = new Set<string>(
      state.properties.map((p) => p.location).filter(Boolean)
    );
    return ["Semua Lokasi", ...Array.from(locSet).sort()];
  }, [state.properties]);

  // Handler for formatting min price
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const digitsOnly = raw.replace(/\D+/g, "");
    setMinPrice(digitsOnly);
    setMinPriceDisplay(
      digitsOnly ? `Rp ${Number(digitsOnly).toLocaleString("id-ID")}` : ""
    );
  };

  // Handler for formatting max price
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const digitsOnly = raw.replace(/\D+/g, "");
    setMaxPrice(digitsOnly);
    setMaxPriceDisplay(
      digitsOnly ? `Rp ${Number(digitsOnly).toLocaleString("id-ID")}` : ""
    );
  };

  // Mendukung harga bertipe number (dari backend) maupun string (contoh data lama)
  const parsePriceToNumber = (price: string | number): number => {
    if (typeof price === "number") {
      return price;
    }
    const clean = price.replace(/\s+/g, " ").toLowerCase();
    const matchRange = clean.match(/([\d.,]+)\s*-\s*([\d.,]+)/);
    const matchSingle = clean.match(/([\d.,]+)/);
    let base = 0;
    if (matchRange) {
      base = parseFloat(matchRange[1].replace(",", "."));
    } else if (matchSingle) {
      base = parseFloat(matchSingle[1].replace(",", "."));
    }
    if (clean.includes("miliar")) base = base * 1_000_000_000;
    else base = base * 1_000_000;
    return base;
  };

  const { subLocations, filteredByLocation } = useMemo(() => {
    const list = state.properties.filter((p) => {
      if (!location || location === "Semua Lokasi") return true;
      return p.location && p.location.toLowerCase() === location.toLowerCase();
    });
    const subs = Array.from(
      new Set(list.map((p) => p.location.split(",")[0].trim()).filter(Boolean))
    );
    return { subLocations: subs, filteredByLocation: list };
  }, [state.properties, location]);

  const finalList = useMemo(() => {
    let list = filteredByLocation;

    if (searchQuery) {
      list = list.filter(
        (p) =>
          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeSub) list = list.filter((p) => p.location.startsWith(activeSub));
    if (statusFilter)
      list = list.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    if (typeFilter)
      list = list.filter(
        (p) => p.type?.toLowerCase() === typeFilter.toLowerCase()
      );

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined && !Number.isNaN(min)) {
      list = list.filter((p) => parsePriceToNumber(p.price) >= min);
    }
    if (max !== undefined && !Number.isNaN(max)) {
      list = list.filter((p) => parsePriceToNumber(p.price) <= max);
    }
    return list;
  }, [
    filteredByLocation,
    activeSub,
    statusFilter,
    typeFilter,
    minPrice,
    maxPrice,
    searchQuery,
  ]);

  const activeFiltersCount = [
    statusFilter,
    typeFilter,
    minPrice,
    maxPrice,
    activeSub,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setMinPrice("");
    setMaxPrice("");
    setMinPriceDisplay("");
    setMaxPriceDisplay("");
    setActiveSub("");
    setSearchQuery("");
  };

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "Dijual", label: "Dijual" },
    { value: "Disewa", label: "Disewa" },
  ];

  // Dynamically generate type options from actual property types
  const typeOptions = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(state.properties.map((p) => p.type).filter(Boolean))
    ).sort();

    return [
      { value: "", label: "Semua Tipe" },
      ...uniqueTypes.map((type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      })),
    ];
  }, [state.properties]);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section - Similar to Home Page */}
      <section
        className="relative pt-20 md:pt-28"
        style={{ minHeight: "100vh" }}
      >
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
                Jelajahi Properti Pilihan
                <br />
                {location && location !== "Semua Lokasi"
                  ? `di ${location}`
                  : "di Seluruh Area"}
              </h1>

              <p className="text-white text-lg md:text-xl mb-8 drop-shadow-md max-w-3xl mx-auto">
                Temukan properti impian Anda dengan filter pencarian yang
                lengkap
                <br />
                dan mudah digunakan
              </p>

              {/* Location Dropdown */}
              <div className="max-w-md mx-auto mb-6">
                <Dropdown
                  options={locations}
                  selected={location}
                  onSelect={(value) =>
                    dispatch({
                      type: "SET_SELECTED_LOCATION",
                      payload: value,
                    })
                  }
                />
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-6">
                <div className="relative ">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan lokasi, tipe, atau status..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 backdrop-blur-md text-gray-800 placeholder-gray-400 shadow-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Filter Panel - Always Open */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-5xl mx-auto">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <SlidersHorizontal className="w-5 h-5" />
                      <span className="text-lg">Filter Properti</span>
                      {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold">
                          {activeFiltersCount}
                        </span>
                      )}
                    </div>

                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white transition-all font-medium"
                      >
                        <X className="w-4 h-4" />
                        <span>Hapus Filter</span>
                      </button>
                    )}
                  </div>

                  <div className="text-white/90 text-sm font-medium bg-white/10 px-4 py-2 rounded-lg">
                    {finalList.length} properti
                  </div>
                </div>

                {/* Filters - Always Visible */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/90 mb-2 font-medium">
                      <Home className="w-4 h-4" />
                      Status
                    </label>
                    <Dropdown
                      options={statusOptions}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="Pilih Status"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/90 mb-2 font-medium">
                      <Building2 className="w-4 h-4" />
                      Tipe
                    </label>
                    <Dropdown
                      options={typeOptions}
                      value={typeFilter}
                      onChange={setTypeFilter}
                      placeholder="Pilih Tipe"
                    />
                  </div>

                  {/* Price Min */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/90 mb-2 font-medium">
                      Harga Min (Rp)
                    </label>
                    <input
                      type="text"
                      value={minPriceDisplay}
                      onChange={handleMinPriceChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      placeholder="Rp 300.000.000"
                    />
                  </div>

                  {/* Price Max */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/90 mb-2 font-medium">
                      Harga Max (Rp)
                    </label>
                    <input
                      type="text"
                      value={maxPriceDisplay}
                      onChange={handleMaxPriceChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      placeholder="Rp 2.000.000.000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* Sub-location Pills */}
      {subLocations.length > 0 && (
        <div className="bg-white py-8 shadow-md">
          <Container>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setActiveSub("")}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  activeSub === ""
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua Sub-Lokasi
              </button>
              {subLocations.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSub(sub)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 ${
                    activeSub === sub
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Properties Grid */}
      <section className="relative py-20 bg-gray-50">
        <Container className="px-8 md:px-16 lg:px-24">
          {finalList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tidak ada properti ditemukan
              </h3>
              <p className="text-gray-600 mb-4">
                Coba sesuaikan filter pencarian Anda
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <AnimatePresence>
                {finalList.map((property) => (
                  <motion.div
                    key={`property-list-${property.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PropertyCard
                      key={`property-card-list-${property.id}`}
                      property={property}
                      showAdminControls={false}
                      showComparisonButton={true}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default PropertiesPage;
