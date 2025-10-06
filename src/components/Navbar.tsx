import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [compareCount] = useState(1); // Example: default 2 items

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="flex-shrink-0">
              <img
                className="h-12 w-auto"
                src="../images/logo.png"
                alt="ADA Property"
              />
            </a>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div className="ml-2 flex items-center space-x-8">
              <Link
                to="/"
                className="text-white hover:text-gray-200 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-gray-200 font-medium transition-colors whitespace-nowrap"
              >
                Tentang Kami
              </Link>
              <Link
                to="/properties"
                className="text-white hover:text-gray-200 font-medium transition-colors"
              >
                Properti
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-gray-200 font-medium transition-colors whitespace-nowrap"
              >
                Kontak Kami
              </Link>
            </div>
          </div>

          {/* Compare / Cart Button */}
          <div className="hidden md:block relative">
            <button
              className={`
                p-2 rounded-full backdrop-blur-sm transition-all
                ${
                  compareCount >= 3
                    ? "bg-yellow-400 text-black"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }
              `}
            >
              <ShoppingCart className="w-6 h-6" />
              {/* Badge */}
              {compareCount > 0 && (
                <span
                  className={`
                    absolute -top-1 -right-1 text-xs font-semibold rounded-full px-1.5 py-0.5 
                    ${
                      compareCount >= 3
                        ? "bg-red-500 text-white"
                        : "bg-yellow-400 text-black"
                    }
                  `}
                >
                  {compareCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-white hover:bg-white/10"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-white hover:text-gray-200 font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-gray-200 font-medium"
              >
                Tentang Kami
              </Link>
              <Link
                to="/properties"
                className="text-white hover:text-gray-200 font-medium"
              >
                Properti
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-gray-200 font-medium"
              >
                Kontak Kami
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
