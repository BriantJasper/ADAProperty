import React, { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
} from "framer-motion";

const members = [
  {
    id: "m1",
    name: "John Anderson",
    role: "Chief Executive Officer",
    img: "/images/p1.png",
  },
  {
    id: "m2",
    name: "Sarah Mitchell",
    role: "Chief Operating Officer",
    img: "/images/p2.png",
  },
  {
    id: "m3",
    name: "Michael Chen",
    role: "Chief Technology Officer",
    img: "/images/p3.png",
  },
  {
    id: "m4",
    name: "Emma Rodriguez",
    role: "Head of Marketing",
    img: "/images/p2.png",
  },
  {
    id: "m5",
    name: "David Kumar",
    role: "Head of Sales",
    img: "/images/p1.png",
  },
  {
    id: "m6",
    name: "Lisa Thompson",
    role: "Head of Finance",
    img: "/images/p3.png",
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
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

export default function About() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax effect for hero image
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30 };
  const ySpring = useSpring(y, springConfig);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Tentang Kami
            </span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-2xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Membangun masa depan properti Indonesia dengan inovasi dan
            kepercayaan
          </motion.p>
        </div>

        {/* Decorative gradient orb */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Text Content */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-500">
              <motion.div
                className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />
              <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                Kami adalah perusahaan yang bergerak di bidang properti dengan
                komitmen menghadirkan hunian dan investasi yang bernilai tinggi.
                Dengan pengalaman dan dedikasi, kami selalu berusaha memberikan
                pilihan terbaik bagi pelanggan, mulai dari hunian nyaman, area
                komersial strategis, hingga properti investasi yang menjanjikan.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Bagi kami, properti bukan hanya bangunan, tetapi juga tentang
                membangun masa depan, kenyamanan, dan kepercayaan jangka panjang
                bersama klien.
              </p>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {[
                  { value: "500+", label: "Proyek" },
                  { value: "10+", label: "Tahun" },
                  { value: "1000+", label: "Klien" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center"
                    variants={fadeInScale}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Image with Parallax */}
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            variants={fadeInScale}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div style={{ y: ySpring, opacity }} className="relative">
              <img
                src="/images/hero-bg.png"
                alt="Tentang"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>

            {/* Floating badge */}
            <motion.div
              className="absolute top-8 right-8 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-semibold text-gray-800">
                Trusted Since 2014
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tim Kepemimpinan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dipimpin oleh para profesional berpengalaman dengan visi yang sama
              untuk menghadirkan properti berkualitas tinggi
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Hover overlay with social icons */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                    >
                      <div className="flex gap-3">
                        {["linkedin", "twitter"].map((social) => (
                          <motion.button
                            key={social}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="text-gray-700 text-xs font-medium">
                              {social === "linkedin" ? "in" : "X"}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      {member.role}
                    </p>

                    {/* Animated underline */}
                    <motion.div
                      className="h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 mt-4 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
