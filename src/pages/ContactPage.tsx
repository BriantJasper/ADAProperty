import React, { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // simple validation
    if (name.trim().length < 3 || message.trim().length < 10) {
      setErrors('Nama minimal 3 karakter dan keluhan minimal 10 karakter.');
      return;
    }
    setErrors(null);

    // submit via email and WhatsApp deep link
    const subject = encodeURIComponent('Kontak ADA Property');
    const body = encodeURIComponent(`Nama: ${name}\nKontak: ${emailPhone}\n\nPesan:\n${message}`);
    // open mail client
    window.open(`mailto:hello@adaproperty.com?subject=${subject}&body=${body}`, '_blank');
    // open WhatsApp (ganti nomor tujuan bila perlu)
    const phone = '6281234567890';
    const waText = encodeURIComponent(`Halo Admin, saya ${name}.\nKontak: ${emailPhone}\n\n${message}`);
    window.open(`https://wa.me/${phone}?text=${waText}`, '_blank');

    alert('Pesan siap dikirim melalui Email dan WhatsApp. Terima kasih!');
    setName('');
    setEmailPhone('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Kontak Kami</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          {errors && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-4 py-2"
              placeholder="Nama Lengkap"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email / Nomor telepon</label>
            <input
              value={emailPhone}
              onChange={(e) => setEmailPhone(e.target.value)}
              className="w-full border rounded-md px-4 py-2"
              placeholder="email@domain.com atau 08xxxxxxxxxx"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-md px-4 py-3 min-h-[160px]"
              placeholder="Tulis keluhan atau pertanyaan Anda"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md py-3">
            Submit
          </button>
        </form>

        {/* Info sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-2">Pertanyaan?</h3>
            <p className="text-gray-600">Hubungi kami untuk bantuan terkait properti.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-2">Kontak</h3>
            <p className="text-gray-600">Tel: +62 812-3456-7890</p>
            <p className="text-gray-600">Email: hello@adaproperty.com</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-2">Kantor Pusat</h3>
            <p className="text-gray-600">Jl. Contoh Raya No. 1, Jakarta</p>
          </div>
        </div>
      </div>
    </div>
  );
}


