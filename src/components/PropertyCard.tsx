import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { Property } from "../types/Property";
import {
  IoTrash,
  IoPencil,
  IoLogoInstagram,
  IoLogoTiktok,
  IoCart,
} from "react-icons/io5";
import {
  Home as HomeIcon,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import PropertyCatalogModal from "./PropertyCatalogModal";

interface PropertyCardProps {
  property: Property;
  showAdminControls?: boolean;
  showComparisonButton?: boolean;
  showWhatsAppButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showAdminControls = false,
  showComparisonButton = true,
  showWhatsAppButton = false,
}) => {
  const { state, dispatch, updateProperty, deleteProperty } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(property);
  // Local display state to format price nicely in inline edit form
  const [editPriceDisplay, setEditPriceDisplay] = useState<string>(() => {
    const n = Number(property.price || 0);
    return n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "";
  });
  const [depositPercentage, setDepositPercentage] = useState(
    property.financing?.dpPercent ?? 10
  );
  const [angsuranYears, setAngsuranYears] = useState(
    property.financing?.tenorYears ?? 1
  );
  const [animationKey, setAnimationKey] = useState(0);
  const images =
    property.images && property.images.length > 0
      ? property.images.slice(0, 5)
      : ["/images/p1.png"];
  const [slide, setSlide] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Sync when property financing changes
  useEffect(() => {
    const dp = property.financing?.dpPercent;
    const tenor = property.financing?.tenorYears;
    if (typeof dp === "number") setDepositPercentage(dp);
    if (typeof tenor === "number") setAngsuranYears(tenor);
  }, [property.id, property.financing]);

  // Sync inline edit price display when toggling edit or when price changes
  useEffect(() => {
    const n = Number((isEditing ? editForm.price : property.price) || 0);
    setEditPriceDisplay(n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "");
  }, [isEditing, editForm.price, property.price]);

  const handleEditPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const digitsOnly = raw.replace(/\D+/g, "");
    const num = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    setEditForm({ ...editForm, price: num });
    setEditPriceDisplay(digitsOnly ? `Rp ${num.toLocaleString("id-ID")}` : "");
  };

  const isInComparison = state.comparisonCart.some(
    (item) => item.property.id === property.id
  );
  const canAddToComparison = state.comparisonCart.length < 3 && !isInComparison;

  // Catalog modal state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const hasTourLink = property.tourUrl && property.tourUrl.trim() !== "";

  const handleAddToComparison = () => {
    if (canAddToComparison) {
      setAnimationKey((prev) => prev + 1);
      dispatch({ type: "ADD_TO_COMPARISON", payload: property });
    }
  };

  const handleRemoveFromComparison = () => {
    dispatch({ type: "REMOVE_FROM_COMPARISON", payload: property.id });
  };

  const handleWhatsAppClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const formattedPrice = property.price
      ? property.price.toLocaleString()
      : "0";
    const message = `Halo, saya tertarik dengan properti ${property.title} di ${property.location} dengan harga Rp ${formattedPrice}. Apakah masih tersedia?`;
    const whatsappUrl = `https://wa.me/${
      property.whatsappNumber
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus properti ini?")) {
      try {
        const result = await deleteProperty(property.id);
        if (!result.success) {
          alert(
            "Gagal menghapus properti: " + (result.error || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Gagal menghapus properti");
      }
    }
  };

  const handleSave = async () => {
    try {
      const result = await updateProperty(property.id, {
        ...editForm,
        updatedAt: new Date(),
      });
      if (result.success) {
        setIsEditing(false);
      } else {
        alert(
          "Gagal mengupdate properti: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Gagal mengupdate properti");
    }
  };

  const handleCancel = () => {
    setEditForm(property);
    setIsEditing(false);
  };

  const goToPrevious = () => {
    setSlide((s) => (s - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setSlide((s) => (s + 1) % images.length);
  };

  // Removed unused goToSlide (reserved if dots navigation added)

  const formatText = (text?: string): string => {
    if (!text || typeof text !== "string") return "-";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const formatCurrency = (value?: number): string => {
    const num = typeof value === "number" ? value : 0;
    return num.toLocaleString("id-ID");
  };

  // Removed unused getDescriptionLines helper

  const calculateDeposit = (): number => {
    return Math.round((property.price || 0) * (depositPercentage / 100));
  };

  // KPI Mortgage formula: A = P * [r(1+r)^n] / [(1+r)^n - 1]
  // Adjustable interest rate (annual, in percent)
  const [annualRate, setAnnualRate] = useState(5); // default 7%
  const calculateAngsuran = (): number => {
    const principal = (property.price || 0) - calculateDeposit();
    const totalMonths = angsuranYears * 12;
    const rate = Number(annualRate) / 100;
    const monthlyRate = rate / 12;
    if (principal <= 0 || totalMonths <= 0 || monthlyRate <= 0) return 0;
    const numerator =
      principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
    const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
    return Math.round(numerator / denominator);
  };

  const handleDepositPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
    setDepositPercentage(value);
  };

  const handleAngsuranYearsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setAngsuranYears(value);
  };

  if (isEditing) {
    return (
      <div className="max-w-sm overflow-hidden rounded-lg bg-white shadow-lg font-sans p-4">
        <h3 className="text-lg font-bold mb-4">Edit Properti</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipe
            </label>
            <select
              value={editForm.type}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  type: e.target.value as
                    | "rumah"
                    | "apartemen"
                    | "tanah"
                    | "ruko",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="rumah">Rumah</option>
              <option value="apartemen">Apartemen</option>
              <option value="tanah">Tanah</option>
              <option value="ruko">Ruko</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  status: e.target.value as "dijual" | "disewa",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="dijual">Dijual</option>
              <option value="disewa">Disewa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Harga
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={editPriceDisplay}
              onChange={handleEditPriceChange}
              placeholder="Contoh: Rp 450.000.000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lokasi
            </label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sub Lokasi
            </label>
            <input
              type="text"
              value={editForm.subLocation}
              onChange={(e) =>
                setEditForm({ ...editForm, subLocation: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          {/* KT/KM dipindahkan ke deskripsi; input dihapus sesuai permintaan */}
          {/* LB dipindahkan ke deskripsi; input dihapus */}
          {/* LT dipindahkan ke deskripsi; input dihapus */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nomor WhatsApp
            </label>
            <input
              type="text"
              value={editForm.whatsappNumber}
              onChange={(e) =>
                setEditForm({ ...editForm, whatsappNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              House Tour URL
            </label>
            <input
              type="url"
              value={editForm.tourUrl || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, tourUrl: e.target.value })
              }
              placeholder="https://facebook.com/... atau link lainnya"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Simpan
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="max-w-sm overflow-hidden rounded-lg bg-white shadow-lg font-sans"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <div className="relative">
          {/* Image Slider */}
          <div className="relative h-56 w-full overflow-hidden bg-gray-200">
            {/* Main Image */}
            <img
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              src={images[slide]}
              alt={`${property.type} ${slide + 1}`}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                // Prevent infinite loop if placeholder also fails
                if (img.dataset.fallbackApplied !== "1") {
                  img.src = "/images/p1.png";
                  img.dataset.fallbackApplied = "1";
                }
              }}
            />

            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            {/* Image Counter - Top Right */}
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
              {slide + 1} / {images.length}
            </div>

            {/* Location - Top Center */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md pointer-events-none">
              <p className="text-xs font-semibold text-gray-800">
                {property.location}
              </p>
            </div>

            {/* Badges - Bottom Left */}
            <div className="absolute left-3 bottom-3 flex flex-col xl:flex-row gap-1.5 xl:gap-2 pointer-events-none">
              <div
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ring-1 ring-white/20 w-fit ${
                  property.status === "dijual" ? "bg-blue-600" : "bg-green-600"
                }`}
              >
                {formatText(property.status)}
              </div>
              <div
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ring-1 ring-white/20 w-fit ${
                  property.type === "rumah" ? "bg-green-600" : "bg-purple-600"
                } flex items-center gap-1.5`}
              >
                {property.type === "rumah" ? (
                  <HomeIcon className="w-3.5 h-3.5" />
                ) : (
                  <Building2 className="w-3.5 h-3.5" />
                )}
                <span>{formatText(property.type)}</span>
              </div>
            </div>

            {/* Social Links - Bottom Right */}
            {(property.igUrl || property.tiktokUrl) && (
              <div className="absolute right-3 bottom-16 flex items-center gap-2 pointer-events-auto">
                {property.igUrl && (
                  <a
                    href={property.igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md text-pink-600 hover:text-pink-700"
                    title="Buka Instagram"
                  >
                    <IoLogoInstagram size={14} />
                    <span className="text-xs font-medium">IG</span>
                  </a>
                )}
                {property.tiktokUrl && (
                  <a
                    href={property.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md text-gray-800 hover:text-black"
                    title="Buka TikTok"
                  >
                    <IoLogoTiktok size={14} />
                    <span className="text-xs font-medium">TikTok</span>
                  </a>
                )}
              </div>
            )}

            {/* Overlay deskripsi di foto dihapus sesuai permintaan */}

            {/* Admin Controls */}
            {showAdminControls && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-lg transition-all duration-200 flex items-center gap-1"
                  title="Edit Properti"
                >
                  <IoPencil size={18} />
                  <span className="text-xs font-medium">Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 shadow-lg transition-all duration-200 flex items-center gap-1"
                  title="Hapus Properti"
                >
                  <IoTrash size={18} />
                  <span className="text-xs font-medium">Hapus</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="relative p-5" onClick={(e) => e.stopPropagation()}>
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none select-none z-0">
            <img
              src="/logo.png"
              alt="ADAProperty Logo Watermark"
              className="opacity-10 w-3/4 max-w-xs object-contain"
              draggable="false"
            />
          </div>
          {/* Price */}
          <h3 className="text-2xl font-bold text-gray-900 relative z-10">
            Rp {formatCurrency(property.price)}
          </h3>

          {/* DP Section with Percentage Input */}
          <div className="mt-3 space-y-2">
            {/* DP Percentage Input */}
            <div className="bg-white text-gray-900 rounded-lg px-4 py-3 border border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <label className="text-base font-semibold">DP</label>
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={depositPercentage}
                    onChange={handleDepositPercentageChange}
                    onFocus={(e) => e.target.select()}
                    className="w-16 px-2 py-1 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 font-semibold border-l border-gray-300">
                    %
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Jumlah DP</span>
                <span className="text-lg font-bold text-blue-700">
                  Rp {formatCurrency(calculateDeposit())}
                </span>
              </div>
            </div>

            {/* Angsuran Input */}
            <div className="bg-white text-gray-900 rounded-lg px-4 py-3 border border-blue-700">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold">Angsuran</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      type="number"
                      min="1"
                      value={angsuranYears}
                      onChange={handleAngsuranYearsChange}
                      onFocus={(e) => e.target.select()}
                      className="w-16 px-2 py-1 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 font-semibold border-l border-gray-300">
                      Tahun
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Bunga (%)
                  </label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className="w-16 px-2 py-1 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 font-semibold border-l border-gray-300">
                      %/thn
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Per Bulan</span>
                <span className="text-lg font-bold text-blue-700">
                  Rp {formatCurrency(calculateAngsuran())}
                </span>
              </div>
            </div>
          </div>

          {/* Detail singkat: tipe, lantai, kamar */}
          <div className="mt-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
            <p
              className={`text-sm text-gray-700 leading-relaxed ${
                isDescExpanded
                  ? "whitespace-pre-line"
                  : "line-clamp-3 whitespace-normal"
              }`}
            >
              {property.description || "Tidak ada deskripsi"}
            </p>
            {property.description &&
              (property.description.length > 160 ||
                property.description.split(/\r?\n/).length > 3) && (
                <button
                  type="button"
                  onClick={() => setIsDescExpanded((v) => !v)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  {isDescExpanded ? "Tutup" : "Lihat selengkapnya"}
                </button>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {hasTourLink ? (
              <a
                href={property.tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                House Tour
              </a>
            ) : (
              <button
                disabled
                className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-gray-400 px-4 py-2 text-white cursor-not-allowed"
              >
                House Tour
              </button>
            )}
            {showWhatsAppButton && (
              <button
                onClick={handleWhatsAppClick}
                className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                WhatsApp
              </button>
            )}
            {showComparisonButton && (
              <>
                {isInComparison ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromComparison();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                    title="Hapus dari perbandingan"
                  >
                    <IoCart size={20} />
                  </button>
                ) : (
                  <motion.button
                    key={animationKey}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToComparison();
                    }}
                    disabled={!canAddToComparison}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.15, 0.95, 1.05, 1] }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                      canAddToComparison
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                    title="Tambah ke perbandingan"
                  >
                    <IoCart size={20} />
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
      {isCatalogOpen && (
        <PropertyCatalogModal
          property={property}
          onClose={() => setIsCatalogOpen(false)}
        />
      )}
    </>
  );
};

export default PropertyCard;
