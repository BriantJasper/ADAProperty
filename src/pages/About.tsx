import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
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
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden pt-32 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated gradient orbs - ADA brand colors */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-yellow-400/15 to-yellow-300/10 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-yellow-500/10 to-orange-300/8 rounded-full blur-3xl"
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

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-yellow-400/20 border border-yellow-500/40 text-yellow-700 text-sm font-semibold mb-6">
              ✨ Tentang ADA Property
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-600">
              Membangun Masa Depan
            </span>
            <br />
            <span className="text-gray-900">Properti Indonesia</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-700 max-w-2xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Dengan inovasi, dedikasi, dan kepercayaan sebagai fondasi, kami
            menghadirkan solusi properti yang bernilai tinggi dan berkelanjutan.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Text Content */}
          <motion.div className="space-y-6" variants={fadeInUp}>
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-yellow-400/20 transition-all duration-500">
              {/* Accent bar */}
              <motion.div
                className="w-16 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mb-6 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />

              <p className="text-gray-700 leading-relaxed mb-4 text-lg font-light">
                Kami adalah perusahaan yang bergerak di bidang properti dengan
                komitmen menghadirkan hunian dan investasi yang bernilai tinggi.
                Dengan pengalaman dan dedikasi, kami selalu berusaha memberikan
                pilihan terbaik bagi pelanggan, mulai dari hunian nyaman, area
                komersial strategis, hingga properti investasi yang menjanjikan.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg font-light">
                Bagi kami, properti bukan hanya bangunan, tetapi juga tentang
                membangun masa depan, kenyamanan, dan kepercayaan jangka panjang
                bersama klien.
              </p>

              {/* Stats with icons */}
              {/* <motion.div
                className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-yellow-400/20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {[
                  { value: "500+", label: "Proyek", icon: TrendingUp },
                  { value: "10+", label: "Tahun", icon: Award },
                  { value: "1000+", label: "Klien", icon: Users },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      className="text-center group/stat cursor-pointer"
                      variants={fadeInScale}
                      whileHover={{ scale: 1.08, y: -4 }}
                    >
                      <div className="inline-block p-2 rounded-lg bg-yellow-400/20 group-hover/stat:bg-yellow-500/30 transition-all mb-3">
                        <Icon className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">
                        {stat.label}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div> */}
            </div>
          </motion.div>

          {/* Image with Parallax */}
          <motion.div
            className="relative rounded-3xl overflow-hidden shadow-lg group"
            variants={fadeInScale}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <img
                src="/images/hero-bg.png"
                alt="Tentang ADA Property"
                className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-yellow-600/5 to-transparent" />
            </div>

            {/* Floating badge with glow */}
            {/* <motion.div
              className="absolute top-8 right-8 bg-white/95 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-yellow-400/50"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">
                🏆 Trusted Since 2014
              </span>
            </motion.div> */}
          </motion.div>
        </motion.div>

        {/* Team Section removed as requested */}
      </div>
    </div>
  );
}
