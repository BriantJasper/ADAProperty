import React, { useState, useEffect, useRef } from "react";
import "./PropertyCard.landscape.css";
import "./PropertyCard.icons.landscape.css";
import { useApp } from "../context/AppContext";
import type { Property } from "../types/Property";
import toast from "react-hot-toast";
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
  Bed,
  Bath,
  Car,
  X,
} from "lucide-react";

// Custom Stairs icon (lucide currently lacks a dedicated stairs glyph)
const StairsIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 16,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M6 18v-3h4v-3h4v-3h4V6" />
  </svg>
);
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import PropertyCatalogModal from "./PropertyCatalogModal";
import ConfirmDialog from "./ConfirmDialog";

interface PropertyCardProps {
  property: Property;
  showAdminControls?: boolean;
  showComparisonButton?: boolean;
  showWhatsAppButton?: boolean;
  showRemoveFromComparisonButton?: boolean;
  onEdit?: (property: Property) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showAdminControls = false,
  showComparisonButton = true,
  showWhatsAppButton = false,
  showRemoveFromComparisonButton = false,
  onEdit,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const {
    state,
    dispatch,
    updateProperty,
    deleteProperty,
    addProperty,
    loadProperties,
  } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(property);
  // Local display state to format price nicely in inline edit form
  const [editPriceDisplay, setEditPriceDisplay] = useState<string>(() => {
    const n = Number(property.price || 0);
    return n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "";
  });

  // Get default DP (all property types default to 5%)
  const getDefaultDPPercentage = (): number => 5;

  const [depositPercentage, setDepositPercentage] = useState(
    property.financing?.dpPercent ?? getDefaultDPPercentage()
  );
  const [angsuranYears, setAngsuranYears] = useState(
    property.financing?.tenorYears ?? 1
  );
  const [annualRate, setAnnualRate] = useState(
    property.financing?.interestRate ?? 5
  );
  const [animationKey, setAnimationKey] = useState(0);
  const images =
    property.images && property.images.length > 0
      ? property.images.slice(0, 5)
      : ["/images/p1.png"];
  const [slide, setSlide] = useState(0);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const openOverlay = () => setIsOverlayOpen(true);
  const closeOverlay = () => setIsOverlayOpen(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{
    left: number;
    top: number;
    width: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
  });

  // Use property.garage if available, otherwise fallback to derived count
  const garageCount =
    typeof property.garage === "number"
      ? property.garage
      : (() => {
        if (typeof property.garage === "boolean")
          return property.garage ? 1 : 0;
        const features = Array.isArray(property.features)
          ? property.features
          : [];
        return features.some((f) => /garasi|carport|parkir/i.test(String(f)))
          ? 1
          : 0;
      })();

