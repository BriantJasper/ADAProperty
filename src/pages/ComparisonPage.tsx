import React from 'react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import ComparisonCart from '../components/ComparisonCart';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const ComparisonPage: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <IoArrowBack size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Komparasi Properti
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <ComparisonCart />
      </div>
    </div>
  );
};

export default ComparisonPage;
