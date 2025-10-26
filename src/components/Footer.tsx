import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="
        bg-white text-gray-900 py-16 px-8 md:px-16 lg:px-24 
        border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]
      "
    >
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 border-b border-gray-200 pb-12">
        <div>
          <h2 className="text-3xl font-semibold">
            Punya <span className="bg-yellow-300 px-1">pertanyaan?</span>
          </h2>
          {/* <p className="text-2xl mt-2">Kontak kami!</p> */}
          <a
                href="/contact"
                className="text-2xl mt-2"
              >
                Kontak kami!
              </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 text-sm">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 mt-1" />
            <div>
              <p className="font-medium">Nomor Telepon</p>
              <p>+62 82220005543</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 mt-1" />
            <div>
              <p className="font-medium">Alamat Email</p>
              <p>adaproperty8899@gmail.comgine</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-1" />
            <div>
              <p className="font-medium">Alamat Kantor</p>
              <p>
                Jl. Cimandiri 1B Blok V No.9<br /> 
                Graha Asri Jababeka, Cikarang Timur, Kab. Bekasi, Jawa Barat 17823
              </p>
              {/* <a
                href="#"
                className="underline text-sm text-gray-800 hover:text-black"
              >
                Get Direction
              </a> */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
        {/* Products */}
        {/* <div>
          <h3 className="font-semibold text-xl mb-4">Products</h3>
          <ul className="space-y-2 text-gray-700">
            <li>Filling Machines</li>
            <li>Bottle Filling Series</li>
            <li>Package Machines</li>
            <li>Linear Machines</li>
            <li>Rotary Machines</li>
          </ul>
        </div> */}

        {/* Solutions */}
        {/* <div>
          <h3 className="font-semibold text-xl mb-4">Solutions</h3>
          <ul className="space-y-2 text-gray-700">
            <li>End of Line Solutions</li>
            <li>Food Industry Machines Software</li>
            <li>Research Solutions</li>
            <li>Conveyor Solutions</li>
            <li>Special Solutions Your Needs</li>
          </ul>
        </div> */}

        {/* Corporate */}
        {/* <div>
          <h3 className="font-semibold text-xl mb-4">Corporate</h3>
          <ul className="space-y-2 text-gray-700">
            <li>About Us</li>
            <li>Our Values</li>
            <li>Human Resources</li>
            <li>News</li>
            <li>Contact</li>
          </ul>
        </div> */}

        {/* Career Opportunities */}
        {/* <div>
          <h3 className="font-semibold text-xl mb-4">Career Opportunities</h3>
          <p className="text-gray-700 text-sm mb-3">
            Cake pudding lollipop pastry cupcake chocolate. Gummi bears halvah{" "}
            <a href="#" className="underline">
              sesame snaps
            </a>
            .
          </p>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 rounded-md flex items-center gap-2">
            Opening Positions
            <span className="text-lg">→</span>
          </button>
        </div> */}
      </div>
    </footer>
  );
}
