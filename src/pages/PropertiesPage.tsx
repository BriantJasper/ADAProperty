import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';

const PropertiesPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeSub, setActiveSub] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const location = state.selectedLocation; // e.g. "Cikarang"

  // All distinct cities (after comma) for the location dropdown
  const cityOptions = useMemo(() => {
    const cities = Array.from(
      new Set(
        state.properties
          .map((p) => (p.location.split(',')[1] || '').trim()) // city after comma
          .filter(Boolean)
      )
    );
    return cities;
  }, [state.properties]);

  // Price parser: returns lower bound number in Rupiah (millions based)
  const parsePriceToNumber = (price: string): number => {
    // Examples: "300 - 400 Juta", "1 - 2 Miliar", "35 Juta / bulan"
    const clean = price.replace(/\s+/g, ' ').toLowerCase();
    const isMonthly = clean.includes('bulan');
    const matchRange = clean.match(/([\d.,]+)\s*-\s*([\d.,]+)/);
    const matchSingle = clean.match(/([\d.,]+)/);
    let base = 0;
    if (matchRange) {
      base = parseFloat(matchRange[1].replace(',', '.'));
    } else if (matchSingle) {
      base = parseFloat(matchSingle[1].replace(',', '.'));
    }
    if (clean.includes('miliar')) base = base * 1_000_000_000;
    else base = base * 1_000_000; // juta
    // treat sewa per bulan as is
    return isMonthly ? base : base; // same unit for filtering
  };

  // Derive sub-locations from existing property.location strings
  const { subLocations, filteredByLocation } = useMemo(() => {
    const list = state.properties.filter((p) => {
      if (!location) return true;
      const city = (p.location.split(',')[1] || '').trim().toLowerCase();
      return city.includes(location.toLowerCase());
    });
    const subs = Array.from(
      new Set(
        list
          .map((p) => p.location.split(',')[0].trim()) // e.g. "Jababeka"
          .filter(Boolean)
      )
    );
    return { subLocations: subs, filteredByLocation: list };
  }, [state.properties, location]);

  const finalList = useMemo(() => {
    let list = filteredByLocation;
    if (activeSub) list = list.filter((p) => p.location.startsWith(activeSub));
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (typeFilter) list = list.filter((p) => p.type === typeFilter);
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined && !Number.isNaN(min)) {
      list = list.filter((p) => parsePriceToNumber(p.price) >= min * 1_000_000);
    }
    if (max !== undefined && !Number.isNaN(max)) {
      list = list.filter((p) => parsePriceToNumber(p.price) <= max * 1_000_000);
    }
    return list;
  }, [filteredByLocation, activeSub, statusFilter, typeFilter, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[360px] bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero-bg.png)' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">Daftar Properti</h1>
          <p className="mt-2 opacity-90">{location ? `Lokasi: ${location}` : 'Semua lokasi'}</p>

          {/* Filter Glass Panel */}
          <div className="mt-6 bg-white/15 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Location Select centered */}
              <div className="md:col-span-4 flex justify-center">
                <select
                  value={location}
                  onChange={(e) => dispatch({ type: 'SET_SELECTED_LOCATION', payload: e.target.value })}
                  className="w-full md:w-[520px] px-4 py-2 rounded-full bg-white/90 text-gray-800 text-center"
                >
                  <option value="">Pilih Lokasi</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <div className="text-sm opacity-80 mb-1">Status</div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800"
                >
                  <option value="">Semua</option>
                  <option value="Dijual">Dijual</option>
                  <option value="Disewa">Disewa</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <div className="text-sm opacity-80 mb-1">Type</div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800"
                >
                  <option value="">Semua</option>
                  <option value="Rumah">Rumah</option>
                  <option value="Apartemen">Apartemen</option>
                </select>
              </div>

              {/* Price Min */}
              <div>
                <div className="text-sm opacity-80 mb-1">Price Min (Juta)</div>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800"
                  placeholder="cth: 300"
                />
              </div>

              {/* Price Max */}
              <div>
                <div className="text-sm opacity-80 mb-1">Price Max (Juta)</div>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800"
                  placeholder="cth: 2000"
                />
              </div>
            </div>
          </div>

          {subLocations.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveSub('')}
                className={`px-4 py-2 rounded-full border backdrop-blur-sm ${
                  activeSub === '' ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Semua Sub-Lokasi
              </button>
              {subLocations.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSub(sub)}
                  className={`px-4 py-2 rounded-full border backdrop-blur-sm ${
                    activeSub === sub ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {finalList.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
            Tidak ada properti untuk filter saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {finalList.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showAdminControls={false}
                showComparisonButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;


