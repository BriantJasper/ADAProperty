import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { IoArrowBack, IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Scale, TrendingUp, DollarSign, Home, Zap } from "lucide-react";
import type { Property } from "../types/Property";
import { FaWhatsapp } from "react-icons/fa";

interface SectionConfig {
  title: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  accentColor: string;
  bgGradient: string;
  rows: RowConfig[];
}

interface RowConfig {
  label: string;
  key: keyof Property | string;
  formatter?: (value: any) => string | number;
}

const ComparisonPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [depositPercent, setDepositPercent] = useState(10);
  const [cilanTenor, setCilanTenor] = useState(20);
  const [fixedMonths, setFixedMonths] = useState(3);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemoveProperty = (propertyId: string) => {
    dispatch({ type: "REMOVE_FROM_COMPARISON", payload: propertyId });
  };

  const comparisonProperties = state.comparisonCart.map(
    (item) => item.property
  );

  const BOOKING_FEE = 10_000_000;

  // Gunakan nomor WhatsApp admin jika tersedia dari env, fallback ke nomor properti
  const adminWhatsApp = (import.meta as any).env?.VITE_ADMIN_WHATSAPP as string | undefined;

  const sectionConfigs: SectionConfig[] = [
    {
      title: "Harga Properti",
      icon: <DollarSign size={18} />,
      color: "blue",
      borderColor: "border-blue-300",
      accentColor: "bg-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      rows: [
        {
          label: "Harga Pokok",
          key: "price",
          formatter: (value) => `Rp ${value?.toLocaleString() || "0"}`,
        },
        {
          label: "DP %",
          key: "price",
          formatter: (value) =>
            `Rp ${Math.round(
              (value || 0) * (depositPercent / 100)
            ).toLocaleString()}`,
        },
      ],
    },
    {
      title: "Biaya Tambahan",
      icon: <Zap size={18} />,
      color: "amber",
      borderColor: "border-amber-300",
      accentColor: "bg-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      rows: [
        {
          label: "Booking Fee",
          key: "price",
          formatter: () => `Rp ${BOOKING_FEE.toLocaleString()}`,
        },
        {
          label: "Sisa DP",
          key: "price",
          formatter: (value) => {
            const dpAmount = Math.round((value || 0) * (depositPercent / 100));
            const sisaDp = dpAmount - BOOKING_FEE;
            return `Rp ${sisaDp.toLocaleString()}`;
          },
        },
      ],
    },
    {
      title: "Cicilan Bulanan",
      icon: <TrendingUp size={18} />,
      color: "green",
      borderColor: "border-green-300",
      accentColor: "bg-green-600",
      bgGradient: "from-green-50 to-green-100",
      rows: [
        {
          label: "Angsuran",
          key: "price",
          formatter: (value) => {
            const dpAmount = Math.round((value || 0) * (depositPercent / 100));
            const principalAmount = (value || 0) - dpAmount;
            const monthlyInstallment = Math.round(
              principalAmount / (cilanTenor * 12)
            );
            return `Rp ${monthlyInstallment.toLocaleString()} Fix ${fixedMonths} Thn (Tenor ${cilanTenor} Thn)`;
          },
        },
      ],
    },
    {
      title: "Fasilitas",
      icon: <Home size={18} />,
      color: "purple",
      borderColor: "border-purple-300",
      accentColor: "bg-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      rows: [
        {
          label: "Kamar Tidur",
          key: "bedrooms",
          formatter: (value) => value || "-",
        },
        {
          label: "Kamar Mandi",
          key: "bathrooms",
          formatter: (value) => value || "-",
        },
        {
          label: "Luas Bangunan (m²)",
          key: "area",
          formatter: (value) => `${value || "-"} m²`,
        },
        {
          label: "Luas Tanah (m²)",
          key: "landArea",
          formatter: (value) => `${value || "-"} m²`,
        },
      ],
    },
    {
      title: "Spesifikasi Properti",
      icon: <Scale size={18} />,
      color: "indigo",
      borderColor: "border-indigo-300",
      accentColor: "bg-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      rows: [
        {
          label: "Tipe Properti",
          key: "type",
          formatter: (value) => value || "-",
        },
        {
          label: "Status",
          key: "status",
          formatter: (value) =>
            value === "dijual" ? "Dijual" : value === "disewa" ? "Disewa" : "-",
        },
        {
          label: "Lokasi Utama",
          key: "location",
          formatter: (value) => value || "-",
        },
        {
          label: "Sub Lokasi",
          key: "subLocation",
          formatter: (value) => value || "-",
        },
      ],
    },
    {
      title: "Kontak Agen",
      icon: <Zap size={18} />,
      color: "rose",
      borderColor: "border-rose-300",
      accentColor: "bg-rose-600",
      bgGradient: "from-rose-50 to-rose-100",
      rows: [
        {
          label: "Nomor WhatsApp",
          key: "whatsappNumber",
          formatter: (value) => value || "-",
        },
      ],
    },
  ];

  const renderSectionHeader = (config: SectionConfig) => (
    <tr
      className={`border-t-2 ${config.borderColor} bg-gradient-to-r ${config.bgGradient}`}
    >
      <td
        colSpan={comparisonProperties.length + 1}
        className="px-6 py-4 font-semibold text-gray-800 text-sm tracking-wide"
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-6 ${config.accentColor} rounded-full`}></div>
          <span className="text-gray-700">{config.title}</span>
        </div>
      </td>
    </tr>
  );

  const renderDetailRow = (rowConfig: RowConfig) => (
    <tr
      key={rowConfig.label}
      className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
    >
      <td className="px-6 py-3 font-medium text-gray-600 bg-gray-50/50 w-40 text-sm">
        {rowConfig.label}
      </td>
      {comparisonProperties.map((prop) => {
        if (rowConfig.key === "whatsappNumber") {
          const targetNumber = adminWhatsApp || prop.whatsappNumber || "";
          const normalized = typeof targetNumber === "string" ? targetNumber.replace(/\D/g, "") : "";
          const formattedPrice = prop.price ? prop.price.toLocaleString() : "0";
          const message = `Halo Admin ADAProperty, saya tertarik dengan properti ${prop.title} di ${prop.location}${prop.subLocation ? ` (${prop.subLocation})` : ""} dengan harga Rp ${formattedPrice}. Apakah masih tersedia?`;
          const waUrl = normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : null;

          return (
            <td key={prop.id} className="px-6 py-3 text-center text-gray-800 text-sm">
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium">{prop.whatsappNumber || "-"}</span>
                {waUrl && (
                  <button
                    onClick={() => window.open(waUrl, "_blank")}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    title={adminWhatsApp ? "Chat Admin via WhatsApp" : "Chat via WhatsApp"}
                  >
                    <FaWhatsapp className="text-lg" />
                    {adminWhatsApp ? "Chat Admin" : "Chat via WhatsApp"}
                  </button>
                )}
              </div>
            </td>
          );
        }

        return (
          <td
            key={prop.id}
            className="px-6 py-3 text-center text-gray-800 text-sm"
          >
            <span className="font-medium">
              {rowConfig.formatter
                ? rowConfig.formatter(prop[rowConfig.key as keyof Property])
                : (prop[rowConfig.key as keyof Property] as any) || "-"}
            </span>
          </td>
        );
      })}
    </tr>
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
            {/* Control Panel */}
            <div
              className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Parameter Pembiayaan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Deposit Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Persentase DP
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      {depositPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Installment Tenor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Tenor Cicilan (Tahun)
                    </label>
                    <span className="text-lg font-bold text-green-600">
                      {cilanTenor} Thn
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={cilanTenor}
                    onChange={(e) => setCilanTenor(Number(e.target.value))}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>5 Thn</span>
                    <span>30 Thn</span>
                  </div>
                </div>

                {/* Fixed Months */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Bunga Fix (Tahun)
                    </label>
                    <span className="text-lg font-bold text-amber-600">
                      {fixedMonths} Thn
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={fixedMonths}
                    onChange={(e) => setFixedMonths(Number(e.target.value))}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 Thn</span>
                    <span>10 Thn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div
              className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Header with Property Images and Info */}
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                      <th className="px-6 py-5 text-left font-bold text-gray-700 bg-slate-50 w-40">
                        Detail
                      </th>
                      {comparisonProperties.map((prop) => (
                        <th
                          key={prop.id}
                          className="px-6 py-5 text-center min-w-72 border-l border-gray-100"
                        >
                          <div className="relative">
                            {/* Property Image */}
                            <div className="mb-5 rounded-2xl overflow-hidden h-48 bg-gray-200 shadow-md">
                              <img
                                src={
                                  prop.images && prop.images.length > 0
                                    ? prop.images[0]
                                    : "/images/p1.png"
                                }
                                alt={prop.title}
                                className="w-full h-full object-cover"
                              />
                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveProperty(prop.id)}
                                className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl transition-all shadow-lg"
                                title="Hapus dari perbandingan"
                              >
                                <IoTrash size={18} />
                              </button>
                            </div>

                            {/* Property Info */}
                            <div className="space-y-3">
                              <h3 className="font-bold text-gray-900 text-base line-clamp-2">
                                {prop.title}
                              </h3>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Tipe:</span>
                                  <span className="font-semibold text-gray-800 capitalize">
                                    {prop.type}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Status:</span>
                                  <span
                                    className={`font-semibold px-3 py-1 rounded-lg text-xs ${
                                      prop.status === "dijual"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {prop.status === "dijual"
                                      ? "Dijual"
                                      : "Disewa"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                                  <span className="text-gray-600">Lokasi:</span>
                                  <span className="font-semibold text-gray-800 text-right">
                                    {prop.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Comparison Details */}
                  <tbody>
                    {sectionConfigs.map((section) => (
                      <React.Fragment key={section.title}>
                        {renderSectionHeader(section)}
                        {section.rows.map((row) => renderDetailRow(row))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
