import { Mail, MapPin, Phone, Instagram, Facebook, Music } from "lucide-react";
import { COMPANY_INFO } from "../constants/company";

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
          <a href="/contact" className="text-2xl mt-2">
            Kontak kami!
          </a>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row gap-8 text-sm">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-1" />
              <div>
                <p className="font-medium">Nomor Telepon</p>
                <p>{COMPANY_INFO.whatsapp.displayNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-1" />
              <div>
                <p className="font-medium">Alamat Email</p>
                <p>{COMPANY_INFO.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1" />
              <div>
                <p className="font-medium">Alamat Kantor</p>
                <p>
                  {COMPANY_INFO.address.street}
                  <br />
                  {COMPANY_INFO.address.area}, {COMPANY_INFO.address.city},{" "}
                  {COMPANY_INFO.address.province}{" "}
                  {COMPANY_INFO.address.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Ikuti Kami</h3>
            <div className="flex gap-4">
              <a
                href={COMPANY_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors text-sm"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </a>

              <a
                href={COMPANY_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
                <span>Facebook</span>
              </a>

              <a
                href={COMPANY_INFO.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors text-sm"
                title="TikTok"
              >
                <Music className="w-5 h-5" />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
        {/* Placeholder for future content */}
      </div>
    </footer>
  );
}
