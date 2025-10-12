import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAdd, IoEye, IoEyeOff, IoHome, IoCart, IoSparkles } from 'react-icons/io5';

// Mock context and types for demonstration
const mockState = {
  properties: [],
  comparisonCart: [],
  isAdminMode: true
};

const mockDispatch = () => {};

const AdminPanel: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showComparisonCart, setShowComparisonCart] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [properties] = useState([
    { id: 1, name: 'Villa Modern', price: 2500000000, location: 'Bali' },
    { id: 2, name: 'Apartemen Mewah', price: 1500000000, location: 'Jakarta' },
    { id: 3, name: 'Rumah Keluarga', price: 1200000000, location: 'Bandung' }
  ]);
  const [comparisonCart] = useState([]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const badgeVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    }
  };

  const glowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.5)",
        "0 0 40px rgba(59, 130, 246, 0.8)",
        "0 0 20px rgba(59, 130, 246, 0.5)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
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
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center gap-4"
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
                  ease: "linear"
                }}
              >
                <IoSparkles className="text-4xl text-blue-600" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Kelola properti dengan mudah</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg transition-all ${
                  isAdminMode
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                animate={isAdminMode ? glowVariants.animate : {}}
              >
                {isAdminMode ? <IoEye className="text-xl" /> : <IoEyeOff className="text-xl" />}
                {isAdminMode ? 'Admin Active' : 'Admin Inactive'}
              </motion.button>

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
                  {comparisonCart.length > 0 && (
                    <motion.span
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      exit={{ scale: 0 }}
                    >
                      {comparisonCart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
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
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Properti</p>
                <motion.p
                  className="text-3xl font-bold text-gray-900 mt-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  {properties.length}
                </motion.p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <IoHome className="text-3xl text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Dalam Komparasi</p>
                <motion.p
                  className="text-3xl font-bold text-gray-900 mt-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {comparisonCart.length}
                </motion.p>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl">
                <IoCart className="text-3xl text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Status Mode</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isAdminMode ? 'Admin' : 'Guest'}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isAdminMode ? 'bg-green-100' : 'bg-gray-100'}`}>
                {isAdminMode ? (
                  <IoEye className="text-3xl text-green-600" />
                ) : (
                  <IoEyeOff className="text-3xl text-gray-600" />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Add Form Section */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tambah Properti Baru</h3>
                <p className="text-gray-600">Form untuk menambahkan properti akan ditampilkan di sini...</p>
                <motion.button
                  onClick={() => setShowAddForm(false)}
                  className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tutup
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Properties Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex justify-between items-center mb-6"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Daftar Properti
              <span className="ml-3 text-lg text-blue-600 font-normal">({properties.length})</span>
            </h2>
            <motion.div
              className="px-4 py-2 bg-blue-50 rounded-lg text-sm font-medium text-blue-700"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {isAdminMode ? '🔓 Semua fitur tersedia' : '🔒 Mode tampilan saja'}
            </motion.div>
          </motion.div>

          {properties.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
              variants={itemVariants}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <IoHome size={64} className="mx-auto text-gray-300 mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum ada properti
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan menambahkan properti pertama Anda
              </p>
              <motion.button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-xl flex items-center gap-2 mx-auto font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoAdd className="text-xl" />
                Tambah Properti Pertama
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-black/20"
                      whileHover={{ opacity: 0 }}
                    />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium opacity-90">{property.location}</p>
                      <h3 className="text-xl font-bold">{property.name}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      Rp {(property.price / 1000000000).toFixed(1)}M
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Lihat Detail
                      </motion.button>
                      {isAdminMode && (
                        <motion.button
                          className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium"
                          whileHover={{ scale: 1.05, backgroundColor: "#fee2e2" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Admin Guide */}
        <AnimatePresence>
          {isAdminMode && (
            <motion.div
              className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h3
                className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2"
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <IoSparkles className="text-yellow-500" />
                Panduan Admin Panel
              </motion.h3>
              <div className="grid md:grid-cols-2 gap-4 text-blue-900">
                {[
                  { icon: "➕", title: "Tambah Properti", desc: "Klik tombol hijau untuk menambah properti baru" },
                  { icon: "✏️", title: "Edit Properti", desc: "Klik tombol edit pada kartu untuk mengubah data" },
                  { icon: "🗑️", title: "Hapus Properti", desc: "Hapus properti yang tidak diperlukan" },
                  { icon: "📊", title: "Komparasi", desc: "Bandingkan hingga 3 properti sekaligus" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/60 backdrop-blur-sm p-4 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.9)" }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold mb-1">{item.title}</p>
                        <p className="text-sm text-blue-700">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;