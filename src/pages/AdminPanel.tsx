import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import {
  IoAdd,
  IoEye,
  IoEyeOff,
  IoHome,
  IoSparkles,
  IoKey,
  IoSave,
  IoClose,
  IoReload,
  IoDownload,
  IoChevronDown,
  IoChevronUp,
  IoStar,
  IoCheckbox,
  IoTrashBin,
} from "react-icons/io5";
import { useApp } from "../context/AppContext";
import ApiService from "../services/api";
import PropertyForm from "../components/PropertyForm";
import PropertyCard from "../components/PropertyCard";
import FeaturedManagerModal from "../components/FeaturedManagerModal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchBar from "../components/SearchBar";
import type { Property } from "../types/Property";
import { COMPANY_INFO } from "../constants/company";

// Komponen form untuk mengubah kredensial admin
const ChangeCredentialsForm: React.FC<{ onCancel: () => void }> = ({
  onCancel,
}) => {
  const { changeCredentials } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (!currentPassword || !newUsername || !newPassword || !confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const result = await changeCredentials(currentPassword, {
        username: newUsername,
        password: newPassword,
      });
      if (result.success) {
        toast.success("Kredensial berhasil diubah!");
        onCancel(); // Close the form
      } else {
        setError(result.error || "Gagal mengubah kredensial");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError("Terjadi kesalahan: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          Ubah Username & Password Admin
        </h3>
        <motion.button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <IoClose className="text-xl" />
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Password Saat Ini
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? (
                <IoEyeOff className="h-5 w-5" />
              ) : (
                <IoEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Username Baru
          </label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Password Baru
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
                <IoEyeOff className="h-5 w-5" />
              ) : (
                <IoEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <IoEyeOff className="h-5 w-5" />
              ) : (
                <IoEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            Batal
          </motion.button>
          <motion.button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <IoSave className="mr-1" />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const {
    state,
    updateProperty,
    addProperty,
    removeConsignment,
    loadConsignments,
    loadProperties,
  } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFeaturedManager, setShowFeaturedManager] = useState(false);
  const [showChangeCredentialsForm, setShowChangeCredentialsForm] =
    useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [downloadingZip, setDownloadingZip] = useState<string | null>(null);
  const [isConsignmentInboxCollapsed, setIsConsignmentInboxCollapsed] =
    useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [pendingDeletionIds, setPendingDeletionIds] = useState<string[]>([]);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertiesToDelete, setPropertiesToDelete] = useState<string[]>([]);

  // Helper function to download images as ZIP
  const downloadImagesAsZip = async (
    images: string[],
    title: string,
    downloadKey?: string
  ) => {
    if (!images || images.length === 0) return;

    const activeKey = downloadKey ?? title;

    // If only one image, download directly without ZIP
    if (images.length === 1) {
      try {
        setDownloadingZip(activeKey);
        const imageUrl = images[0];
        const slug = title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        // Extract file extension from URL
        const urlParts = imageUrl.split(".");
        const ext =
          urlParts.length > 1
            ? urlParts[urlParts.length - 1].split("?")[0]
            : "jpg";

        const downloadName = `${slug}.${ext}`;
        const response = await ApiService.downloadConsignmentImage(
          imageUrl,
          downloadName
        );
        const blob = await response.blob();

        // Use saveAs to trigger download
        saveAs(blob, downloadName);
      } catch (error) {
        toast.error("Gagal mengunduh gambar. Silakan coba lagi.");
      } finally {
        setDownloadingZip(null);
      }
      return;
    }

    // Multiple images - create ZIP
    try {
      setDownloadingZip(activeKey);
      const zip = new JSZip();
      const imgFolder = zip.folder("images");

      // Fetch all images and add to ZIP
      const promises = images.map(async (imageUrl, index) => {
        try {
          const response = await ApiService.downloadConsignmentImage(imageUrl);
          const blob = await response.blob();

          // Extract file extension from URL or default to jpg
          const urlParts = imageUrl.split(".");
          const ext =
            urlParts.length > 1
              ? urlParts[urlParts.length - 1].split("?")[0]
              : "jpg";

          // Create filename
          const filename = `image-${index + 1}.${ext}`;
          imgFolder?.file(filename, blob);
        } catch (error) {
          // Failed to fetch image
        }
      });

      await Promise.all(promises);

      // Generate ZIP and trigger download
      const content = await zip.generateAsync({ type: "blob" });

      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      saveAs(content, `${slug}-images.zip`);
    } catch (error) {
      toast.error("Gagal membuat file ZIP. Silakan coba lagi.");
    } finally {
      setDownloadingZip(null);
    }
  };

  // Filter properties based on search query and pending deletions
  const filteredProperties = state.properties
    .filter((p) => !pendingDeletionIds.includes(p.id))
    .filter((property) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        (property.subLocation &&
          property.subLocation.toLowerCase().includes(query)) ||
        property.type.toLowerCase().includes(query) ||
        property.status.toLowerCase().includes(query)
      );
    });

  // Load consignments when component mounts
  useEffect(() => {
    if (state.isAuthenticated && state.user?.role === "admin") {
      loadConsignments();
    }
  }, [state.isAuthenticated, state.user?.role, loadConsignments]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  };

  const handleAddProperty = async (property: Property) => {
    const result = await addProperty(property);
    if (result.success) {
      toast.success("Properti berhasil ditambahkan!");
      setShowAddForm(false);
      setEditingProperty(null);
    } else {
      toast.error(`Gagal menambahkan properti: ${result.error}`);
    }
  };

  const handleUpdateProperty = async (property: Property) => {
    if (editingProperty) {
      const result = await updateProperty(editingProperty.id, property);
      if (result.success) {
        toast.success("Properti berhasil diupdate!");
        setEditingProperty(null);
      } else {
        toast.error(`Gagal mengupdate properti: ${result.error}`);
      }
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingProperty(null);
  };

  const toggleSelection = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedPropertyIds.length === 0) return;
    setPropertiesToDelete([...selectedPropertyIds]);
    setShowDeleteConfirm(true);
  };

  const confirmBatchDelete = () => {
    const idsToDelete = [...propertiesToDelete];

    // Optimistically hide properties
    setPendingDeletionIds(idsToDelete);
    setSelectedPropertyIds([]);
    setIsSelectionMode(false);

    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    const doDelete = async () => {
      try {
        const result = await ApiService.batchDeleteProperties(idsToDelete);
        if (result.success) {
          await loadProperties();
          // Clear pending list only after reload to prevent flicker
          setPendingDeletionIds([]);
          toast.success(`${idsToDelete.length} properti berhasil dihapus!`);
        } else {
          toast.error(`Gagal menghapus properti: ${result.error}`);
          setPendingDeletionIds([]); // Restore on error
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat menghapus properti");
        setPendingDeletionIds([]); // Restore on error
      }
    };

    // Start undo timer (5 seconds)
    undoTimeoutRef.current = setTimeout(() => {
      doDelete();
    }, 5000);

    // Show toast with Undo button
    toast(
      (t) => (
        <div className="flex items-center gap-4 min-w-[300px] justify-between">
          <span className="font-medium">
            Menghapus {idsToDelete.length} properti...
          </span>
          <button
            onClick={() => {
              if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
              }
              setPendingDeletionIds([]);
              toast.dismiss(t.id);
              toast.success("Penghapusan dibatalkan");
            }}
            className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors shadow-sm"
          >
            Undo
          </button>
        </div>
      ),
      {
        duration: 5000,
        position: "bottom-center",
        style: {
          background: "#fff",
          color: "#333",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          padding: "12px 16px",
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          key="bg-element-1"
          className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          key="bg-element-2"
          className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="z-50 backdrop-blur-md bg-white/80 shadow-lg border-b border-gray-200/50"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-stretch sm:items-center py-4 sm:py-6 gap-4">
            <motion.div
              className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <IoSparkles className="text-3xl sm:text-4xl text-blue-600" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Kelola properti dengan mudah
                </p>
              </div>
            </motion.div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {isSelectionMode ? (
                <motion.button
                  onClick={handleBatchDelete}
                  disabled={selectedPropertyIds.length === 0}
                  className={`px-3 py-2 lg:px-6 lg:py-3 rounded-xl hover:shadow-xl flex items-center gap-1 lg:gap-2 text-sm lg:text-base font-semibold ${
                    selectedPropertyIds.length === 0
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                  }`}
                  variants={buttonVariants}
                  whileHover={
                    selectedPropertyIds.length > 0 ? "hover" : undefined
                  }
                  whileTap={selectedPropertyIds.length > 0 ? "tap" : undefined}
                >
                  <IoTrashBin className="text-lg lg:text-xl" />
                  Hapus ({selectedPropertyIds.length})
                </motion.button>
              ) : null}

              <motion.button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedPropertyIds([]);
                }}
                className={`px-3 py-2 lg:px-6 lg:py-3 rounded-xl hover:shadow-xl flex items-center gap-1 lg:gap-2 text-sm lg:text-base font-semibold ${
                  isSelectionMode
                    ? "bg-gray-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoCheckbox className="text-lg lg:text-xl" />
                {isSelectionMode ? "Batal" : "Pilih"}
              </motion.button>

              <motion.button
                onClick={() => setShowFeaturedManager(true)}
                className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 lg:px-6 lg:py-3 rounded-xl hover:shadow-xl flex items-center gap-1 lg:gap-2 text-sm lg:text-base font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoStar className="text-lg lg:text-xl" />
                Featured
              </motion.button>

              <motion.button
                onClick={() =>
                  setShowChangeCredentialsForm(!showChangeCredentialsForm)
                }
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 lg:px-6 lg:py-3 rounded-xl hover:shadow-xl flex items-center gap-1 lg:gap-2 text-sm lg:text-base font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoKey className="text-lg lg:text-xl" />
                Kredensial
              </motion.button>

              <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 lg:px-6 lg:py-3 rounded-xl hover:shadow-xl flex items-center gap-1 lg:gap-2 text-sm lg:text-base font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoAdd className="text-lg lg:text-xl" />
                Tambah
              </motion.button>
            </div>

            {/* Mobile & Tablet Buttons */}
            <div className="flex md:hidden items-center gap-2 justify-end flex-shrink-0">
              <motion.button
                onClick={() => setShowFeaturedManager(true)}
                className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-lg hover:shadow-xl flex items-center gap-1 text-xs font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoStar className="text-base" />
              </motion.button>

              <motion.button
                onClick={() =>
                  setShowChangeCredentialsForm(!showChangeCredentialsForm)
                }
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-2 rounded-lg hover:shadow-xl flex items-center justify-center"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title="Ganti Kredensial"
              >
                <IoKey className="text-base" />
              </motion.button>

              <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:shadow-xl flex items-center gap-1 text-xs font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoAdd className="text-base" />
                Tambah
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Total Properti
                </p>
                <motion.p
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  {state.properties.length}
                </motion.p>
              </div>
              <div className="bg-blue-100 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <IoHome className="text-2xl sm:text-3xl text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Properti Featured
                </p>
                <motion.p
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {state.properties.filter((p) => p.isFeatured).length}
                </motion.p>
              </div>
              <div className="bg-yellow-100 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <IoStar className="text-2xl sm:text-3xl text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Consignment Inbox Section */}
        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex justify-between items-center mb-4 cursor-pointer bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
            variants={itemVariants}
            onClick={() =>
              setIsConsignmentInboxCollapsed(!isConsignmentInboxCollapsed)
            }
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: isConsignmentInboxCollapsed ? 0 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isConsignmentInboxCollapsed ? (
                  <IoChevronDown className="text-2xl text-gray-600" />
                ) : (
                  <IoChevronUp className="text-2xl text-gray-600" />
                )}
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">
                Inbox Titip Jual
                <span className="ml-3 text-lg text-emerald-600 font-normal">
                  ({state.consignmentInbox.length})
                </span>
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadConsignments();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <IoReload className="w-4 h-4" />
                Muat Ulang
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Pengajuan dari pengguna untuk ditinjau admin
            </p>
          </motion.div>

          <AnimatePresence>
            {!isConsignmentInboxCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {state.consignmentInbox.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 text-center">
                    <p className="text-gray-600">
                      Belum ada pengajuan titip jual.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {state.consignmentInbox.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-shadow"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                          {/* Left Column: Images */}
                          <div className="lg:col-span-1">
                            {c.images && c.images.length > 0 ? (
                              <div className="space-y-2">
                                <div className="relative group">
                                  <img
                                    src={c.images[0]}
                                    alt={c.title}
                                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadImagesAsZip(
                                        [c.images![0]],
                                        `${c.title} main image`,
                                        `consignment-${c.id}-main`
                                      )
                                    }
                                    className="absolute top-1 right-1 bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition"
                                    title="Unduh foto utama"
                                  >
                                    <IoDownload className="w-4 h-4" />
                                  </button>
                                </div>
                                {c.images.length > 1 && (
                                  <div className="grid grid-cols-4 gap-1">
                                    {c.images.slice(1, 5).map((src, i) => (
                                      <div key={i} className="relative group">
                                        <img
                                          src={src}
                                          alt={`${c.title} ${i + 2}`}
                                          className="w-full h-12 object-cover rounded border border-gray-200"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            downloadImagesAsZip(
                                              [src],
                                              `${c.title} image ${i + 2}`,
                                              `consignment-${c.id}-image-${
                                                i + 1
                                              }`
                                            )
                                          }
                                          className="absolute inset-0 bg-black/50 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded"
                                        >
                                          <IoDownload className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadImagesAsZip(
                                      c.images!,
                                      c.title,
                                      `consignment-${c.id}`
                                    )
                                  }
                                  disabled={
                                    downloadingZip === `consignment-${c.id}`
                                  }
                                  className={`w-full px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition ${
                                    downloadingZip === `consignment-${c.id}`
                                      ? "bg-gray-400 cursor-not-allowed text-white"
                                      : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md"
                                  }`}
                                >
                                  {downloadingZip === `consignment-${c.id}` ? (
                                    <>
                                      <svg
                                        className="animate-spin h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Menyiapkan...
                                    </>
                                  ) : (
                                    <>
                                      <IoDownload className="w-4 h-4" />
                                      Unduh Semua ({c.images.length} foto)
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                <p className="text-gray-400 text-sm">
                                  Tidak ada gambar
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Middle Column: Property Details */}
                          <div className="lg:col-span-1 space-y-3">
                            <div>
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="text-lg font-bold text-gray-900 flex-1">
                                  {c.title}
                                </h3>
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    c.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : c.status === "reviewed"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {c.status === "pending"
                                    ? "⏱"
                                    : c.status === "reviewed"
                                    ? "👁"
                                    : "✓"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <span className="text-blue-600">📍</span>
                                {c.location}
                                {c.subLocation && (
                                  <span className="text-gray-500">
                                    • {c.subLocation}
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Property Type */}
                            {c.type && (
                              <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {c.type.charAt(0).toUpperCase() +
                                  c.type.slice(1)}
                              </div>
                            )}

                            {/* Price - FIXED */}
                            {typeof c.price === "number" && c.price > 0 && (
                              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-0.5">
                                  Harga Penawaran
                                </p>
                                <p className="text-xl font-bold text-emerald-700">
                                  Rp {c.price.toLocaleString("id-ID")}
                                </p>
                              </div>
                            )}

                            {/* Property Specifications */}
                            <div className="grid grid-cols-2 gap-2">
                              {c.bedrooms !== undefined && (
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-500">
                                    Kamar Tidur
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.bedrooms}
                                  </p>
                                </div>
                              )}
                              {c.bathrooms !== undefined && (
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-500">
                                    Kamar Mandi
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.bathrooms}
                                  </p>
                                </div>
                              )}
                              {c.area !== undefined && c.area > 0 && (
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-500">
                                    Luas Bangunan
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.area} m²
                                  </p>
                                </div>
                              )}
                              {c.landArea !== undefined && c.landArea > 0 && (
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-500">
                                    Luas Tanah
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.landArea} m²
                                  </p>
                                </div>
                              )}
                              {c.floors !== undefined && c.floors > 0 && (
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-500">
                                    Jumlah Lantai
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.floors} Lantai
                                  </p>
                                </div>
                              )}
                              {c.garage !== undefined && c.garage > 0 && (
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-500">
                                    Garasi
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.garage} Mobil
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {c.description && (
                              <div className="bg-gray-50 rounded p-2">
                                <p className="text-xs text-gray-500 mb-1 font-medium">
                                  Deskripsi
                                </p>
                                <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                                  {c.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Seller Info & Actions */}
                          <div className="lg:col-span-1 space-y-3">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
                              <h4 className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                                <span>👤</span>
                                Informasi Penjual
                              </h4>
                              <div className="space-y-1.5">
                                <div>
                                  <p className="text-xs text-gray-600">Nama</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.sellerName}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">
                                    WhatsApp
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {c.sellerWhatsapp}
                                  </p>
                                </div>
                                {c.sellerEmail && (
                                  <div>
                                    <p className="text-xs text-gray-600">
                                      Email
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 break-all">
                                      {c.sellerEmail}
                                    </p>
                                  </div>
                                )}
                                {c.createdAt && (
                                  <div>
                                    <p className="text-xs text-gray-600">
                                      Tanggal Pengajuan
                                    </p>
                                    <p className="text-xs font-semibold text-gray-900">
                                      {new Date(c.createdAt).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-1.5">
                              <a
                                href={`https://wa.me/${
                                  c.sellerWhatsapp
                                }?text=${encodeURIComponent(
                                  `Halo ${c.sellerName}, kami dari ${COMPANY_INFO.name} ingin menindaklanjuti pengajuan titip jual untuk "${c.title}" di ${c.location}.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-md transition"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                              </a>

                              {c.sellerEmail && (
                                <a
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                    c.sellerEmail
                                  )}&su=${encodeURIComponent(
                                    `Pengajuan Titip Jual: ${c.title}`
                                  )}&body=${encodeURIComponent(
                                    `Halo ${
                                      c.sellerName
                                    },\n\nKami menindaklanjuti pengajuan titip jual untuk "${
                                      c.title
                                    }" di lokasi ${c.location}${
                                      c.subLocation ? `, ${c.subLocation}` : ""
                                    }.\n\nSilakan balas email ini untuk diskusi lebih lanjut.\n\nTerima kasih,\n${
                                      COMPANY_INFO.name
                                    }\nWA: ${
                                      COMPANY_INFO.whatsapp.displayNumber
                                    }`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-md transition"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                  </svg>
                                  Email
                                </a>
                              )}

                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Apakah Anda yakin ingin menghapus pengajuan ini?"
                                    )
                                  ) {
                                    const result = await removeConsignment(
                                      c.id
                                    );
                                    if (result.success) {
                                      toast.success(
                                        "Pengajuan berhasil dihapus!"
                                      );
                                    } else {
                                      toast.error(
                                        `Gagal menghapus pengajuan: ${result.error}`
                                      );
                                    }
                                  }
                                }}
                                className="w-full px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-md transition"
                              >
                                <IoClose className="w-4 h-4" />
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Properties Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Daftar Properti
                <span className="ml-3 text-xl sm:text-2xl text-blue-600 font-normal">
                  ({filteredProperties.length})
                </span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Kelola dan cari properti dengan mudah
              </p>
            </div>

            {/* Search Bar - Centered with subtle design */}
            <div className="max-w-3xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari properti berdasarkan judul, lokasi, tipe, atau status..."
              />
              {searchQuery && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-gray-600 mt-3 text-center"
                >
                  Mencari:{" "}
                  <span className="font-semibold text-blue-700">
                    "{searchQuery}"
                  </span>
                </motion.p>
              )}
            </div>
          </motion.div>

          {filteredProperties.length === 0 ? (
            <motion.div
              className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow-lg"
              variants={itemVariants}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <IoHome
                  size={48}
                  className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4"
                />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {searchQuery
                  ? "Tidak ada properti yang sesuai"
                  : "Belum ada properti"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                {searchQuery
                  ? `Tidak ditemukan properti yang cocok dengan "${searchQuery}"`
                  : "Mulai dengan menambahkan properti pertama Anda"}
              </p>
              {!searchQuery && (
                <motion.button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-xl flex items-center gap-2 mx-auto text-sm sm:text-base font-semibold"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <IoAdd className="text-lg sm:text-xl" />
                  Tambah Properti Pertama
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={containerVariants}
            >
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={`property-${property.id}`}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                  variants={cardVariants}
                  custom={index}
                >
                  <PropertyCard
                    key={`property-card-${property.id}`}
                    property={property}
                    showAdminControls={true}
                    showComparisonButton={false}
                    showWhatsAppButton={false}
                    onEdit={(prop) => setEditingProperty(prop)}
                    selectable={isSelectionMode}
                    isSelected={selectedPropertyIds.includes(property.id)}
                    onToggleSelect={() => toggleSelection(property.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Admin Guide */}
        <AnimatePresence>
          <motion.div
            className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h3
              className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 flex items-center gap-2"
              animate={{
                x: [0, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <IoSparkles className="text-xl sm:text-2xl text-yellow-500" />
              Panduan Admin Panel
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-blue-900">
              {[
                {
                  icon: "➕",
                  title: "Tambah Properti",
                  desc: "Klik tombol hijau untuk menambah properti baru",
                },
                {
                  icon: "✏️",
                  title: "Edit Properti",
                  desc: "Klik tombol edit pada kartu untuk mengubah data",
                },
                {
                  icon: "🗑️",
                  title: "Hapus Properti",
                  desc: "Hapus properti yang tidak diperlukan",
                },
                {
                  icon: "📊",
                  title: "Komparasi",
                  desc: "Bandingkan hingga 3 properti sekaligus",
                },
                {
                  icon: "🔑",
                  title: "Ubah Kredensial",
                  desc: "Ubah username dan password admin",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  // ...existing code...
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-sm sm:text-base font-semibold mb-1">
                        {item.title}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals - Outside main content container */}
      {/* Add Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelForm}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tambah Properti Baru
                  </h2>
                  <button
                    onClick={handleCancelForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IoClose className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 relative">
                  <AnimatePresence>
                    {state.loading && (
                      <motion.div
                        className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl z-[9999] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="text-center">
                          <motion.div
                            className="inline-block"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <IoReload className="text-5xl text-blue-600" />
                          </motion.div>
                          <motion.p
                            className="mt-4 text-gray-700 font-semibold"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            Menambahkan properti...
                          </motion.p>
                          <p className="text-sm text-gray-500 mt-1">
                            Mohon tunggu sebentar
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <PropertyForm
                    onSave={handleAddProperty}
                    onCancel={handleCancelForm}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {editingProperty && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelForm}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit Properti
                  </h2>
                  <button
                    onClick={handleCancelForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IoClose className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 relative">
                  <AnimatePresence>
                    {state.loading && (
                      <motion.div
                        className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl z-[9999] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="text-center">
                          <motion.div
                            className="inline-block"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <IoReload className="text-5xl text-blue-600" />
                          </motion.div>
                          <motion.p
                            className="mt-4 text-gray-700 font-semibold"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            Menyimpan perubahan...
                          </motion.p>
                          <p className="text-sm text-gray-500 mt-1">
                            Mohon tunggu sebentar
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <PropertyForm
                    property={editingProperty}
                    onSave={handleUpdateProperty}
                    onCancel={handleCancelForm}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Credentials Form */}
      <AnimatePresence>
        {showChangeCredentialsForm && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowChangeCredentialsForm(false)}
          >
            <motion.div
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ChangeCredentialsForm
                onCancel={() => setShowChangeCredentialsForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Manager Modal */}
      <FeaturedManagerModal
        isOpen={showFeaturedManager}
        onClose={() => setShowFeaturedManager(false)}
        properties={state.properties}
        onUpdate={async (id, isFeatured) => {
          await updateProperty(id, { isFeatured });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmBatchDelete}
        title="Hapus Properti?"
        message={`Apakah Anda yakin ingin menghapus ${propertiesToDelete.length} properti yang dipilih? Anda memiliki 5 detik untuk membatalkan setelah konfirmasi.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default AdminPanel;
