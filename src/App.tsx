import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import ComparisonPage from "./pages/ComparisonPage";
import LoginPage from "./pages/LoginPage";
import PropertiesPage from "./pages/PropertiesPage";
import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./context/AppContext";

function App() {
  const location = useLocation();
  const hideFooter =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/ada-admin");

  return (
    <AppProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Hidden admin login route */}
            <Route path="/ada-admin" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        {!hideFooter && <Footer />}
      </div>
    </AppProvider>
  );
}

export default App;
