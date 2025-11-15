import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import ApiService from "../services/api";
import type { Property } from "../types/Property";
import { IoAdd, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

interface PropertyFormProps {
  property?: Property;
  onSave: (property: Property) => void | Promise<void>;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSave,
  onCancel,
}) => {
  const { state } = useApp();
  const [formData, setFormData] = useState<
    Partial<Property> & { garage?: boolean }
  >({
    title: property?.title || "",
    description: property?.description || "",
    price: property?.price || 0,
    location: property?.location || "",
    subLocation: property?.subLocation || "",
    type: property?.type || "rumah",
    status: property?.status || "dijual",
    bedrooms: (property?.bedrooms || "") as any,
    bathrooms: (property?.bathrooms || "") as any,
    area: (property?.area || "") as any,
    landArea: (property?.landArea || "") as any,
    floors: (property?.floors ?? "") as any,
    images: property?.images || [],
    features: property?.features || [],
    whatsappNumber: property?.whatsappNumber || "",
    igUrl: property?.igUrl || "",
    tiktokUrl: property?.tiktokUrl || "",
    tourUrl: property?.tourUrl || "",
    financing: property?.financing || undefined,
    garage: undefined,
  });

  // Interest rate state (default 5%)
  const [interestRate, setInterestRate] = useState<number>(
    property?.financing?.interestRate ?? 5
  );

  // Local display state for currency-formatted price input (visibility only)
  const [priceDisplay, setPriceDisplay] = useState<string>(() => {
    const n = Number(property?.price || 0);
    return n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "";
  });

  // Removed unused imagePreview state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // State for custom property types
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [isAddingCustomType, setIsAddingCustomType] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState("");

  // Default property types
  const defaultTypes = [
    "rumah",
    "apartemen",
    "tanah",
    "ruko",
    "kavling",
    "gudang",
    "pabrik",
  ];

  // Combine default and custom types
  const allTypes = [...defaultTypes, ...customTypes];

  // Keep formatted displays in sync when formData changes (e.g., on edit open)
  React.useEffect(() => {
    const n = Number(formData.price || 0);
    setPriceDisplay(n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "");
  }, [formData.price]);

  // When switching between add/edit or editing a different property, ensure displays sync from prop
  React.useEffect(() => {
    if (property) {
      const price = Number(property.price || 0);
      setPriceDisplay(price > 0 ? `Rp ${price.toLocaleString("id-ID")}` : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id]);

  // Helper function to normalize URLs
  const normalizeUrl = (url: string): string => {
    if (!url || url.trim() === "") return "";
    let normalized = url.trim();
    // If it doesn't start with http:// or https://, add https://
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }
    return normalized;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      // Allow empty string for number inputs so users can clear the field
      if (value === "" || value === null || value === undefined) {
        setFormData((prev) => ({
          ...prev,
          [name]: "" as any,
        }));
      } else {
        const num = parseInt(value);
        // Clamp sesuai aturan backend: harga >=1, lainnya >=0
        if (name === "price") {
          setFormData((prev) => ({
            ...prev,
            [name]: isNaN(num) ? 0 : Math.max(num, 1),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: isNaN(num) ? 0 : Math.max(num, 0),
          }));
        }
      }
    } else if (
      type === "url" ||
      name === "igUrl" ||
      name === "tiktokUrl" ||
      name === "tourUrl"
    ) {
      // Normalize URL inputs
      setFormData((prev) => ({ ...prev, [name]: normalizeUrl(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Special handler for Harga (price) to format as currency while typing
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const digitsOnly = raw.replace(/\D+/g, "");
    const num = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    setFormData((prev) => ({ ...prev, price: num }));
    setPriceDisplay(digitsOnly ? `Rp ${num.toLocaleString("id-ID")}` : "");
  };

  const handleAddCustomType = () => {
    const trimmed = customTypeInput.trim().toLowerCase();
    if (trimmed && !allTypes.includes(trimmed)) {
      setCustomTypes([...customTypes, trimmed]);
      setFormData((prev) => ({ ...prev, type: trimmed as any }));
      setCustomTypeInput("");
      setIsAddingCustomType(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "__custom__") {
      setIsAddingCustomType(true);
    } else {
      setFormData((prev) => ({ ...prev, type: value as any }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    try {
      setIsUploadingImages(true);
      console.log("Uploading images:", files.length, "files");
      const res = await ApiService.uploadImages(files);
      console.log("Upload response:", res);
      if (res?.success && Array.isArray(res.data)) {
        console.log("Images uploaded successfully:", res.data);
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...res.data],
        }));
        // Clear the "Minimal 1 gambar harus diunggah" error if it exists
        setErrors((prevErrors) =>
          prevErrors.filter((err) => err !== "Minimal 1 gambar harus diunggah")
        );
        toast.success(`${res.data.length} gambar berhasil diunggah`);
        // Reset the input so user can upload the same file again or upload more
        e.target.value = "";
      } else {
        console.error("Upload image failed:", res);
        toast.error(res?.error || "Gagal mengunggah gambar");
      }
    } catch (err) {
      console.error("Failed to upload image files:", err);
      toast.error("Terjadi kesalahan saat mengunggah gambar");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const imgs = (prev.images || []).slice();
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  // Template deskripsi: diletakkan di dalam komponen agar punya akses ke setFormData
  const buildDescriptionTemplateFrom = () => {
    return `Fasilitas:\n   -\n   -\n   -\nPromo:\n   -\n   -\n   -`;
  };

  const handleInsertTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      description: buildDescriptionTemplateFrom(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Scroll modal to middle to show loading animation
    setTimeout(() => {
      const modalContainer = document.querySelector(
        ".max-h-\\[90vh\\].overflow-y-auto"
      );
      if (modalContainer) {
        const scrollHeight = modalContainer.scrollHeight;
        const clientHeight = modalContainer.clientHeight;
        const middlePosition = (scrollHeight - clientHeight) / 2;
        modalContainer.scrollTo({ top: middlePosition, behavior: "smooth" });
      }
    }, 100);

    try {
      // Bangun payload yang sesuai validasi backend (tanpa placeholder default)
      const trimmed = (v: any) => (typeof v === "string" ? v.trim() : v);
      const propertyData = {
        title: trimmed(formData.title),
        description: trimmed(formData.description),
        price:
          typeof formData.price === "number"
            ? formData.price
            : parseInt(String(formData.price)) || 0,
        location: trimmed(formData.location),
        subLocation:
          trimmed(formData.subLocation) || trimmed(formData.location),
        type: formData.type,
        status: formData.status,
        bedrooms:
          typeof formData.bedrooms === "number"
            ? formData.bedrooms
            : parseInt(String(formData.bedrooms)) || 0,
        bathrooms:
          typeof formData.bathrooms === "number"
            ? formData.bathrooms
            : parseInt(String(formData.bathrooms)) || 0,
        area:
          typeof formData.area === "number"
            ? formData.area
            : parseInt(String(formData.area)) || 0,
        landArea:
          typeof formData.landArea === "number"
            ? formData.landArea
            : parseInt(String(formData.landArea as any)) || 0,
        floors:
          typeof formData.floors === "number"
            ? formData.floors
            : parseInt(String(formData.floors as any)) || 0,
        images: formData.images || [],
        features: formData.garage
          ? [...(formData.features || []), "Garasi"]
          : formData.features || [],
        whatsappNumber: trimmed(formData.whatsappNumber),
        igUrl: trimmed(formData.igUrl) || undefined,
        tiktokUrl: trimmed(formData.tiktokUrl) || undefined,
        // add tour url to payload
        tourUrl: trimmed(formData.tourUrl) || undefined,
        // Add financing with interest rate and default values
        financing: {
          dpPercent: 5,
          tenorYears: 15,
          fixedYears: 1,
          bookingFee: 0,
          interestRate: interestRate,
        },
      } as Partial<Property>;

      console.log("Submitting property with images:", propertyData.images);

      // Validasi ringan di sisi klien agar sesuai aturan backend
      const validationErrors: string[] = [];
      if (
        !propertyData.title ||
        (propertyData.title as string).length < 1 ||
        (propertyData.title as string).length > 255
      ) {
        validationErrors.push("Judul harus 1-255 karakter");
      }
      if (!Number.isFinite(propertyData.price as number)) {
        validationErrors.push("Harga harus berupa angka");
      } else if ((propertyData.price as number) <= 0) {
        validationErrors.push("Harga harus lebih dari 0");
      }
      if (!propertyData.location) {
        validationErrors.push("Lokasi wajib diisi");
      }
      if (!propertyData.subLocation) {
        validationErrors.push("Sub lokasi wajib diisi");
      }
      if (!propertyData.type || (propertyData.type as string).trim() === "") {
        validationErrors.push("Tipe properti wajib diisi");
      }
      if (!["dijual", "disewa"].includes(propertyData.status as string)) {
        validationErrors.push("Status harus salah satu dari: dijual, disewa");
      }
      const isNonNegInt = (n: any) => Number.isInteger(n) && n >= 0;
      // Validasi KT/KM/LB dilonggarkan karena diarahkan ke Deskripsi
      if (!isNonNegInt(propertyData.floors)) {
        validationErrors.push(
          "Jumlah lantai wajib diisi dan bilangan bulat ≥ 0"
        );
      }
      if (!propertyData.whatsappNumber) {
        validationErrors.push("Nomor WhatsApp wajib diisi");
      }
      if (!propertyData.images || propertyData.images.length === 0) {
        validationErrors.push("Minimal 1 gambar harus diunggah");
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        // Scroll to the top of the form to show the error messages
        setTimeout(() => {
          // Find the scrollable modal container (updated selector for new structure)
          const modalContainer = document.querySelector(
            ".max-h-\\[90vh\\].overflow-y-auto"
          );
          if (modalContainer) {
            modalContainer.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            // Fallback to scrolling the window
            const formElement = document.querySelector("form");
            if (formElement) {
              const yOffset = -100;
              const y =
                formElement.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }
        }, 100);
        toast.error("Mohon periksa kembali formulir");
        return;
      }

      setErrors([]);
      await onSave(propertyData as Property);
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(
        `Terjadi kesalahan saat menyimpan properti: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {" "}
          <ul className="list-disc pl-5">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gambar Properti * (boleh pilih beberapa sekaligus)
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploadingImages}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-500">
              Tip: Anda bisa memilih beberapa gambar sekaligus (tekan Ctrl/Cmd
              saat memilih) atau upload berkali-kali untuk menambah lebih banyak
              gambar.
            </p>
            {isUploadingImages && (
              <div className="mt-3 flex items-center justify-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-900">
                    Mengunggah gambar...
                  </span>
                  <span className="text-xs text-blue-700">
                    Mohon tunggu sebentar
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {(formData.images?.length || 0) > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {formData.images!.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-gray-200"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    if (el.dataset.fallbackApplied !== "1") {
                      el.src = "/images/p1.png";
                      el.dataset.fallbackApplied = "1";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                  title="Hapus gambar ini"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul Properti *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Contoh: Rumah Mewah 3 Kamar Tidur"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Properti *
          </label>
          {isAddingCustomType ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTypeInput}
                onChange={(e) => setCustomTypeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomType();
                  }
                }}
                placeholder="Masukkan tipe properti baru..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomType}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                title="Tambah tipe"
              >
                <IoAdd className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCustomType(false);
                  setCustomTypeInput("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                title="Batal"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <select
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Tipe</option>
              <option value="rumah">Rumah</option>
              <option value="apartemen">Apartemen</option>
              <option value="tanah">Tanah</option>
              <option value="ruko">Ruko</option>
              <option value="kavling">Kavling</option>
              <option value="gudang">Gudang</option>
              <option value="pabrik">Pabrik</option>
              {customTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
              <option
                value="__custom__"
                className="text-blue-600 font-semibold"
              >
                + Tambah Tipe Baru...
              </option>
            </select>
          )}
          {!isAddingCustomType && (
            <p className="text-xs text-gray-500 mt-1">
              Tidak menemukan tipe yang sesuai? Pilih "+ Tambah Tipe Baru..."
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dijual">Dijual</option>
            <option value="disewa">Disewa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Harga (Rp) *
          </label>
          <input
            type="text"
            inputMode="numeric"
            name="price"
            value={priceDisplay}
            onChange={handlePriceChange}
            placeholder="Contoh: Rp 450.000.000"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Angka akan diformat otomatis untuk memudahkan dibaca.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Contoh: Jababeka, Cikarang"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub Lokasi *
          </label>
          <input
            type="text"
            name="subLocation"
            value={formData.subLocation}
            onChange={handleInputChange}
            placeholder="Contoh: Jababeka"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kamar Tidur
          </label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            placeholder="Contoh: 3"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kamar Mandi
          </label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            placeholder="Contoh: 2"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Luas Bangunan (m²)
          </label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            placeholder="Contoh: 120"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Luas Tanah (m²)
          </label>
          <input
            type="number"
            name="landArea"
            value={formData.landArea}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            placeholder="Contoh: 150"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor WhatsApp *
          </label>
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleInputChange}
            placeholder="Contoh: 6281234567890"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah Lantai
          </label>
          <input
            type="number"
            name="floors"
            value={formData.floors ?? 0}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            placeholder="Contoh: 2"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bunga / Tahun (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            placeholder="5"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Default: 5% per tahun</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram (opsional)
          </label>
          <input
            type="text"
            name="igUrl"
            value={formData.igUrl || ""}
            onChange={handleInputChange}
            placeholder="instagram.com/username atau www.instagram.com/username"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Masukkan URL dalam format apa pun (akan dinormalisasi otomatis)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TikTok (opsional)
          </label>
          <input
            type="text"
            name="tiktokUrl"
            value={formData.tiktokUrl || ""}
            onChange={handleInputChange}
            placeholder="tiktok.com/@username atau www.tiktok.com/@username"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Masukkan URL dalam format apa pun (akan dinormalisasi otomatis)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            House Tour (opsional)
          </label>
          <input
            type="text"
            name="tourUrl"
            value={formData.tourUrl || ""}
            onChange={handleInputChange}
            placeholder="facebook.com/... atau youtube.com/... atau link lainnya"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Masukkan URL dalam format apa pun (akan dinormalisasi otomatis)
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleInsertTemplate}
            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            Gunakan template
          </button>
        </div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder={"Fasilitas:\n   -\n   -\n   -\nPromo:\n   -\n   -\n   -"}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tips: pisahkan poin dengan baris baru atau koma; kartu akan merapikan
          otomatis.
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="garage"
          checked={formData.garage}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Memiliki Garasi
        </label>
      </div>

      {/* Color Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warna Tag Tipe
          </label>
          <select
            name="colorType"
            value={(formData as any).colorType || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bg-green-600">Hijau</option>
            <option value="bg-blue-600">Biru</option>
            <option value="bg-purple-600">Ungu</option>
            <option value="bg-orange-600">Orange</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warna Tag Status
          </label>
          <select
            name="colorStatus"
            value={(formData as any).colorStatus || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bg-blue-800">Biru</option>
            <option value="bg-red-600">Merah</option>
            <option value="bg-green-600">Hijau</option>
            <option value="bg-purple-600">Ungu</option>
          </select>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || state.loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting || state.loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4"></div>
              {property ? "Menyimpan..." : "Menambahkan..."}
            </>
          ) : (
            <>
              <IoAdd className="w-4 h-4" />
              {property ? "Update Properti" : "Tambah Properti"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
