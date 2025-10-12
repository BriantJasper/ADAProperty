// ComparisonPage.tsx
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import ComparisonCart from "../components/ComparisonCart";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Scale, TrendingUp } from "lucide-react";

const ComparisonPage: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 pointer-events-none" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 rounded-lg p-2"
              >
                <IoArrowBack size={24} />
              </button>

              <div className="flex items-center space-x-3">
                <Scale size={28} className="text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Komparasi Properti
                  </h1>
                  <p className="text-sm text-gray-500">
                    Bandingkan properti pilihan Anda
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <TrendingUp size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {state.comparisonCart.length} Properti
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className={`max-w-7xl mx-auto px-6 pt-8 transition-all duration-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-white/20 rounded-lg p-2 mt-1">
              <Scale size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Perbandingan Detail
              </h3>
              <p className="text-blue-50 text-sm">
                Analisis mendalam untuk membantu Anda membuat keputusan terbaik
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        <ComparisonCart />
      </div>
    </div>
  );
};

export default ComparisonPage;
