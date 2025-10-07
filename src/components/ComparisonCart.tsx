import React from 'react';
import { useApp } from '../context/AppContext';
import { IoClose, IoTrash } from 'react-icons/io5';
import { FaWhatsapp } from 'react-icons/fa';

const ComparisonCart: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleRemoveFromComparison = (propertyId: string) => {
    dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: propertyId });
  };

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_COMPARISON' });
  };

  const handleWhatsAppClick = (property: any) => {
    const message = `Halo, saya tertarik dengan properti ${property.type} di ${property.location} dengan harga ${property.price}. Apakah masih tersedia?`;
    const whatsappUrl = `https://wa.me/${property.phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (state.comparisonCart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-gray-500 mb-4">
          <IoTrash size={48} className="mx-auto mb-2" />
          <p>Keranjang komparasi kosong</p>
          <p className="text-sm">Pilih hingga 3 properti untuk dibandingkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Komparasi Properti ({state.comparisonCart.length}/3)</h2>
        <button
          onClick={handleClearAll}
          className="text-red-600 hover:text-red-800 flex items-center gap-1"
        >
          <IoTrash size={16} />
          Hapus Semua
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.comparisonCart.map((item) => (
          <div key={item.property.id} className="border rounded-lg p-4 relative">
            <button
              onClick={() => handleRemoveFromComparison(item.property.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
            >
              <IoClose size={20} />
            </button>

            <img
              src={item.property.imageUrl}
              alt={item.property.type}
              className="w-full h-32 object-cover rounded mb-3"
            />

            <div className="space-y-2">
              <h3 className="font-bold text-lg">{item.property.price}</h3>
              <p className="text-sm text-gray-600">{item.property.location}</p>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Tipe:</span>
                  <span className="font-medium">{item.property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">{item.property.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kamar Tidur:</span>
                  <span className="font-medium">{item.property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kamar Mandi:</span>
                  <span className="font-medium">{item.property.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luas Bangunan:</span>
                  <span className="font-medium">{item.property.buildingArea}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luas Tanah:</span>
                  <span className="font-medium">{item.property.landArea}</span>
                </div>
                {item.property.garage && (
                  <div className="flex justify-between">
                    <span>Garasi:</span>
                    <span className="font-medium">Ada</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleWhatsAppClick(item.property)}
                className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <FaWhatsapp />
                WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>

      {state.comparisonCart.length < 3 && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Anda dapat menambahkan {3 - state.comparisonCart.length} properti lagi
        </div>
      )}
    </div>
  );
};

export default ComparisonCart;
