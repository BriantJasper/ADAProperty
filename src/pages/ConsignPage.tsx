import { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import ApiService from "../services/api";
import type { ConsignmentRequest } from "../types/Consignment";
import toast from "react-hot-toast";

export default function ConsignPage() {
  const { addConsignment } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<
    Omit<ConsignmentRequest, "id" | "createdAt" | "status">
  >({
    sellerName: "",
    sellerWhatsapp: "",
    sellerEmail: "",
    title: "",
    description: "",
    price: undefined,
    location: "",
    subLocation: "",
    type: "rumah",
    bedrooms: undefined,
    bathrooms: undefined,
    area: undefined,
    landArea: undefined,
    floors: undefined,
    garage: undefined,
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState<string>("");

  const formatNumber = (num: number | string): string => {
    const numStr = String(num).replace(/\D/g, "");
    if (!numStr) return "";
    return Number(numStr).toLocaleString("id-ID");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-digits
    if (value === "") {
      setForm((prev) => ({ ...prev, price: undefined }));
      setPriceDisplay("");
    } else {
      const numValue = Number(value);
      setForm((prev) => ({ ...prev, price: numValue }));
      setPriceDisplay(`Rp ${formatNumber(value)}`);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    // Special handling for WhatsApp: keep only digits for cleaner UX
    if (name === "sellerWhatsapp") {
      const digitsOnly = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, sellerWhatsapp: digitsOnly }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]:
        [
          "bedrooms",
          "bathrooms",
          "area",
          "landArea",
          "floors",
          "garage",
        ].includes(name) && value !== ""
          ? Number(value)
          : value,
    }));
  };

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Convert FileList to Array and limit to 5 files
      const filesArray = Array.from(files).slice(0, 5);

      // Upload files to server
      const res = await ApiService.uploadImages(filesArray);

      if (res?.success && Array.isArray(res.data)) {
        setForm((prev) => {
          const existing = prev.images ?? [];
          const merged = [...existing, ...res.data];
          if (merged.length > 5) {
            toast.error("Maksimal 5 foto. Foto tambahan diabaikan.");
            return { ...prev, images: merged.slice(0, 5) };
          }
          toast.success(`${res.data.length} foto berhasil diunggah`);
          return { ...prev, images: merged };
        });
        // reset input agar bisa memilih file yang sama lagi jika perlu
        e.target.value = "";
      } else {
        toast.error(res?.error || "Gagal mengunggah gambar.");
      }
    } catch (err: any) {
      toast.error("Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Convert FileList to Array and limit to 5 files
      const filesArray = Array.from(files).slice(0, 5);

      // Upload files to server
      const res = await ApiService.uploadImages(filesArray);

      if (res?.success && Array.isArray(res.data)) {
        setForm((prev) => {
          const existing = prev.images ?? [];
          const merged = [...existing, ...res.data];
          if (merged.length > 5) {
            toast.error("Maksimal 5 foto. Foto tambahan diabaikan.");
            return { ...prev, images: merged.slice(0, 5) };
          }
          toast.success(`${res.data.length} foto berhasil diunggah`);
          return { ...prev, images: merged };
        });
      } else {
        toast.error(res?.error || "Gagal mengunggah gambar.");
      }
    } catch (err: any) {
      toast.error("Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const imgs = (prev.images ?? []).slice();
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validations
    if (!form.sellerName || !form.sellerWhatsapp) {
      toast.error("Nama penjual dan nomor WhatsApp wajib diisi.");
      return;
    }
    if (!form.title || !form.location) {
      toast.error("Judul properti dan lokasi wajib diisi.");
      return;
    }
    if (form.images && form.images.length > 5) {
      toast.error("Maksimal 5 foto.");
      return;
    }

    // Set submitting state
    setSubmitting(true);

    try {
      // Normalize WhatsApp number to start with country code 62
      const rawWa = (form.sellerWhatsapp || "").replace(/\D/g, "");
      let nationalWa = rawWa;
      if (rawWa.startsWith("+62")) {
        nationalWa = rawWa.slice(3);
      } else if (rawWa.startsWith("62")) {
        nationalWa = rawWa.slice(2);
      } else if (rawWa.startsWith("0")) {
        nationalWa = rawWa.slice(1);
      }
      const payload = { ...form, sellerWhatsapp: `62${nationalWa}` };

      const resp = await addConsignment(payload);
      if (resp.success) {
        toast.success(
          "Pengajuan titip jual berhasil dikirim! Admin akan menghubungi Anda segera.",
          { duration: 4000 }
        );
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: "smooth" });
        // reset minimal fields
        setPriceDisplay("");
        setForm((prev) => ({
          ...prev,
          title: "",
          description: "",
          price: undefined,
          location: "",
          subLocation: "",
          bedrooms: undefined,
          bathrooms: undefined,
          area: undefined,
          landArea: undefined,
          floors: undefined,
          garage: undefined,
          images: [],
        }));
      } else {
        toast.error(
          resp.error || "Gagal mengirim pengajuan. Silakan coba lagi."
        );
      }
    } catch (err: any) {
      toast.error(
        "Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Titip Jual Properti</h1>
      <p className="text-gray-600 mb-6">
        Isi form berikut untuk menitipkan properti Anda. Pengajuan akan masuk ke
        inbox untuk ditinjau dan kami akan menghubungi Anda.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Penjual *
            </label>
            <input
              name="sellerName"
              value={form.sellerName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nomor WhatsApp *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l border border-r-0 bg-gray-50 text-gray-600 text-sm">
                +62
              </span>
              <input
                name="sellerWhatsapp"
                value={form.sellerWhatsapp}
                onChange={handleChange}
                className="w-full border border-l-0 rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="812xxxxxxx"
                inputMode="numeric"
                pattern="\d*"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Masukkan nomor tanpa awalan 0
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="sellerEmail"
            type="email"
            value={form.sellerEmail ?? ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="nama@contoh.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Judul Properti *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Rumah 2 Lantai di Jababeka"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
            <input
              name="price"
              value={priceDisplay}
              onChange={handlePriceChange}
              className="w-full border rounded px-3 py-2"
              type="text"
              placeholder="200.000.000"
            />
            {form.price && (
              <p className="text-xs text-gray-500 mt-1">
                Rp {form.price.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Lokasi *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Kota/Kawasan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sub Lokasi</label>
            <input
              name="subLocation"
              value={form.subLocation ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Perumahan/Cluster"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipe</label>
            <select
              name="type"
              value={form.type ?? "rumah"}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="rumah">Rumah</option>
              <option value="ruko">Ruko</option>
              <option value="apartemen">Apartement</option>
              <option value="kavling">Kavling</option>
              <option value="gudang">Gudang</option>
              <option value="pabrik">Pabrik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Kamar Tidur
            </label>
            <input
              name="bedrooms"
              value={form.bedrooms ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="number"
              min={0}
              placeholder="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Kamar Mandi
            </label>
            <input
              name="bathrooms"
              value={form.bathrooms ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="number"
              min={0}
              placeholder="2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Luas Bangunan (m²)
            </label>
            <input
              name="area"
              value={form.area ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="number"
              min={0}
              placeholder="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Luas Tanah (m²)
            </label>
            <input
              name="landArea"
              value={form.landArea ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="number"
              min={0}
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Jumlah Lantai
            </label>
            <input
              name="floors"
              value={form.floors ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="number"
              min={0}
              placeholder="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Garasi (Mobil)
            </label>
            <input
              name="garage"
              value={form.garage ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="number"
              min={0}
              placeholder="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Ceritakan keunggulan properti Anda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Foto (maks 5) — Admin akan unggah ulang saat disetujui
          </label>
          <div
            className={`relative border-2 ${
              isDragging ? "border-blue-500" : "border-dashed border-gray-300"
            } rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-gray-600">
              Klik untuk memilih foto atau seret & jatuhkan ke sini
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maksimal 5 foto. Format: JPG/PNG
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="hidden"
            />
          </div>

          {uploading && (
            <p className="text-sm text-gray-500 mt-2">Memproses gambar...</p>
          )}
          {form.images && form.images.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">
                Foto terpilih: {form.images.length}/5
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {form.images.slice(0, 5).map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt={`upload-${idx}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 px-2 py-1 text-xs rounded shadow opacity-0 group-hover:opacity-100 transition"
                      title="Hapus foto"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className={`px-6 py-3 rounded shadow font-medium transition-all ${
              submitting || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                Mengirim...
              </span>
            ) : uploading ? (
              "Menunggu upload gambar..."
            ) : (
              "Kirim Pengajuan"
            )}
          </button>
          {(submitting || uploading) && (
            <p className="text-sm text-gray-500 mt-2">
              {uploading
                ? "Sedang mengunggah gambar, mohon tunggu..."
                : "Sedang memproses pengajuan Anda..."}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
