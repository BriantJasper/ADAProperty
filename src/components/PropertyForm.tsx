import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ApiService from '../services/api';
import type { Property } from '../types/Property';
import { IoAdd, IoClose, IoImage } from 'react-icons/io5';

interface PropertyFormProps {
  property?: Property;
  onSave: (property: Property) => void;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSave, onCancel }) => {
  const { addProperty, updateProperty, state } = useApp();
  const [formData, setFormData] = useState<Partial<Property> & { garage?: boolean }>({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || 0,
    location: property?.location || '',
    subLocation: property?.subLocation || '',
    type: property?.type || 'rumah',
    status: property?.status || 'dijual',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    area: property?.area || 0,
    landArea: property?.landArea || 0,
    floors: property?.floors ?? 0,
    images: property?.images || [],
    features: property?.features || [],
    whatsappNumber: property?.whatsappNumber || '',
    igUrl: property?.igUrl || '',
    tiktokUrl: property?.tiktokUrl || '',
    // add tour url
    tourUrl: property?.tourUrl || '',
    garage: false,
    financing: property?.financing || { dpPercent: 10, tenorYears: 20, fixedYears: 3, bookingFee: 15000000, ppnPercent: 11 },
  });

  const [imagePreview, setImagePreview] = useState<string>(formData.images?.[0] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      const num = parseInt(value);
      // Clamp sesuai aturan backend: harga >=1, lainnya >=0
      if (name === 'price') {
        setFormData(prev => ({ ...prev, [name]: isNaN(num) ? 0 : Math.max(num, 1) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: isNaN(num) ? 0 : Math.max(num, 0) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    try {
      const res = await ApiService.uploadImages(files);
      if (res?.success && Array.isArray(res.data)) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...res.data],
        }));
      } else {
        console.error('Upload image failed:', res);
        alert(res?.error || 'Gagal mengunggah gambar');
      }
    } catch (err) {
      console.error('Failed to upload image files:', err);
      alert('Terjadi kesalahan saat mengunggah gambar');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const imgs = (prev.images || []).slice();
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  const updateFinancing = (patch: Partial<{ dpPercent: number; tenorYears: number; fixedYears: number; bookingFee: number; ppnPercent: number }>) => {
    setFormData(prev => ({
      ...prev,
      financing: {
        dpPercent: 10,
        tenorYears: 20,
        fixedYears: 3,
        bookingFee: 15000000,
        ppnPercent: 11,
        ...(prev as any).financing,
        ...patch,
      },
    }));
  };

  // Template deskripsi: diletakkan di dalam komponen agar punya akses ke setFormData
  const buildDescriptionTemplateFrom = (p: Partial<Property>) => {
    const b = Number(p.bedrooms ?? 0);
    const m = Number(p.bathrooms ?? 0);
    const lb = Number(p.area ?? 0);
    const lt = Number(p.landArea ?? 0);
    const fl = Number(p.floors ?? 0);
    const loc = String((p.subLocation || p.location || '')).trim();
    return `KT ${b}, KM ${m}, LB ${lb} m², LT ${lt} m²\nLantai ${fl}\nFasilitas: ...\nLokasi: ${loc}\nCatatan: ...`;
  };

  const handleInsertTemplate = () => {
    setFormData(prev => ({
      ...prev,
      description: buildDescriptionTemplateFrom(prev as Partial<Property>),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Bangun payload yang sesuai validasi backend (tanpa placeholder default)
      const trimmed = (v: any) => (typeof v === 'string' ? v.trim() : v);
      const propertyData = {
        title: trimmed(formData.title),
        description: trimmed(formData.description),
        price: typeof formData.price === 'number' ? formData.price : parseInt(String(formData.price)) || 0,
        location: trimmed(formData.location),
        subLocation: trimmed(formData.subLocation) || trimmed(formData.location),
        type: formData.type,
        status: formData.status,
        bedrooms: typeof formData.bedrooms === 'number' ? formData.bedrooms : parseInt(String(formData.bedrooms)) || 0,
        bathrooms: typeof formData.bathrooms === 'number' ? formData.bathrooms : parseInt(String(formData.bathrooms)) || 0,
        area: typeof formData.area === 'number' ? formData.area : parseInt(String(formData.area)) || 0,
        landArea: typeof formData.landArea === 'number' ? formData.landArea : parseInt(String(formData.landArea as any)) || 0,
        floors: typeof formData.floors === 'number' ? formData.floors : parseInt(String(formData.floors as any)) || 0,
        images: formData.images && formData.images.length > 0 ? formData.images : ['/images/p1.png'],
        features: formData.garage ? [...(formData.features || []), 'Garasi'] : (formData.features || []),
        whatsappNumber: trimmed(formData.whatsappNumber),
        igUrl: trimmed(formData.igUrl) || undefined,
        tiktokUrl: trimmed(formData.tiktokUrl) || undefined,
        // add tour url to payload
        tourUrl: trimmed(formData.tourUrl) || undefined,
        financing: {
          dpPercent: Number(((formData as any).financing?.dpPercent ?? 10)),
          tenorYears: Number(((formData as any).financing?.tenorYears ?? 20)),
          fixedYears: Number(((formData as any).financing?.fixedYears ?? 3)),
          bookingFee: Number(((formData as any).financing?.bookingFee ?? 15000000)),
          ppnPercent: Number(((formData as any).financing?.ppnPercent ?? 11)),
        },
      } as Partial<Property>;

      // Validasi ringan di sisi klien agar sesuai aturan backend
      const validationErrors: string[] = [];
      if (!propertyData.title || (propertyData.title as string).length < 1 || (propertyData.title as string).length > 255) {
        validationErrors.push('Judul harus 1-255 karakter');
      }
      if (!Number.isFinite(propertyData.price as number)) {
        validationErrors.push('Harga harus berupa angka');
      } else if ((propertyData.price as number) <= 0) {
        validationErrors.push('Harga harus lebih dari 0');
      }
      if (!propertyData.location) {
        validationErrors.push('Lokasi wajib diisi');
      }
      if (!propertyData.subLocation) {
        validationErrors.push('Sub lokasi wajib diisi');
      }
      if (!['rumah', 'apartemen', 'tanah', 'ruko'].includes(propertyData.type as string)) {
        validationErrors.push('Tipe harus salah satu dari: rumah, apartemen, tanah, ruko');
      }
      if (!['dijual', 'disewa'].includes(propertyData.status as string)) {
        validationErrors.push('Status harus salah satu dari: dijual, disewa');
      }
      const isNonNegInt = (n: any) => Number.isInteger(n) && n >= 0;
      // Validasi KT/KM/LB dilonggarkan karena diarahkan ke Deskripsi
      if (!isNonNegInt(propertyData.floors)) {
        validationErrors.push('Jumlah lantai wajib diisi dan bilangan bulat ≥ 0');
      }
      if (!propertyData.whatsappNumber) {
        validationErrors.push('Nomor WhatsApp wajib diisi');
      }

      // Validasi Parameter Pembiayaan
      const fin = (propertyData as any).financing as { dpPercent: number; tenorYears: number; fixedYears: number; bookingFee: number; ppnPercent?: number };
      if (fin) {
        if (!Number.isFinite(fin.dpPercent) || fin.dpPercent < 5 || fin.dpPercent > 50) {
          validationErrors.push('DP harus antara 5–50%');
        }
        if (!Number.isFinite(fin.tenorYears) || fin.tenorYears < 5 || fin.tenorYears > 30) {
          validationErrors.push('Tenor harus antara 5–30 tahun');
        }
        if (!Number.isFinite(fin.fixedYears) || fin.fixedYears < 1 || fin.fixedYears > 10) {
          validationErrors.push('Bunga fix harus antara 1–10 tahun');
        }
        if (!Number.isFinite(fin.bookingFee) || fin.bookingFee < 0) {
          validationErrors.push('Booking fee harus ≥ 0');
        }
        if (fin.ppnPercent !== undefined) {
          if (!Number.isFinite(fin.ppnPercent) || fin.ppnPercent < 0 || fin.ppnPercent > 100) {
            validationErrors.push('PPN harus antara 0–100%');
          }
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors([]);
      onSave(propertyData as Property);
    } catch (error: any) {
      console.error('Form submission error:', error);
      alert(`An error occurred while saving the property: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {property ? 'Edit Properti' : 'Tambah Properti Baru'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <IoClose size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.length > 0 && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <ul className="list-disc pl-5">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gambar Properti (boleh lebih dari satu)
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Tip: pilih beberapa gambar sekaligus atau ulangi upload.
              </p>
            </div>
          </div>

          {(formData.images?.length || 0) > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {formData.images!.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                    title="Hapus gambar ini"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Properti *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Contoh: Rumah Mewah 3 Kamar Tidur"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Properti *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Tipe</option>
              <option value="rumah">Rumah</option>
              <option value="apartemen">Apartemen</option>
              <option value="tanah">Tanah</option>
              <option value="ruko">Ruko</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dijual">Dijual</option>
              <option value="disewa">Disewa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Contoh: 450000000"
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Contoh: Jababeka, Cikarang"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Lokasi *
            </label>
            <input
              type="text"
              name="subLocation"
              value={formData.subLocation}
              onChange={handleInputChange}
              placeholder="Contoh: Jababeka"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Parameter Pembiayaan */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Parameter Pembiayaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Persentase DP */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Persentase DP</label>
                <span className="text-lg font-bold text-blue-600">{((formData as any).financing?.dpPercent ?? 10)}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={((formData as any).financing?.dpPercent ?? 10)}
                onChange={(e) => updateFinancing({ dpPercent: Number(e.target.value) })}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Tenor Cicilan */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Tenor Cicilan (Tahun)</label>
                <span className="text-lg font-bold text-green-600">{((formData as any).financing?.tenorYears ?? 20)} Thn</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={((formData as any).financing?.tenorYears ?? 20)}
                onChange={(e) => updateFinancing({ tenorYears: Number(e.target.value) })}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5 Thn</span>
                <span>30 Thn</span>
              </div>
            </div>

            {/* Bunga Fix */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Bunga Fix (Tahun)</label>
                <span className="text-lg font-bold text-amber-600">{((formData as any).financing?.fixedYears ?? 3)} Thn</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={((formData as any).financing?.fixedYears ?? 3)}
                onChange={(e) => updateFinancing({ fixedYears: Number(e.target.value) })}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 Thn</span>
                <span>10 Thn</span>
              </div>
            </div>

            {/* PPN (%) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">PPN (%)</label>
                <span className="text-lg font-bold text-purple-600">{((formData as any).financing?.ppnPercent ?? 11)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={((formData as any).financing?.ppnPercent ?? 11)}
                onChange={(e) => updateFinancing({ ppnPercent: Number(e.target.value) })}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Booking Fee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <label className="text-sm font-semibold text-gray-700">Booking Fee (Rp)</label>
              <input
                type="number"
                min={0}
                value={((formData as any).financing?.bookingFee ?? 15000000)}
                onChange={(e) => updateFinancing({ bookingFee: Number(e.target.value) })}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">Masukkan nominal booking fee.</p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Input KT/KM dihapus; arahkan info tersebut ke Deskripsi */}
          {/* Input Luas Bangunan (LB) dihapus; arahkan detail LB ke Deskripsi */}

          {/* Input Luas Tanah (LT) dihapus; arahkan detail LT ke Deskripsi */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp *
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              placeholder="Contoh: 6281234567890"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Lantai
            </label>
            <input
              type="number"
              name="floors"
              value={formData.floors ?? 0}
              onChange={handleInputChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram (opsional)
            </label>
            <input
              type="url"
              name="igUrl"
              value={formData.igUrl || ''}
              onChange={handleInputChange}
              placeholder="https://instagram.com/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TikTok (opsional)
            </label>
            <input
              type="url"
              name="tiktokUrl"
              value={formData.tiktokUrl || ''}
              onChange={handleInputChange}
              placeholder="https://tiktok.com/@username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              House Tour (opsional)
            </label>
            <input
              type="url"
              name="tourUrl"
              value={formData.tourUrl || ''}
              onChange={handleInputChange}
              placeholder="https://facebook.com/... atau link lainnya"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <button type="button" onClick={handleInsertTemplate} className="text-xs px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
              Gunakan template
            </button>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder={"Contoh format:\nKT 3, KM 2, LB 120 m², LT 150 m²\nLantai 2\nFasilitas: carport, taman, kitchen set\nLokasi: dekat tol, sekolah\nCatatan: bisa KPR, nego"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Tips: pisahkan poin dengan baris baru atau koma; kartu akan merapikan otomatis.</p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="garage"
            checked={formData.garage}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Memiliki Garasi
          </label>
        </div>

        {/* Color Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warna Tag Tipe
            </label>
            <select
              name="colorType"
              value={formData.colorType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bg-green-600">Hijau</option>
              <option value="bg-blue-600">Biru</option>
              <option value="bg-purple-600">Ungu</option>
              <option value="bg-orange-600">Orange</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warna Tag Status
            </label>
            <select
              name="colorStatus"
              value={(formData as any).colorStatus || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bg-blue-800">Biru</option>
              <option value="bg-red-600">Merah</option>
              <option value="bg-green-600">Hijau</option>
              <option value="bg-purple-600">Ungu</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || state.loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting || state.loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4"></div>
                {property ? 'Menyimpan...' : 'Menambahkan...'}
              </>
            ) : (
              <>
                <IoAdd className="w-4 h-4" />
                {property ? 'Update Properti' : 'Tambah Properti'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
