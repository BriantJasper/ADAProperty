import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import AdminPanel from './pages/AdminPanel'
import ComparisonPage from './pages/ComparisonPage'
import LoginPage from './pages/LoginPage'
import PropertiesPage from './pages/PropertiesPage'
import About from './pages/About'
import ContactPage from './pages/ContactPage'
import ConsignPage from './pages/ConsignPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { AppProvider } from './context/AppContext'

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
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
        <Footer />
      </div>
    </AppProvider>
  )
}

export default App