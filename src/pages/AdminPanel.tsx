import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoAdd,
  IoEye,
  IoEyeOff,
  IoHome,
  IoCart,
  IoSparkles,
  IoKey,
  IoSave,
  IoClose,
  IoReload,
  IoDownload,
} from "react-icons/io5";
import { useApp } from "../context/AppContext";
import PropertyForm from "../components/PropertyForm";
import PropertyCard from "../components/PropertyCard";
import ComparisonCart from "../components/ComparisonCart";
import type { Property } from "../types/Property";

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
        alert("Kredensial berhasil diubah!");
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
  const { state, updateProperty, addProperty, removeConsignment } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showComparisonCart, setShowComparisonCart] = useState(false);
  const [showChangeCredentialsForm, setShowChangeCredentialsForm] =
    useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

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
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10,
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

  const badgeVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 15,
      },
    },
  };

  const handleAddProperty = async (property: Property) => {
    const result = await addProperty(property);
    if (result.success) {
      alert("Properti berhasil ditambahkan!");
      setShowAddForm(false);
      setEditingProperty(null);
    } else {
      alert(`Gagal menambahkan properti: ${result.error}`);
    }
  };

  const handleUpdateProperty = async (property: Property) => {
    if (editingProperty) {
      console.log("Starting update, state.loading:", state.loading);
      const result = await updateProperty(editingProperty.id, property);
      console.log("Update complete, state.loading:", state.loading);
      if (result.success) {
        alert("Properti berhasil diupdate!");
        setEditingProperty(null);
      } else {
        alert(`Gagal mengupdate properti: ${result.error}`);
      }
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingProperty(null);
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
        className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-lg border-b border-gray-200/50"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center py-4 sm:py-6 gap-4">
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
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <motion.button
                onClick={() => setShowComparisonCart(!showComparisonCart)}
                className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl flex items-center gap-2 font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoCart className="text-xl" />
                Keranjang
                <AnimatePresence>
                  {state.comparisonCart.length > 0 && (
                    <motion.span
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ scale: 0 }}
                    >
                      {state.comparisonCart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                onClick={() =>
                  setShowChangeCredentialsForm(!showChangeCredentialsForm)
                }
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl flex items-center gap-2 font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoKey className="text-xl" />
                Ganti Kredensial
              </motion.button>

              <motion.button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-xl flex items-center gap-2 font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoAdd className="text-xl" />
                Tambah Properti
              </motion.button>
            </div>

            {/* Mobile & Tablet Buttons */}
            <div className="flex md:hidden items-center gap-2 justify-end flex-shrink-0">
              <motion.button
                onClick={() => setShowComparisonCart(!showComparisonCart)}
                className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:shadow-xl flex items-center gap-1 text-xs font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoCart className="text-base" />
                <AnimatePresence>
                  {state.comparisonCart.length > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ scale: 0 }}
                    >
                      {state.comparisonCart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
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
                onClick={() => setShowAddForm(true)}
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
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
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
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Dalam Komparasi
                </p>
                <motion.p
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {state.comparisonCart.length}
                </motion.p>
              </div>
              <div className="bg-purple-100 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <IoCart className="text-2xl sm:text-3xl text-purple-600" />
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
            className="flex justify-between items-center mb-4"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Inbox Titip Jual
              <span className="ml-3 text-lg text-emerald-600 font-normal">
                ({state.consignmentInbox.length})
              </span>
            </h2>
            <p className="text-sm text-gray-600">
              Pengajuan dari pengguna untuk ditinjau admin
            </p>
          </motion.div>
          {state.consignmentInbox.length === 0 ? (
            <motion.div
              className="bg-white rounded-2xl shadow p-6 border border-gray-100 text-center"
              variants={itemVariants}
            >
              <p className="text-gray-600">Belum ada pengajuan titip jual.</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {state.consignmentInbox.map((c, idx) => (
                <motion.div
                  key={c.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  variants={cardVariants}
                  whileHover="hover"
                  custom={idx}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {c.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {c.location}
                          {c.subLocation ? ` • ${c.subLocation}` : ""}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          c.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : c.status === "reviewed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {c.status === "pending"
                          ? "Menunggu"
                          : c.status === "reviewed"
                          ? "Ditinjau"
                          : "Disetujui"}
                      </span>
                    </div>

                    {c.images && c.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                        {c.images.slice(0, 5).map((src, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={src}
                              alt={`cs-${i}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <a
                              href={src}
                              download={`consign-${idx + 1}-${i + 1}.jpg`}
                              className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 p-1 rounded shadow opacity-0 group-hover:opacity-100 transition"
                              title="Unduh foto"
                            >
                              <IoDownload className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-gray-700 space-y-1 mb-3">
                      <p>
                        <span className="font-medium">Penjual:</span>{" "}
                        {c.sellerName}
                      </p>
                      <p>
                        <span className="font-medium">WA:</span>{" "}
                        {c.sellerWhatsapp}
                      </p>
                      {c.sellerEmail && (
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {c.sellerEmail}
                        </p>
                      )}
                      {typeof c.price === "number" && (
                        <p>
                          <span className="font-medium">Harga:</span> Rp{" "}
                          {c.price.toLocaleString("id-ID")}
                        </p>
                      )}
                      {c.bedrooms !== undefined && (
                        <p>
                          <span className="font-medium">KT:</span> {c.bedrooms}{" "}
                          • <span className="font-medium">KM:</span>{" "}
                          {c.bathrooms ?? 0}
                        </p>
                      )}
                      {c.area !== undefined && (
                        <p>
                          <span className="font-medium">LB:</span> {c.area} m²{" "}
                          {c.landArea ? `• LT: ${c.landArea} m²` : ""}
                        </p>
                      )}
                    </div>

                    {c.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {c.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`https://wa.me/${c.sellerWhatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Hubungi WA
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
                            },\n\nKami menindaklanjuti pengajuan titip jual untuk \"${
                              c.title
                            }\" di lokasi ${c.location}${
                              c.subLocation ? `, ${c.subLocation}` : ""
                            }.\n\nSilakan balas email ini untuk diskusi lebih lanjut.\n\nTerima kasih,\nADA Property\nWA: ${
                              c.sellerWhatsapp
                            }`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                        >
                          Hubungi Email
                        </a>
                      )}
                      {c.images && c.images.length > 0 && (
                        <button
                          onClick={() => {
                            const slug = (s: string) =>
                              s
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, "");
                            const base = slug(c.title || "foto");
                            c.images!.forEach((src, i) => {
                              try {
                                const a = document.createElement("a");
                                a.href = src;
                                const match = src.match(/^data:(image\/\w+);/);
                                const ext = match
                                  ? match[1].split("/")[1]
                                  : "jpg";
                                a.download = `${base}-${i + 1}.${ext}`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              } catch {}
                            });
                          }}
                          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                        >
                          Unduh Semua Foto
                        </button>
                      )}
                      <button
                        onClick={() => removeConsignment(c.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Add Form Section */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="mb-6 sm:mb-8 relative"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                {/* Loading Overlay for Add Form */}
                <AnimatePresence>
                  {state.loading && (
                    <motion.div
                      className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl z-[9999] flex items-center justify-center"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Properties Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-4 sm:mb-6" variants={itemVariants}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Daftar Properti
              <span className="ml-2 sm:ml-3 text-base sm:text-lg text-blue-600 font-normal">
                ({state.properties.length})
              </span>
            </h2>
          </motion.div>

          {state.properties.length === 0 ? (
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
                Belum ada properti
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                Mulai dengan menambahkan properti pertama Anda
              </p>
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
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={containerVariants}
            >
              {state.properties.map((property, index) => (
                <motion.div
                  key={`property-${property.id}`}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <PropertyCard
                    key={`property-card-${property.id}`}
                    property={property}
                    showAdminControls={true}
                    showComparisonButton={false}
                    showWhatsAppButton={false}
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
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(255,255,255,0.9)",
                  }}
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

        {/* Edit Form Section */}
        <AnimatePresence>
          {editingProperty && (
            <motion.div
              className="fixed top-[100px] left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full my-auto relative"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                {/* Loading Overlay */}
                <AnimatePresence>
                  {state.loading && (
                    <motion.div
                      className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl z-[9999] flex items-center justify-center"
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
                <div className="max-h-[80vh] overflow-y-auto">
                  <PropertyForm
                    property={editingProperty}
                    onSave={handleUpdateProperty}
                    onCancel={handleCancelForm}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change Credentials Form */}
        <AnimatePresence>
          {showChangeCredentialsForm && (
            <motion.div
              className="fixed top-[100px] left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full max-h-full overflow-y-auto my-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <ChangeCredentialsForm
                  onCancel={() => setShowChangeCredentialsForm(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Cart */}
        <AnimatePresence>
          {showComparisonCart && (
            <motion.div
              className="fixed top-[100px] left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-full overflow-y-auto my-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <ComparisonCart onClose={() => setShowComparisonCart(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
