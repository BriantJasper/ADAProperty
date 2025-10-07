import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Property } from '../types/Property';
import { IoAdd, IoTrash, IoPencil, IoEye, IoEyeOff } from 'react-icons/io5';
import { FaWhatsapp } from 'react-icons/fa';

interface PropertyCardProps {
  property: Property;
  showAdminControls?: boolean;
  showComparisonButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showAdminControls = false,
  showComparisonButton = true,
}) => {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(property);

  const isInComparison = state.comparisonCart.some(item => item.property.id === property.id);
  const canAddToComparison = state.comparisonCart.length < 3 && !isInComparison;

  const handleAddToComparison = () => {
    if (canAddToComparison) {
      dispatch({ type: 'ADD_TO_COMPARISON', payload: property });
    }
  };

  const handleRemoveFromComparison = () => {
    dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: property.id });
  };

  const handleWhatsAppClick = () => {
    const message = `Halo, saya tertarik dengan properti ${property.type} di ${property.location} dengan harga ${property.price}. Apakah masih tersedia?`;
    const whatsappUrl = `https://wa.me/${property.phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus properti ini?')) {
      dispatch({ type: 'DELETE_PROPERTY', payload: property.id });
    }
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: { ...editForm, updatedAt: new Date() } });
    setIsEditing(false);
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
            <label className="block text-sm font-medium text-gray-700">Tipe</label>
            <input
              type="text"
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Dijual">Dijual</option>
              <option value="Disewa">Disewa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Harga</label>
            <input
              type="text"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lokasi</label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor WhatsApp</label>
            <input
              type="text"
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
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
        {/* Property Image */}
        <img
          className="h-56 w-full object-cover"
          src={property.imageUrl}
          alt={`Image of ${property.type} in ${property.location}`}
        />

        {/* Status Tag */}
        <div
          className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${property.colorStatus}`}
        >
          {property.status}
        </div>

        {/* Type Tag */}
        <div
          className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${property.colorType}`}
        >
          {property.type}
        </div>

        {/* Admin Controls */}
        {showAdminControls && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700"
            >
              <IoPencil size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
            >
              <IoTrash size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Price */}
        <h3 className="text-2xl font-bold text-gray-900">{property.price}</h3>

        {/* Location */}
        <div className="mt-1 mb-4 flex items-center text-sm text-gray-600">
          <span className="ml-1">{property.location}</span>
        </div>

        {/* Property Details */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-700 mb-4">
          <div className="flex items-center gap-x-1.5">
            <span>🛏️</span>
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-x-1.5">
            <span>🚿</span>
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-x-1.5">
            <span>🏠</span>
            <span>{property.buildingArea}</span>
          </div>
          <div className="flex items-center gap-x-1.5">
            <span>📐</span>
            <span>{property.landArea}</span>
          </div>
          {property.garage && (
            <div className="flex items-center gap-x-1.5">
              <span>🚗</span>
              <span>Ada</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleWhatsAppClick}
            className="flex-1 inline-flex items-center justify-center gap-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <FaWhatsapp />
            WhatsApp
          </button>
          
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
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
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