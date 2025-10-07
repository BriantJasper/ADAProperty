import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Property } from '../types/Property';
import PropertyCard from '../components/PropertyCard';
import PropertyForm from '../components/PropertyForm';
import ComparisonCart from '../components/ComparisonCart';
import { IoAdd, IoEye, IoEyeOff, IoHome, IoCart } from 'react-icons/io5';

const AdminPanel: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showComparisonCart, setShowComparisonCart] = useState(false);

  const handleAddProperty = (property: Property) => {
    dispatch({ type: 'ADD_PROPERTY', payload: property });
    setShowAddForm(false);
  };

  const handleUpdateProperty = (property: Property) => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: property });
  };

  const toggleAdminMode = () => {
    dispatch({ type: 'SET_ADMIN_MODE', payload: !state.isAdminMode });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <button
                onClick={toggleAdminMode}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  state.isAdminMode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white'
                }`}
              >
                {state.isAdminMode ? <IoEye /> : <IoEyeOff />}
                {state.isAdminMode ? 'Mode Admin Aktif' : 'Mode Admin Nonaktif'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowComparisonCart(!showComparisonCart)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <IoCart />
                Keranjang ({state.comparisonCart.length})
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <IoAdd />
                Tambah Properti
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comparison Cart */}
        {showComparisonCart && (
          <div className="mb-8">
            <ComparisonCart />
          </div>
        )}

        {/* Add Property Form */}
        {showAddForm && (
          <div className="mb-8">
            <PropertyForm
              onSave={handleAddProperty}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Properties Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Daftar Properti ({state.properties.length})
            </h2>
            <div className="text-sm text-gray-600">
              {state.isAdminMode ? 'Mode Admin - Semua fitur tersedia' : 'Mode Pengunjung - Hanya melihat'}
            </div>
          </div>

          {state.properties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <IoHome size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada properti
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai dengan menambahkan properti pertama Anda
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <IoAdd />
                Tambah Properti Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showAdminControls={state.isAdminMode}
                  showComparisonButton={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Admin Instructions */}
        {state.isAdminMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Panduan Admin Panel
            </h3>
            <div className="text-blue-800 space-y-2">
              <p>• <strong>Tambah Properti:</strong> Klik tombol "Tambah Properti" untuk menambah properti baru</p>
              <p>• <strong>Edit Properti:</strong> Klik ikon pensil pada kartu properti untuk mengedit</p>
              <p>• <strong>Hapus Properti:</strong> Klik ikon trash pada kartu properti untuk menghapus</p>
              <p>• <strong>Komparasi:</strong> Pengunjung dapat membandingkan hingga 3 properti</p>
              <p>• <strong>WhatsApp:</strong> Tombol WhatsApp akan mengirim pesan ke nomor yang terdaftar</p>
              <p>• <strong>Mode Admin:</strong> Nonaktifkan untuk melihat tampilan pengunjung</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
