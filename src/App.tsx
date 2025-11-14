import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import ComparisonPage from "./pages/ComparisonPage";
import LoginPage from "./pages/LoginPage";
import PropertiesPage from "./pages/PropertiesPage";
import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import ConsignPage from "./pages/ConsignPage";
import Navbar from "./components/Navbar";
import RotateToLandscape from "./components/RotateToLandscape";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();
  const hideFooter =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/ada-admin");

  return (
    <AppProvider>
      <Toaster
        position="top-right"
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="min-h-screen">
        <RotateToLandscape />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Hidden admin login route */}
            <Route path="/ada-admin" element={<LoginPage />} />
            <Route path="/consign" element={<ConsignPage />} />
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
