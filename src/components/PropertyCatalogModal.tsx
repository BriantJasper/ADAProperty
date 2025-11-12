import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Property } from "../types/Property";
import { X, CheckCircle2, Home as HomeIcon, Building2 } from "lucide-react";

interface PropertyCatalogModalProps {
  property: Property;
  onClose: () => void;
}

const formatCurrency = (n?: number) => {
  if (!n || isNaN(n)) return "0";
  return n.toLocaleString("id-ID");
};

const formatText = (txt?: string) =>
  (txt || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const PropertyCatalogModal: React.FC<PropertyCatalogModalProps> = ({
  property,
  onClose,
}) => {
  const price = property.price || 0;
  const ppnRate = (property.financing?.ppnPercent ?? 11) / 100;
  const dpRate = (property.financing?.dpPercent ?? 10) / 100;
  const bookingFee = property.financing?.bookingFee ?? 15000000;

  const ppn = Math.round(price * ppnRate);
  const hargaPlusPpn = price + ppn;
  const dp = Math.round(price * dpRate);
  const sisaDp = Math.max(dp - bookingFee, 0);

  // Perkiraan angsuran: bunga 7% tenor sesuai properti
  const interestRate = 0.07;
  const tenorYears = property.financing?.tenorYears ?? 20;
  const fixedYears = property.financing?.fixedYears ?? 3;
  const monthlyRate = interestRate / 12;
  const months = tenorYears * 12;
  const principal = hargaPlusPpn - dp; // setelah DP dibayar
  const installment =
    principal > 0 && monthlyRate > 0
      ? Math.round(
          (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
        )
      : 0;

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["/images/p1.png"];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdropVariants}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative max-w-3xl w-[94%] md:w-[80%] bg-white rounded-2xl shadow-2xl overflow-hidden border border-yellow-500/30"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalVariants}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          {/* Header image */}
          <div className="relative">
            <img
              src={images[0]}
              alt={property.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-3 right-3">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white p-2"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="absolute bottom-3 left-3 bg-white/90 rounded-md px-3 py-2 shadow">
              <p className="text-sm font-semibold text-gray-900">
                {property.location}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 md:p-6">
            {/* Title */}
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Tipe: {formatText(property.type)}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {formatText(property.title || property.location)}
                </p>
              </div>
            </div>

            {/* Specs + Finance */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Specs left */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-200 text-gray-700">
                    LT
                  </span>
                  <span className="text-gray-700">Lebar Tanah</span>
                  <span className="ml-auto font-semibold text-gray-900">
                    {property.landArea ?? 0} m²
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HomeIcon className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700">Lebar Bangunan</span>
                  <span className="ml-auto font-semibold text-gray-900">
                    {property.area} m²
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700">Lantai</span>
                  <span className="ml-auto font-semibold text-gray-900">
                    {property.floors ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-200 text-gray-700">
                    🌿
                  </span>
                  <span className="text-gray-700">Backyard</span>
                  <span className="ml-auto font-semibold text-gray-900">-</span>
                </div>
              </div>

              {/* Finance right */}
              <div className="rounded-md border border-gray-300">
                <div className="grid grid-cols-2 gap-x-2 text-sm">
                  <div className="col-span-1 px-3 py-2 text-gray-700">
                    Harga + PPN
                  </div>
                  <div className="col-span-1 px-3 py-2 text-right font-semibold text-gray-900">
                    Rp {formatCurrency(hargaPlusPpn)}
                  </div>
                  <div className="col-span-1 px-3 py-2 text-gray-700">
                    PPN {Math.round(ppnRate * 100)} %
                  </div>
                  <div className="col-span-1 px-3 py-2 text-right font-semibold text-gray-900">
                    Rp {formatCurrency(ppn)}
                  </div>
                  <div className="col-span-1 px-3 py-2 text-gray-700">
                    Harga - PPN
                  </div>
                  <div className="col-span-1 px-3 py-2 text-right font-semibold text-gray-900">
                    Rp {formatCurrency(price)}
                  </div>
                  <div className="col-span-1 px-3 py-2 text-gray-700">
                    DP {Math.round(dpRate * 100)} %
                  </div>
                  <div className="col-span-1 px-3 py-2 text-right font-semibold text-gray-900">
                    Rp {formatCurrency(dp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking / Angsuran section */}
            <div className="mt-3 rounded-md bg-gray-100 border border-gray-300">
              <div className="grid grid-cols-2 gap-x-2 text-sm">
                <div className="col-span-1 px-3 py-2 font-semibold text-gray-900">
                  booking Fee
                </div>
                <div className="col-span-1 px-3 py-2 text-right font-bold text-yellow-700">
                  Rp {formatCurrency(bookingFee)}
                </div>
                <div className="col-span-1 px-3 py-2 font-semibold text-gray-900">
                  Sisa DP
                </div>
                <div className="col-span-1 px-3 py-2 text-right font-bold text-green-700">
                  {sisaDp === 0 ? "Free" : `Rp ${formatCurrency(sisaDp)}`}
                </div>
                <div className="col-span-1 px-3 py-2 font-semibold text-gray-900">
                  Angsuran
                </div>
                <div className="col-span-1 px-3 py-2 text-right font-bold text-blue-700">
                  Rp {formatCurrency(installment)}
                </div>
                <div className="col-span-1 px-3 py-2 text-gray-700">Selama</div>
                <div className="col-span-1 px-3 py-2 text-right text-gray-900">
                  {fixedYears} tahun
                </div>
                <div className="col-span-1 px-3 py-2 text-gray-700">Tenor</div>
                <div className="col-span-1 px-3 py-2 text-right text-gray-900">
                  {tenorYears} tahun
                </div>
              </div>
            </div>

            {/* Promo */}
            {property.features && property.features.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Promo:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {property.features.map((f, idx) => (
                    <div
                      key={`feat2-${idx}`}
                      className="flex items-start gap-2 text-sm bg-white rounded-md border border-gray-200 px-3 py-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                      <span className="text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              {property.whatsappNumber && (
                <a
                  href={`https://wa.me/${
                    property.whatsappNumber
                  }?text=${encodeURIComponent(
                    `Halo, saya tertarik dengan properti ${property.title} di ${property.location}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700"
                >
                  Hubungi via WhatsApp
                </a>
              )}
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-gray-200 px-4 py-3 text-gray-900 font-semibold hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Perhitungan angsuran bersifat perkiraan untuk ilustrasi. Detail
              final mengikuti kebijakan bank/developer.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PropertyCatalogModal;