  // Clean description: strip HTML and then remove leading LB/LT etc.
  const cleanedDescription = React.useMemo(() => {
    let desc = property.description || "";

    // Helper to strip HTML tags but preserve line breaks
    const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };

    // If it looks like HTML, strip it
    if (/<[a-z][\s\S]*>/i.test(desc)) {
      desc = stripHtml(desc);
    }

    // Remove leading metadata lines containing abbreviations
    desc = desc.replace(/^(?:.*?(?:KT|KM|LB|LT)[^\n]*\n)+/gi, "").trim();
    // Remove inline LB/LT patterns
    desc = desc.replace(/\b(?:LB|LT)\s*\d+\s*m²?,?\s*/gi, "");

    return desc.trim();
  }, [property.description]);

  // Sync when property financing changes
  useEffect(() => {
    const dp = property.financing?.dpPercent;
    const tenor = property.financing?.tenorYears;
    const rate = property.financing?.interestRate;
    if (typeof dp === "number") setDepositPercentage(dp);
    if (typeof tenor === "number") setAngsuranYears(tenor);
    if (typeof rate === "number") setAnnualRate(rate);
  }, [property.id, property.financing]);

  // Position overlay when expanded
  useEffect(() => {
    if (!isDescExpanded) return;
    const update = () => {
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setOverlayPos({
        left: r.left + window.scrollX,
        top: r.bottom + window.scrollY,
        width: r.width,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [isDescExpanded]);

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
  const isForSale = (property.status || "").toLowerCase() === "dijual";

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
    const whatsappUrl = `https://wa.me/${property.whatsappNumber
      }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      // Store the property data before deletion for undo functionality
      const deletedProperty = { ...property };

      const result = await deleteProperty(property.id);
      if (result.success) {
        // Show toast with undo button
        toast.success(
          (t) => (
            <div className="flex items-center gap-3">
              <span>Properti berhasil dihapus</span>
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    // Re-add the property using the stored data
                    // Remove id, createdAt, updatedAt fields as they will be generated by the backend
                    const {
                      id,
                      createdAt,
                      updatedAt,
                      ...propertyDataForCreation
                    } = deletedProperty;

                    const result = await addProperty(propertyDataForCreation);

                    if (result.success) {
                      toast.success("Properti berhasil dikembalikan");
                      // Refresh the property list to ensure UI is in sync
                      await loadProperties();
                    } else {
                      toast.error("Gagal mengembalikan properti");
                    }
                  } catch (error) {
                    console.error("Error restoring property:", error);
                    toast.error("Gagal mengembalikan properti");
                  }
                }}
                className="px-3 py-1 bg-white text-blue-600 rounded hover:bg-blue-50 font-semibold text-sm transition-colors"
              >
                Undo
              </button>
            </div>
          ),
          {
            duration: 5000, // Give user 5 seconds to undo
          }
        );
      } else {
        toast.error(
          "Gagal menghapus properti: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Gagal menghapus properti");
    }
  };

  const handleSave = async () => {
    try {
      const result = await updateProperty(property.id, {
        ...editForm,
        updatedAt: new Date(),
      });
      if (result.success) {
        toast.success("Properti berhasil diupdate");
        setIsEditing(false);
      } else {
        toast.error(
          "Gagal mengupdate properti: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Gagal mengupdate properti");
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

  const handleInterestRateBlur = async () => {
    if (!showAdminControls) return;

    // Only update if the rate has changed from the stored value
    const currentRate = property.financing?.interestRate ?? 5;
    if (annualRate === currentRate) return;

    const updatedFinancing = {
      ...(property.financing || {
        dpPercent: depositPercentage,
        tenorYears: angsuranYears,
        fixedYears: 1,
        bookingFee: 0,
      }),
      interestRate: annualRate,
    };

    const payload = {
      ...property,
      financing: updatedFinancing,
      updatedAt: new Date(),
    };

    try {
      const result = await updateProperty(property.id, payload);

      if (result.success) {
        toast.success("Bunga berhasil diperbarui");
      } else {
        toast.error(
          "Gagal menyimpan bunga: " + (result.error || "Unknown error")
        );
        // Revert to original value
        setAnnualRate(currentRate);
      }
    } catch (error) {
      console.error("Error updating interest rate:", error);
      toast.error("Gagal menyimpan bunga");
      setAnnualRate(currentRate);
    }
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
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 btn-landscape"
            >
              Simpan
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 btn-landscape"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to get colors with defaults
  const getStatusColorFinal = (_status: string, customColor?: string) => {
    if (customColor) return customColor;
    // Default for both is green
    return "bg-green-600";
  };

  const getTypeColorFinal = (type: string, customColor?: string) => {
    if (customColor) return customColor;
    switch (type.toLowerCase()) {
      case "rumah":
        return "bg-blue-600";
      case "ruko":
      case "gudang":
        return "bg-purple-600";
      case "kavling":
        return "bg-yellow-500";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <>
      <motion.div
        className={`w-full overflow-hidden rounded-lg bg-white shadow-lg font-sans flex flex-col h-full ${selectable ? "cursor-pointer" : ""
          } ${isSelected ? "ring-4 ring-blue-500" : ""}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={(e) => {
          if (selectable) {
            // Prevent selection when clicking on buttons or interactive elements
            const target = e.target as HTMLElement;
            if (
              target.tagName === "BUTTON" ||
              target.closest("button") ||
              target.tagName === "A" ||
              target.closest("a")
            ) {
              return;
            }
            onToggleSelect?.();
          }
        }}
      >
        <div className="relative flex-shrink-0">
          {/* Selection Checkbox */}
          {selectable && (
            <div className="absolute top-3 left-3 z-20">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect?.();
                }}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors shadow-md ${isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300 hover:border-blue-400"
                  }`}
              >
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Image Slider */}
          <div className="relative h-56 w-full overflow-hidden bg-gray-200">
            {/* Main Image */}
            <img
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 cursor-pointer hover:opacity-90"
              src={images[slide]}
              alt={`${property.type} ${slide + 1}`}
              onClick={openOverlay}
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
            {/* Title - Top Center (show listing title) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md pointer-events-none max-w-[70%]">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {property.title}
              </p>
            </div>

            {/* Badges - Bottom Left */}
            <div className="absolute left-3 bottom-3 flex flex-col xl:flex-row gap-1.5 xl:gap-2 pointer-events-none">
              <div
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ring-1 ring-white/20 w-fit ${getStatusColorFinal(
                  property.status,
                  property.statusColor
                )} type-capsule-landscape`}
              >
                {formatText(property.status)}
              </div>
              <div className="hidden md:block">
                <div
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ring-1 ring-white/20 w-fit ${getTypeColorFinal(
                    property.type,
                    property.typeColor
                  )} flex items-center gap-1.5 type-capsule-landscape`}
                >
                  {property.type === "rumah" ? (
                    <HomeIcon className="w-3.5 h-3.5" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" />
                  )}
                  <span>{formatText(property.type)}</span>
                </div>
              </div>
            </div>
            {/* Social Links - Bottom Right */}
            {(property.igUrl || property.tiktokUrl) && (
              <div className="absolute right-3 bottom-3 flex items-center gap-2 pointer-events-auto">
                {property.igUrl && (
                  <a
                    href={property.igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md text-pink-600 hover:text-pink-700 social-capsule-landscape"
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
                    className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md text-gray-800 hover:text-black social-capsule-landscape"
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
                  onClick={() => onEdit?.(property)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-lg transition-all duration-200 flex items-center"
                  title="Edit Properti"
                >
                  <IoPencil size={18} />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 shadow-lg transition-all duration-200 flex items-center"
                  title="Hapus Properti"
                >
                  <IoTrash size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div
          ref={cardRef}
          className="relative p-5 flex flex-col flex-1"
          onClick={(e) => e.stopPropagation()}
        >
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

          {/* Location & SubLocation (above DP) with KM/KT badges to the right */}
          <div className="mt-2 flex items-start justify-between relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">
                {property.location}
              </span>
              {property.subLocation && (
                <span className="text-xs text-gray-500">
                  {property.subLocation}
                </span>
              )}
              {/* Property icons for landscape mobile */}
              <div className="property-icons-landscape mt-1 hidden">
                <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                  <Bath size={16} className="text-gray-700" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                  <Bed size={16} className="text-gray-700" />
                  <span>{property.bedrooms}</span>
                </div>
                {property.floors && property.floors > 0 && (
                  <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                    <StairsIcon size={16} className="text-gray-700" />
                    <span>{property.floors}</span>
                  </div>
                )}
                {garageCount > 0 && (
                  <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                    <Car size={16} className="text-gray-700" />
                    <span>{garageCount}</span>
                  </div>
                )}
              </div>
              {/* Property type badge: show below sublocation on mobile only */}
              <div className="block md:hidden mt-1">
                <div
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ring-1 ring-white/20 w-fit ${property.type === "rumah" ? "bg-green-600" : "bg-purple-600"
                    } flex items-center gap-1.5 type-capsule-landscape`}
                >
                  {property.type === "rumah" ? (
                    <HomeIcon className="w-3.5 h-3.5" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" />
                  )}
                  <span>{formatText(property.type)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-y-0.5 text-[11px] text-gray-800 font-semibold">
                <span className="whitespace-nowrap">
                  Luas Tanah: {property.landArea ?? 0} m²
                </span>
                {property.area ? (
                  <span className="whitespace-nowrap">
                    Luas Bangunan: {property.area} m²
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 property-icons-hide-on-landscape">
              <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                <Bath size={16} className="text-gray-700" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                <Bed size={16} className="text-gray-700" />
                <span>{property.bedrooms}</span>
              </div>
              {property.floors && property.floors > 0 && (
                <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                  <StairsIcon size={16} className="text-gray-700" />
                  <span>{property.floors}</span>
                </div>
              )}
              {garageCount > 0 && (
                <div className="bg-white/90 px-2 py-1 rounded-md text-sm font-semibold text-gray-700 border border-gray-200 flex items-center gap-2">
                  <Car size={16} className="text-gray-700" />
                  <span>{garageCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financing (DP & Tenor) only for properties that are for sale */}
          {isForSale && (
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
                    <label className="text-base font-semibold">Tenor</label>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                      <select
                        value={angsuranYears}
                        onChange={(e) =>
                          setAngsuranYears(parseInt(e.target.value))
                        }
                        className="px-2 py-1 w-20 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: "right 0.25rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.25rem 1.25rem",
                        }}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="25">25</option>
                      </select>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 font-semibold border-l border-gray-300">
                        Tahun
                      </span>
                    </div>
                  </div>
                  {showAdminControls && (
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
                          onChange={(e) =>
                            setAnnualRate(Number(e.target.value))
                          }
                          onBlur={handleInterestRateBlur}
                          onFocus={(e) => e.target.select()}
                          className="w-16 px-2 py-1 text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Tekan Enter atau klik di luar untuk menyimpan"
                        />
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 font-semibold border-l border-gray-300">
                          %/thn
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Angsuran</span>
                  <span className="text-lg font-bold text-blue-700">
                    Rp {formatCurrency(calculateAngsuran())}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Detail singkat: tipe, lantai, kamar */}
          <div className="mt-3 bg-white rounded-lg border border-gray-200 px-4 py-3 min-h-[5.5rem]">
            <p
              className={`text-sm text-gray-700 leading-relaxed ${isDescExpanded
                  ? "whitespace-pre-line"
                  : "line-clamp-3 whitespace-normal"
                }`}
            >
              {cleanedDescription || "Tidak ada deskripsi"}
            </p>
            {cleanedDescription &&
              (cleanedDescription.length > 160 ||
                cleanedDescription.split(/\r?\n/).length > 3) && (
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
          <div className="flex gap-2 mt-auto">
            {hasTourLink ? (
              <a
                href={property.tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 btn-landscape"
              >
                House Tour
              </a>
            ) : (
              <button
                disabled
                className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-gray-400 px-4 py-2 text-white cursor-not-allowed btn-landscape"
              >
                House Tour
              </button>
            )}
            {showWhatsAppButton && (
              <button
                onClick={handleWhatsAppClick}
                className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 btn-landscape"
              >
                WhatsApp
              </button>
            )}
            {showRemoveFromComparisonButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromComparison();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center btn-landscape"
                title="Hapus dari perbandingan"
              >
                <IoTrash size={20} />
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center btn-landscape"
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
                    className={`px-4 py-2 rounded-lg flex items-center justify-center ${canAddToComparison
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

      {/* Image Overlay Portal */}
      {isOverlayOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeOverlay}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeOverlay();
              }}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-50 p-2 transition-colors"
            >
              <X size={32} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all"
            >
              <ChevronLeft size={32} />
            </button>

            <div
              className="relative w-full h-full flex items-center justify-center p-4 md:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[slide]}
                alt={`Full view ${slide + 1}`}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
              />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                {slide + 1} / {images.length}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all"
            >
              <ChevronRight size={32} />
            </button>
          </div>,
          document.body
        )}

      {isDescExpanded &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              left: overlayPos.left,
              top: overlayPos.top,
              width: overlayPos.width,
            }}
            className="fixed z-50 bg-white border rounded-lg shadow-xl p-4 max-h-[70vh] overflow-auto"
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <h4 className="text-lg font-semibold">{property.title}</h4>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setIsDescExpanded(false)}
                aria-label="Tutup deskripsi"
              >
                Tutup
              </button>
            </div>
            <div
              className="text-sm text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none prose-p:my-2 prose-ul:list-disc prose-ul:pl-4"
              dangerouslySetInnerHTML={{ __html: property.description }}
            />
          </div>,
          document.body
        )}
      {isCatalogOpen && (
        <PropertyCatalogModal
          property={property}
          onClose={() => setIsCatalogOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Properti?"
        message={`Apakah Anda yakin ingin menghapus properti "${property.title}"? Anda dapat membatalkannya dalam 5 detik setelah menghapus.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
    </>
  );
};

export default PropertyCard;
