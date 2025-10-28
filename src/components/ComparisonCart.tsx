import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { IoClose, IoTrash } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { Bed, Bath, Maximize, Home } from "lucide-react";

const ComparisonCart: React.FC = () => {
  const { state, dispatch } = useApp();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleRemoveFromComparison = (propertyId: string) => {
    dispatch({ type: "REMOVE_FROM_COMPARISON", payload: propertyId });
  };

  const handleClearAll = () => {
    dispatch({ type: "CLEAR_COMPARISON" });
  };

  const handleWhatsAppClick = (property: any) => {
    const message = `Halo, saya tertarik dengan properti ${property.title} di ${property.location} dengan harga Rp ${property.price.toLocaleString()}. Apakah masih tersedia?`;
    const whatsappUrl = `https://wa.me/${property.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (state.comparisonCart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <IoTrash size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keranjang Komparasi Kosong
          </h3>
          <p className="text-gray-500 mb-1">
            Pilih hingga 3 properti untuk dibandingkan
          </p>
          <p className="text-sm text-gray-400">
            Mulai tambahkan properti untuk melihat perbandingan detail
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Komparasi Properti
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {state.comparisonCart.length} dari 3 properti dipilih
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 font-medium"
          >
            <IoTrash size={18} />
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.comparisonCart.map((item, idx) => (
          <div
            key={`comparison-item-${item.property.id}-${idx}`}
            onMouseEnter={() => setHoveredCard(item.property.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
              hoveredCard === item.property.id
                ? "shadow-xl transform -translate-y-1"
                : ""
            }`}
            style={{ transitionDelay: `${idx * 50}ms` }}
          >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <img
                src={item.property.images?.[0] || '/images/p1.png'}
                alt={item.property.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  hoveredCard === item.property.id ? "scale-105" : "scale-100"
                }`}
              />
              <button
                onClick={() => handleRemoveFromComparison(item.property.id)}
                className="absolute top-3 right-3 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full p-2 shadow-lg transition-all duration-200"
              >
                <IoClose size={20} />
              </button>
              <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md font-semibold text-sm shadow">
                #{idx + 1}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              {/* Price */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-xs text-gray-600 mb-1">Harga</div>
                <div className="text-2xl font-bold text-blue-600">
                  Rp {item.property.price.toLocaleString()}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start text-gray-600 mb-4">
                <Home size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{item.property.location}</span>
              </div>

              {/* Property Details */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tipe</span>
                  <span className="font-medium text-gray-900">
                    {item.property.type}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-900">
                    {item.property.status}
                  </span>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Bed size={18} className="text-gray-600 mb-1" />
                  <div className="text-base font-semibold text-gray-900">
                    {item.property.bedrooms}
                  </div>
                  <div className="text-xs text-gray-500">Kamar Tidur</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Bath size={18} className="text-gray-600 mb-1" />
                  <div className="text-base font-semibold text-gray-900">
                    {item.property.bathrooms}
                  </div>
                  <div className="text-xs text-gray-500">Kamar Mandi</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Maximize size={18} className="text-gray-600 mb-1" />
                  <div className="text-base font-semibold text-gray-900">
                    {item.property.area}m²
                  </div>
                  <div className="text-xs text-gray-500">Luas Area</div>
                </div>
              </div>

              {/* Features Info */}
              {item.property.features && item.property.features.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
                  <div className="text-sm text-blue-700 font-medium mb-1">Fitur:</div>
                  <div className="text-xs text-blue-600">
                    {item.property.features.join(", ")}
                  </div>
                </div>
              )}

              {/* WhatsApp Button */}
              <button
                onClick={() => handleWhatsAppClick(item.property)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <FaWhatsapp size={20} />
                Hubungi via WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {state.comparisonCart.length < 3 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Tips:</span> Anda dapat menambahkan{" "}
            {3 - state.comparisonCart.length} properti lagi untuk perbandingan
            yang lebih lengkap
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparisonCart;
