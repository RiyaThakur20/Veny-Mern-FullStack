import { Routes, Route, Navigate, BrowserRouter as Router, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import AllServices from './pages/AllServices';
import ServiceDetail from './pages/ServiceDetail';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const Layout = () => (
  <div className="flex flex-col min-h-screen bg-[#020617]">
    <Navbar />
    <main className="flex-grow pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#020617',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '12px'
        }
      }} />

      <Routes>
        {/* ✅ Default — seedha Explore pe */}
        <Route index element={<Navigate to="/explore" replace />} />

        {/* AUTH — no Navbar/Footer */}
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* DASHBOARD — protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* PUBLIC — Navbar + Footer */}
        <Route element={<Layout />}>
          <Route path="/explore"     element={<AllServices />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-gray-400 text-sm italic">
                Access Denied: Cosmic clearance required.
              </p>
            </div>
          } />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/explore" replace />} />
      </Routes>
    </Router>
  );
}

export default App;