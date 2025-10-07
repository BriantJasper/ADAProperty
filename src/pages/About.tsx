import React from 'react';

const members = [
  { id: 'm1', name: 'Nama', img: '/images/p1.png' },
  { id: 'm2', name: 'Nama', img: '/images/p2.png' },
  { id: 'm3', name: 'Nama', img: '/images/p3.png' },
  { id: 'm4', name: 'Nama', img: '/images/p2.png' },
  { id: 'm5', name: 'Nama', img: '/images/p1.png' },
  { id: 'm6', name: 'Nama', img: '/images/p3.png' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero/Heading */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Tentang Kami</h1>

        {/* Top section: text left, image right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-xl shadow p-6 leading-relaxed text-gray-700">
            <p className="mb-3">
              Kami adalah perusahaan yang bergerak di bidang properti dengan komitmen menghadirkan hunian dan investasi yang bernilai tinggi. Dengan pengalaman dan dedikasi, kami selalu berusaha memberikan pilihan terbaik bagi pelanggan, mulai dari hunian nyaman, area komersial strategis, hingga properti investasi yang menjanjikan.
            </p>
            <p>
              Bagi kami, properti bukan hanya bangunan, tetapi juga tentang membangun masa depan, kenyamanan, dan kepercayaan jangka panjang bersama klien.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow">
            <img src="/images/hero-bg.png" alt="Tentang" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Members */}
        <h2 className="text-2xl font-bold mt-12 mb-6">Anggota</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100">
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 text-center">
                <div className="font-semibold">{m.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


