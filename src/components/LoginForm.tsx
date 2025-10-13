import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ApiService from '../services/api';
import { IoLockClosed, IoPerson, IoEye, IoEyeOff } from 'react-icons/io5';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, state } = useApp();
  const ENABLE_FORGOT_PASSWORD = (import.meta as any).env?.VITE_ENABLE_FORGOT_PASSWORD === 'true';
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [fpUsername, setFpUsername] = useState('');
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  const [fpPhase, setFpPhase] = useState<'request' | 'reset'>('request');
  const [fpMessage, setFpMessage] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="ADAProperty" className="mx-auto h-12 mb-3" />
          <div className="mx-auto w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <IoLockClosed className="w-7 h-7 text-gray-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel Login</h1>
          <p className="text-gray-600 mt-1">Masuk untuk mengelola konten dan properti</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoPerson className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IoEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <IoEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={state.loading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-900 focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {state.loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              'Masuk'
            )}
          </button>
          {ENABLE_FORGOT_PASSWORD && (
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-sm text-gray-700 hover:text-black"
                onClick={() => { setShowForgot(true); setFpPhase('request'); setFpError(''); setFpMessage(''); }}
              >
                Lupa Password?
              </button>
            </div>
          )}
        </form>
        
        {/* Hilangkan panel demo credentials agar tampilan lebih profesional */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ADAProperty. All rights reserved.</p>
        </div>
      {ENABLE_FORGOT_PASSWORD && showForgot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reset Password dengan OTP</h3>
              <button className="text-gray-500" onClick={() => setShowForgot(false)}>✕</button>
            </div>

            {fpError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{fpError}</div>
            )}
            {fpMessage && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">{fpMessage}</div>
            )}

            {fpPhase === 'request' ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFpError('');
                  setFpMessage('');
                  if (!fpUsername) { setFpError('Username wajib diisi'); return; }
                  setFpLoading(true);
                  const resp = await ApiService.requestPasswordReset(fpUsername, fpEmail);
                  setFpLoading(false);
                  if (resp?.success) {
                    setFpMessage('OTP telah dikirim ke email');
                    setFpPhase('reset');
                  } else {
                    setFpError(resp?.error || 'Gagal mengirim OTP');
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={fpUsername}
                    onChange={(e) => setFpUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email (tujuan OTP)</label>
                  <input
                    type="email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    placeholder="opsional jika ADMIN_EMAIL dikonfigurasi"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-500" onClick={() => setShowForgot(false)}>Batal</button>
                  <button type="submit" disabled={fpLoading} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900">{fpLoading ? 'Mengirim...' : 'Kirim OTP'}</button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFpError('');
                  setFpMessage('');
                  if (!fpOtp || !fpNewPassword || !fpConfirm) { setFpError('Semua field wajib diisi'); return; }
                  if (fpNewPassword !== fpConfirm) { setFpError('Konfirmasi password tidak cocok'); return; }
                  setFpLoading(true);
                  const resp = await ApiService.resetPassword(fpUsername, fpOtp, fpNewPassword);
                  setFpLoading(false);
                  if (resp?.success) {
                    setFpMessage('Password berhasil direset. Silakan login.');
                    setShowForgot(false);
                  } else {
                    setFpError(resp?.error || 'Gagal reset password');
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Kode OTP</label>
                  <input
                    type="text"
                    value={fpOtp}
                    onChange={(e) => setFpOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Password Baru</label>
                  <input
                    type="password"
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={fpConfirm}
                    onChange={(e) => setFpConfirm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-500" onClick={() => setShowForgot(false)}>Batal</button>
                  <button type="submit" disabled={fpLoading} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900">{fpLoading ? 'Menyimpan...' : 'Reset Password'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LoginForm;
