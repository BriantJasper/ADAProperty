import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Settings, LogOut, Menu, X } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const compareCount = state.comparisonCart.length;
  const onAdmin = location.pathname.startsWith("/admin");
  const onAbout = location.pathname.startsWith("/about");
  const onComparison = location.pathname.startsWith("/comparison");
  const onContact = location.pathname.startsWith("/contact");
  const onConsign = location.pathname.startsWith("/consign");
  const onLogin =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/ada-admin");
  // Use solid (sticky) navbar on specific pages to avoid overlaying content
  const useSolid =
    onAdmin || onAbout || onComparison || onContact || onConsign || onLogin;

  const handleCompareClick = () => {
    navigate("/comparison");
  };

  const handleAdminClick = () => {
    if (state.isAuthenticated && state.user?.role === "admin") {
      navigate("/admin");
    }
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  // Hidden shortcut: Ctrl+Alt+A opens admin login via secret route
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.altKey &&
        (e.code === "KeyA" || e.key.toLowerCase() === "a")
      ) {
        navigate("/ada-admin");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const linkBase = useSolid
    ? "text-gray-700 hover:text-yellow-600"
    : "text-white hover:text-yellow-300";
  const headerClass = useSolid
    ? "sticky top-0 left-0 right-0 z-50 bg-white border-b shadow"
    : "absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md";
  const iconBtn = useSolid
    ? "p-2.5 rounded-lg bg-gray-100 hover:bg-yellow-100 text-gray-700 hover:text-yellow-600 transition-all duration-200"
    : "p-2.5 rounded-lg bg-white/20 hover:bg-yellow-400/30 text-white transition-all duration-200";
  const cartBtn = (highlight: boolean) =>
    highlight
      ? "p-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/30 transition-all duration-200"
      : useSolid
      ? "p-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-200"
      : "p-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-200";

  return (
    <header className={headerClass}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-12 w-auto"
                src="/images/logo.png"
                alt="ADA Property"
              />
            </Link>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div className="ml-2 flex items-center space-x-8">
              <Link
                to="/"
                className={`${linkBase} font-medium transition-colors`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`${linkBase} font-medium transition-colors whitespace-nowrap`}
              >
                Tentang Kami
              </Link>
              <Link
                to="/properties"
                className={`${linkBase} font-medium transition-colors`}
              >
                Properti
              </Link>
              <Link
                to="/consign"
                className={`${linkBase} font-medium text-yellow-500 hover:text-yellow-700 whitespace-nowrap`}
              >
                Jual Properti
              </Link>
              <Link
                to="/contact"
                className={`${linkBase} font-medium transition-colors whitespace-nowrap`}
              >
                Kontak Kami
              </Link>
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Logout (only when authenticated) */}
            {state.isAuthenticated && (
              <button
                onClick={handleLogout}
                className={
                  useSolid
                    ? "p-2.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200"
                    : "p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white transition-all duration-200"
                }
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}

            {/* Admin Button: visible only for admins */}
            {state.isAuthenticated && state.user?.role === "admin" && (
              <button
                onClick={handleAdminClick}
                className={iconBtn}
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            {/* Compare / Cart Button */}
            <button
              onClick={handleCompareClick}
              className={`relative transition-all duration-200 ${cartBtn(
                compareCount >= 3
              )}`}
              title="Komparasi Properti"
            >
              <ShoppingCart className="w-5 h-5" />
              {/* Badge */}
              {compareCount > 0 && (
                <span
                  className={`
                    absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center
                    ${
                      compareCount >= 3
                        ? "bg-red-500 text-white"
                        : useSolid
                        ? "bg-yellow-500 text-white"
                        : "bg-yellow-400 text-gray-900"
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
              className={
                useSolid
                  ? "p-2 rounded-lg text-gray-700 hover:bg-yellow-100"
                  : "p-2 rounded-lg text-white hover:bg-white/10"
              }
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className={`md:hidden pb-4 ${
              useSolid ? "bg-white" : "bg-white/10 backdrop-blur-md"
            }`}
          >
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`${linkBase} font-medium`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`${linkBase} font-medium`}
                onClick={() => setIsOpen(false)}
              >
                Tentang Kami
              </Link>
              <Link
                to="/properties"
                className={`${linkBase} font-medium`}
                onClick={() => setIsOpen(false)}
              >
                Properti
              </Link>
              <Link
                to="/contact"
                className={`${linkBase} font-medium`}
                onClick={() => setIsOpen(false)}
              >
                Kontak Kami
              </Link>
              <Link
                to="/consign"
                className={`${linkBase} font-medium`}
                onClick={() => setIsOpen(false)}
              >
                Jual Properti
              </Link>
              {/* Admin Panel link only for admins */}
              {state.isAuthenticated && state.user?.role === "admin" && (
                <button
                  onClick={() => {
                    handleAdminClick();
                    setIsOpen(false);
                  }}
                  className={`${linkBase} font-medium text-left`}
                >
                  Admin Panel
                </button>
              )}
              {/* Logout for any authenticated user */}
              {state.isAuthenticated && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className={`${linkBase} font-medium text-left`}
                >
                  Logout
                </button>
              )}
              <button
                onClick={() => {
                  handleCompareClick();
                  setIsOpen(false);
                }}
                className={`${linkBase} font-medium text-left flex items-center gap-2`}
              >
                <ShoppingCart className="w-4 h-4" />
                Komparasi ({compareCount})
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
