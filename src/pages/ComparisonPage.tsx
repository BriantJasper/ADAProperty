import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Scale } from "lucide-react";

import PropertyCard from "../components/PropertyCard";

const ComparisonPage: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  // Removed unused catalogProperty and descExpandedMap state

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const comparisonProperties = state.comparisonCart.map(
    (item) => item.property
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-x-hidden">
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

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-5 py-2.5 rounded-xl min-w-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-900 truncate">
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
                {comparisonProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    showAdminControls={false}
                    showComparisonButton={false}
                    showWhatsAppButton={true}
                    showRemoveFromComparisonButton={true}
                  />
                ))}
              </div>

              {/* PropertyCatalogModal removed, not needed in comparison view */}
            </div>
            {/* End Comparison Table */}
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
