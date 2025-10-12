import React, { useState, useEffect } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // simple validation
    if (name.trim().length < 3 || message.trim().length < 10) {
      setErrors("Nama minimal 3 karakter dan keluhan minimal 10 karakter.");
      return;
    }
    setErrors(null);

    // submit via email and WhatsApp deep link
    const subject = encodeURIComponent("Kontak ADA Property");
    const body = encodeURIComponent(
      `Nama: ${name}\nKontak: ${emailPhone}\n\nPesan:\n${message}`
    );
    // open mail client
    window.open(
      `mailto:hello@adaproperty.com?subject=${subject}&body=${body}`,
      "_blank"
    );
    // open WhatsApp (ganti nomor tujuan bila perlu)
    const phone = "6281234567890";
    const waText = encodeURIComponent(
      `Halo Admin, saya ${name}.\nKontak: ${emailPhone}\n\n${message}`
    );
    window.open(`https://wa.me/${phone}?text=${waText}`, "_blank");

    alert("Pesan siap dikirim melalui Email dan WhatsApp. Terima kasih!");
    setName("");
    setEmailPhone("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div
        className={`max-w-6xl mx-auto px-6 py-16 relative z-10 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tim kami siap membantu Anda menemukan properti impian atau menjawab
            pertanyaan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 hover:shadow-3xl transition-shadow duration-300"
          >
            {errors && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded animate-pulse">
                <p className="font-medium">⚠️ {errors}</p>
              </div>
            )}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-all duration-300 ${
                  focusedField === "name"
                    ? "border-blue-500 shadow-lg scale-105"
                    : "border-gray-300"
                } hover:border-blue-400`}
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email / Nomor Telepon
              </label>
              <input
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
                onFocus={() => setFocusedField("contact")}
                onBlur={() => setFocusedField(null)}
                className={`w-full border-2 rounded-lg px-4 py-3 transition-all duration-300 ${
                  focusedField === "contact"
                    ? "border-blue-500 shadow-lg scale-105"
                    : "border-gray-300"
                } hover:border-blue-400`}
                placeholder="email@domain.com atau 08xxxxxxxxxx"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pesan
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                className={`w-full border-2 rounded-lg px-4 py-3 min-h-[160px] transition-all duration-300 ${
                  focusedField === "message"
                    ? "border-blue-500 shadow-lg scale-105"
                    : "border-gray-300"
                } hover:border-blue-400`}
                placeholder="Ceritakan kebutuhan properti Anda atau ajukan pertanyaan..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg py-4 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              Kirim Pesan
            </button>
          </form>

          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">
                    Telepon
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Hubungi kami langsung untuk konsultasi cepat
                  </p>
                  <a
                    href="tel:+6281234567890"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    +62 812-3456-7890
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">
                    Email
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Kirim email untuk pertanyaan detail
                  </p>
                  <a
                    href="mailto:hello@adaproperty.com"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    hello@adaproperty.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">
                    Kantor
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Kunjungi kantor kami untuk konsultasi tatap muka
                  </p>
                  <p className="text-gray-700 font-medium">
                    Jl. Contoh Raya No. 1<br />
                    Jakarta, Indonesia
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <h3 className="font-bold text-2xl mb-3">Jam Operasional</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Senin - Jumat</span>
                  <span>09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sabtu</span>
                  <span>09:00 - 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Minggu</span>
                  <span>Tutup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
