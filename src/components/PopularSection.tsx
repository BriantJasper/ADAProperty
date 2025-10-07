import React from 'react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import type { Property } from '../types/Property';

export default function PopularSection() {
  const { state, dispatch } = useApp();

  const filtered = state.selectedLocation
    ? state.properties.filter(p =>
        p.location.toLowerCase().includes(state.selectedLocation.toLowerCase())
      )
    : state.properties;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Pilihan Populer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.slice(0, 6).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showAdminControls={false}
              showComparisonButton={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
