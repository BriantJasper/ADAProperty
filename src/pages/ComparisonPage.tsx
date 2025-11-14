import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { IoArrowBack, IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Scale } from "lucide-react";
import type { Property } from "../types/Property";
import { FaWhatsapp } from "react-icons/fa";
import PropertyCatalogModal from "../components/PropertyCatalogModal";

const ComparisonPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [catalogProperty, setCatalogProperty] = useState<Property | null>(null);
  const [descExpandedMap, setDescExpandedMap] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const closeCatalog = () => setCatalogProperty(null);

  const handleRemoveProperty = (propertyId: string) => {
    dispatch({ type: "REMOVE_FROM_COMPARISON", payload: propertyId });
  };

  const comparisonProperties = state.comparisonCart.map(
    (item) => item.property
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-xl p-2.5"
              >
                <IoArrowBack size={22} />
              </button>

              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl">
                  <Scale size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Komparasi Properti
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Analisis detail untuk keputusan terbaik
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-5 py-2.5 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-900">
                  {state.comparisonCart.length} dari 3 Properti
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {comparisonProperties.length === 0 ? (
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center transition-all duration-500 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scale size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">
              Tidak ada properti untuk dibandingkan
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Pilih hingga 3 properti untuk melihat perbandingan detail
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <>
            {/* Comparison Cards */}
            <div
              className={`transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparisonProperties.map((prop) => {
                  const isDescExpanded = !!descExpandedMap[prop.id];
                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                      {/* Image Header */}
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={prop.images?.[0] || "/images/p1.png"}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveProperty(prop.id)}
                          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl transition-all shadow-lg"
                          title="Hapus dari perbandingan"
                        >
                          <IoTrash size={18} />
                        </button>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md pointer-events-none">
                          <p className="text-xs font-semibold text-gray-800">
                            {prop.location}
                          </p>
                        </div>
                      </div>

                      {/* Card Content (ambil dari detail card PropertyCard) */}
                      <div className="p-5">
                        {/* Price */}
                        <h3 className="text-2xl font-bold text-gray-900">
                          Rp {prop.price?.toLocaleString() || "0"}
                        </h3>

                        {/* Harga & DP Section */}
                        <div className="mt-3 space-y-2">
                          <div className="bg-white text-gray-900 rounded-lg px-4 py-2 flex items-center justify-between border border-blue-600">
                            <span className="text-sm font-semibold">Harga</span>
                            <span className="text-sm">
                              Rp {prop.price?.toLocaleString() || "0"}
                            </span>
                          </div>
                          {/* DP sebagai header di bawah Harga */}
                          <div className="bg-white text-gray-900 rounded-lg px-4 py-3 flex items-center justify-between border border-blue-700">
                            <span className="text-base font-semibold">DP</span>
                            <span className="text-lg font-bold text-blue-700">
                              Rp{" "}
                              {Math.round(
                                (prop.price || 0) *
                                  ((prop.financing?.dpPercent ?? 10) / 100)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Detail singkat: tipe, lantai, kamar */}
                        {/* <div className="mt-3 bg-white rounded-lg border border-gray-200 px-4 py-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tipe</span>
                            <span className="font-semibold text-gray-900">
                              {prop.type || "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Lantai</span>
                            <span className="font-semibold text-gray-900">
                              {prop.floors ?? "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Kamar Tidur</span>
                            <span className="font-semibold text-gray-900">
                              {prop.bedrooms}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Kamar Mandi</span>
                            <span className="font-semibold text-gray-900">
                              {prop.bathrooms}
                            </span>
                          </div>
                        </div> */}

                        {/* Deskripsi Properti */}
                        <div className="mt-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
                          <p
                            className={`text-sm text-gray-700 leading-relaxed ${
                              isDescExpanded
                                ? "whitespace-pre-line"
                                : "line-clamp-3 whitespace-normal"
                            }`}
                          >
                            {prop.description || "Tidak ada deskripsi"}
                          </p>
                          {prop.description &&
                            (prop.description.length > 160 ||
                              prop.description.split(/\r?\n/).length > 3) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDescExpandedMap((prev) => ({
                                    ...prev,
                                    [prop.id]: !prev[prop.id],
                                  }))
                                }
                                className="mt-2 text-xs text-blue-600 hover:underline"
                              >
                                {isDescExpanded
                                  ? "Tutup"
                                  : "Lihat selengkapnya"}
                              </button>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => {
                              const adminWhatsApp = (import.meta as any).env
                                ?.VITE_ADMIN_WHATSAPP as string | undefined;
                              const targetNumber =
                                adminWhatsApp || prop.whatsappNumber || "";
                              const normalized =
                                typeof targetNumber === "string"
                                  ? targetNumber.replace(/\D/g, "")
                                  : "";
                              const formattedPrice = prop.price
                                ? prop.price.toLocaleString()
                                : "0";
                              const message = `Halo Admin ADAProperty, saya tertarik dengan properti ${
                                prop.title
                              } di ${prop.location}${
                                prop.subLocation ? ` (${prop.subLocation})` : ""
                              } dengan harga Rp ${formattedPrice}. Apakah masih tersedia?`;
                              const waUrl = normalized
                                ? `https://wa.me/${normalized}?text=${encodeURIComponent(
                                    message
                                  )}`
                                : null;

                              if (waUrl) {
                                window.open(waUrl, "_blank");
                              }
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                          >
                            <FaWhatsapp className="text-lg" />
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {catalogProperty && (
                <PropertyCatalogModal
                  property={catalogProperty}
                  onClose={closeCatalog}
                />
              )}
            </div>
            {/* End Comparison Table */}
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
