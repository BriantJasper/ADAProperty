import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { COMPANY_INFO } from "../constants/company";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3 || message.trim().length < 10) {
      setErrors("Nama minimal 3 karakter dan keluhan minimal 10 karakter.");
      return;
    }
    setErrors(null);

    // Send email
    const subject = encodeURIComponent("Kontak dari Website ADA Property");
    const body = encodeURIComponent(
      `Nama: ${name}\nKontak: ${emailPhone}\n\nPesan:\n${message}`
    );
    window.open(
      `mailto:${COMPANY_INFO.email}?subject=${subject}&body=${body}`,
      "_blank"
    );

    // Send WhatsApp message
    const waText = encodeURIComponent(
      `Halo Admin ADA Property, saya ${name}.\nKontak: ${emailPhone}\n\n${message}`
    );
    window.open(
      `https://wa.me/${COMPANY_INFO.whatsapp.number}?text=${waText}`,
      "_blank"
    );

    setSubmitted(true);
    setName("");
    setEmailPhone("");
    setMessage("");

    setTimeout(() => setSubmitted(false), 5000);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 right-10 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-80 h-80 bg-orange-300/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-yellow-400/20 border border-yellow-500/40 text-yellow-700 text-sm font-semibold mb-6">
            📞 Hubungi Kami
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
            Kami Siap
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600">
              {" "}
              Membantu Anda
            </span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Tim kami siap membantu Anda menemukan properti impian atau menjawab
            pertanyaan Anda
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-lg border border-yellow-200/50 p-8 space-y-6 hover:shadow-xl transition-shadow duration-300"
            variants={fadeInUp}
          >
            {errors && (
              <motion.div
                className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p className="font-medium">⚠️ {errors}</p>
              </motion.div>
            )}

            {submitted && (
              <motion.div
                className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p className="font-medium">
                  ✓ Pesan siap dikirim melalui Email dan WhatsApp!
                </p>
              </motion.div>
            )}

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nama Lengkap
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                  focusedField === "name"
                    ? "border-yellow-500 shadow-lg"
                    : "border-gray-200 hover:border-yellow-300"
                } focus:outline-none bg-white`}
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email / Nomor Telepon
              </label>
              <input
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
                onFocus={() => setFocusedField("contact")}
                onBlur={() => setFocusedField(null)}
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                  focusedField === "contact"
                    ? "border-yellow-500 shadow-lg"
                    : "border-gray-200 hover:border-yellow-300"
                } focus:outline-none bg-white`}
                placeholder="email@domain.com atau 08xxxxxxxxxx"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Pesan
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                className={`w-full border-2 rounded-xl px-4 py-3 min-h-[160px] transition-all duration-300 ${
                  focusedField === "message"
                    ? "border-yellow-500 shadow-lg"
                    : "border-gray-200 hover:border-yellow-300"
                } focus:outline-none bg-white resize-none`}
                placeholder="Ceritakan kebutuhan properti Anda atau ajukan pertanyaan..."
                required
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="w-5 h-5" />
              Kirim Pesan
            </motion.button>
          </motion.form>

          {/* Contact Info Cards */}
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Phone Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-yellow-200/50 p-8 hover:shadow-xl transition-all duration-300 group"
              variants={fadeInUp}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    Telepon
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Hubungi kami langsung untuk konsultasi cepat
                  </p>
                  <a
                    href={`tel:${COMPANY_INFO.whatsapp.number}`}
                    className="text-yellow-600 hover:text-orange-600 font-semibold transition-colors"
                  >
                    {COMPANY_INFO.whatsapp.displayNumber}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-yellow-200/50 p-8 hover:shadow-xl transition-all duration-300 group"
              variants={fadeInUp}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    Email
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Kirim email untuk pertanyaan detail
                  </p>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-yellow-600 hover:text-orange-600 font-semibold transition-colors"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Address Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-yellow-200/50 p-8 hover:shadow-xl transition-all duration-300 group"
              variants={fadeInUp}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    Kantor
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Kunjungi kantor kami untuk konsultasi tatap muka
                  </p>
                  <p className="text-gray-700 font-medium">
                    <a
                      href="https://maps.app.goo.gl/eTt8VyP9ZxiTPTgX9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-600 hover:text-orange-600 font-semibold transition-colors"
                    >
                      Jl. Cimandiri 1B Blok V No.9
                      <br />
                      Graha Asri Jababeka, Cikarang Timur, Kab. Bekasi, Jawa
                      Barat 17823
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Hours Card */}
            <motion.div
              className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-all duration-300 group"
              variants={fadeInUp}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-3">Jam Operasional</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Senin - Jumat</span>
                      <span>09:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sabtu</span>
                      <span>09:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Minggu</span>
                      <span>Tutup</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
