import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoClose, IoSearch, IoSave, IoStar } from "react-icons/io5";
import type { Property } from "../types/Property";
import toast from "react-hot-toast";

interface FeaturedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onUpdate: (id: string, isFeatured: boolean) => Promise<void>;
}

const FeaturedManagerModal: React.FC<FeaturedManagerModalProps> = ({
  isOpen,
  onClose,
  properties,
  onUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      const featured = new Set(
        properties.filter((p) => p.isFeatured).map((p) => p.id)
      );
      setSelectedIds(featured);
      setInitialIds(new Set(featured)); // Clone for comparison
      setSearchQuery("");
    }
  }, [isOpen, properties]);

  const filteredProperties = properties
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aSelected = selectedIds.has(a.id);
      const bSelected = selectedIds.has(b.id);
      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Find changed items
      const changes: { id: string; isFeatured: boolean }[] = [];

      // Check for newly featured
      selectedIds.forEach((id) => {
        if (!initialIds.has(id)) {
          changes.push({ id, isFeatured: true });
        }
      });

      // Check for un-featured
      initialIds.forEach((id) => {
        if (!selectedIds.has(id)) {
          changes.push({ id, isFeatured: false });
        }
      });

      if (changes.length === 0) {
        onClose();
        return;
      }

      // Process updates sequentially
      let successCount = 0;
      for (const change of changes) {
        try {
          await onUpdate(change.id, change.isFeatured);
          successCount++;
        } catch (error) {
          console.error(`Failed to update property ${change.id}`, error);
        }
      }

      if (successCount === changes.length) {
        toast.success("Berhasil memperbarui daftar featured!");
      } else if (successCount > 0) {
        toast.success(`Berhasil memperbarui ${successCount} properti.`);
      } else {
        toast.error("Gagal menyimpan perubahan.");
      }

      onClose();
    } catch (error) {
      console.error("Error saving featured properties:", error);
      toast.error("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <IoStar className="text-yellow-500" />
              Atur Featured Properties
            </h2>
            <p className="text-sm text-gray-500">
              Pilih properti yang akan ditampilkan di bagian Populer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari properti..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada properti yang ditemukan.
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isSelected = selectedIds.has(property.id);
                return (
                  <div
                    key={property.id}
                    onClick={() => toggleSelection(property.id)}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <IoStar className="w-4 h-4" />}
                    </div>

                    <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 bg-gray-200">
                      <img
                        src={
                          property.images && property.images.length > 0
                            ? property.images[0]
                            : "/images/p1.png"
                        }
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {property.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {property.location} • Rp{" "}
                        {property.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{selectedIds.size}</span>{" "}
            properti dipilih
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              disabled={saving}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <IoSave />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeaturedManagerModal;
