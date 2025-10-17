import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Property } from "../types/Property";
import { IoAdd, IoTrash, IoPencil, IoEyeOff } from "react-icons/io5";
import { Home as HomeIcon, Building2, Bed, Bath } from "lucide-react";

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
  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["/images/p1.png"];
  const [slide, setSlide] = useState(0);

  const isInComparison = state.comparisonCart.some(
    (item) => item.property.id === property.id
  );
  const canAddToComparison = state.comparisonCart.length < 3 && !isInComparison;

  const handleAddToComparison = () => {
    if (canAddToComparison) {
      dispatch({ type: "ADD_TO_COMPARISON", payload: property });
    }
  };

  const handleRemoveFromComparison = () => {
    dispatch({ type: "REMOVE_FROM_COMPARISON", payload: property.id });
  };

  const handleWhatsAppClick = () => {
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
              type="number"
              value={editForm.price}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  price: parseInt(e.target.value) || 0,
                })
              }
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kamar Tidur
              </label>
              <input
                type="number"
                value={editForm.bedrooms}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    bedrooms: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kamar Mandi
              </label>
              <input
                type="number"
                value={editForm.bathrooms}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    bathrooms: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Luas Bangunan (m²)
            </label>
            <input
              type="number"
              value={editForm.area}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  area: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Luas Tanah (m²)
            </label>
            <input
              type="number"
              value={editForm.landArea || 0}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  landArea: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
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
    <div className="max-w-sm overflow-hidden rounded-lg bg-white shadow-lg font-sans">
      <div className="relative">
        {/* Image Slider */}
        <div className="relative h-56 w-full overflow-hidden">
          <img
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            src={images[slide]}
            alt={`${property.type} ${slide + 1}`}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSlide((s) => (s - 1 + images.length) % images.length)
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
                aria-label="Prev"
              >
                ‹
              </button>
              <button
                onClick={() => setSlide((s) => (s + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
                aria-label="Next"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === slide ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

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
              {property.status}
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
              <span>{property.type}</span>
            </div>
          </div>

          {/* Property Details - Bottom Right */}
          <div className="absolute right-3 bottom-3 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1.5 shadow-md pointer-events-none">
            <div className="flex gap-2 text-gray-700 text-xs font-medium">
              <div className="flex items-center gap-0.5">
                <Bed className="w-3 h-3" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Bath className="w-3 h-3" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold">LB</span>
                <span>{property.area}m²</span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold">LT</span>
                <span>{property.landArea || 0}</span>
              </div>
            </div>
          </div>

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
      <div className="p-5">
        {/* Price */}
        <h3 className="text-2xl font-bold text-gray-900">
          Rp {property.price ? property.price.toLocaleString() : "0"}
        </h3>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
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
                  onClick={handleRemoveFromComparison}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <IoEyeOff />
                  Hapus
                </button>
              ) : (
                <button
                  onClick={handleAddToComparison}
                  disabled={!canAddToComparison}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    canAddToComparison
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  <IoAdd />
                  Bandingkan
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
