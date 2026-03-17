import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthTabs from '../components/auth/AuthTabs';
import '../index.css'; // Ensure styles loaded

const Login = () => {
  const [activeRole, setActiveRole] = useState('customer');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, login, signup, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (user) navigate('/app/dashboard');
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = {
    customer: { title: 'Customer Portal', subtitle: 'Access your inventory & billing' },
    employee: { title: 'Employee Dashboard', subtitle: 'Manage daily operations' },
    admin: { title: 'Admin Panel', subtitle: 'Full system management' },
    superadmin: { title: 'SuperAdmin Console', subtitle: 'Complete platform control' }
  };

  const config = roleConfig[activeRole];

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-400/30 border-t-primary-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900/50 to-accent-900/70 animate-gradient-xy dark">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        className="video-bg brightness-50 opacity-40"
      >
        <source src="https://res.cloudinary.com/dgobbuvqf/video/upload/v1773744348/turn-this-image-into-an-animation-in-a-factory-inv_t3kzvw.mp4" type="video/mp4" />
      </video>

      {/* Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 bg-primary-500/20 rounded-full animate-float-1" />
        <div className="absolute top-60 right-20 w-32 h-32 bg-accent-500/15 rounded-full animate-float-2" />
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-purple-500/20 rounded-full animate-float-3" />
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-r from-primary-400 to-accent-400/30 rounded-full animate-float-4 blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        {/* Product Logo */}
        

        {/* Role Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-xl mb-8"
        >
          <AuthTabs activeRole={activeRole} onChange={setActiveRole} />
        </motion.div>

        {/* Role Title */}
        <motion.h1
          key={`title-${activeRole}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 text-center"
        >
          {config.title}
        </motion.h1>
        <motion.p
          key={`subtitle-${activeRole}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-300 text-lg mb-12 text-center max-w-md"
        >
          {config.subtitle}
        </motion.p>

        {/* Glassmorphism Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-md login-glass shadow-glow-lg rounded-3xl p-8 sm:p-10 border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field input-glow w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-slate-400 focus:ring-primary-400"
                  placeholder="Enter your name"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field input-glow w-full pl-12 pr-12 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-slate-400 focus:ring-primary-400"
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field input-glow w-full pl-12 pr-12 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-slate-400 focus:ring-primary-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
{showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    ) : (
                      <svg viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" transform="matrix(1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    )}
                  </svg>
                </button>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            {errors.submit && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-200 text-sm text-center backdrop-blur-sm"
              >
                {errors.submit}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-login btn-premium w-full py-4 px-8 rounded-2xl font-bold text-lg text-white shadow-2xl hover:shadow-glow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-400/50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                  </motion.div>
                  <span>Signing in...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {activeRole === 'customer' && (
              <div className="text-center pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-300 hover:text-white font-medium transition-colors text-sm"
                >
                  {isLogin ? 'New customer? Create Account' : 'Have account? Sign In'}
                </button>
              </div>
            )}
            {activeRole !== 'customer' && (
              <div className="text-center pt-4 border-t border-white/20 text-slate-400 text-xs italic">
                Contact admin for {config.title.toLowerCase()} access
              </div>
            )}
          </form>
        </motion.div>

        {/* Bottom Links */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-sm text-slate-400 text-center"
        >
          © 2024 Inventory Management @ Focus. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
};

export default Login;
