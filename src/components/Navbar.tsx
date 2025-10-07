import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Settings, LogOut, LogIn } from "lucide-react";
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const compareCount = state.comparisonCart.length;
  const onAdmin = location.pathname.startsWith('/admin');
  const onAbout = location.pathname.startsWith('/about');
  const onComparison = location.pathname.startsWith('/comparison');
  const onContact = location.pathname.startsWith('/contact');
  const useSolid = onAdmin || onAbout || onComparison || onContact;

  const handleCompareClick = () => {
    navigate('/comparison');
  };

  const handleAdminClick = () => {
    if (state.isAuthenticated && state.user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const linkBase = useSolid
    ? "text-gray-700 hover:text-blue-600"
    : "text-white hover:text-gray-200";
  const headerClass = useSolid
    ? "sticky top-0 left-0 right-0 z-50 bg-white border-b shadow"
    : "absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md";
  const iconBtn = useSolid
    ? "p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
    : "p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all";
  const cartBtn = (highlight: boolean) =>
    highlight
      ? (useSolid ? "bg-yellow-400 text-black" : "bg-yellow-400 text-black")
      : (useSolid ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-white/20 hover:bg-white/30 text-white");

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
                to="/contact"
                className={`${linkBase} font-medium transition-colors whitespace-nowrap`}
              >
                Kontak Kami
              </Link>
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Login/Logout Button */}
            {state.isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={useSolid ? "p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-all" : "p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white transition-all"}
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className={iconBtn}
                title="Login"
              >
                <LogIn className="w-6 h-6" />
              </button>
            )}

            {/* Admin Button */}
            <button
              onClick={handleAdminClick}
              className={iconBtn}
              title={state.isAuthenticated && state.user?.role === 'admin' ? "Admin Panel" : "Login Admin"}
            >
              <Settings className="w-6 h-6" />
            </button>

            {/* Compare / Cart Button */}
            <button
              onClick={handleCompareClick}
              className={`
                p-2 rounded-full backdrop-blur-sm transition-all relative
                ${cartBtn(compareCount >= 3)}
              `}
              title="Komparasi Properti"
            >
              <ShoppingCart className="w-6 h-6" />
              {/* Badge */}
              {compareCount > 0 && (
                <span
                  className={`
                    absolute -top-1 -right-1 text-xs font-semibold rounded-full px-1.5 py-0.5 
                    ${compareCount >= 3 ? "bg-red-500 text-white" : (useSolid ? "bg-yellow-400 text-black" : "bg-yellow-400 text-black")}
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
              className={useSolid ? "p-2 rounded-md text-gray-700 hover:bg-gray-100" : "p-2 rounded-md text-white hover:bg-white/10"}
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
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-gray-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Tentang Kami
              </Link>
              <Link
                to="/properties"
                className="text-white hover:text-gray-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Properti
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-gray-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Kontak Kami
              </Link>
              <button
                onClick={() => {
                  handleAdminClick();
                  setIsOpen(false);
                }}
                className="text-white hover:text-gray-200 font-medium text-left"
              >
                {state.isAuthenticated && state.user?.role === 'admin' ? 'Admin Panel' : 'Login Admin'}
              </button>
              {state.isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-white hover:text-gray-200 font-medium text-left"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleLogin();
                    setIsOpen(false);
                  }}
                  className="text-white hover:text-gray-200 font-medium text-left"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => {
                  handleCompareClick();
                  setIsOpen(false);
                }}
                className="text-white hover:text-gray-200 font-medium text-left flex items-center gap-2"
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