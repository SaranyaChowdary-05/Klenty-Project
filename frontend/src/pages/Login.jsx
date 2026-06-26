import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Layers, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back to SprintHub!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-dark-400">
      <div className="aurora-bg" />

      {/* Login Card */}
      <div className="w-full max-w-md glass-card p-8 relative z-10 shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 shadow-lg shadow-primary-500/20 text-white mb-3">
            <Layers className="w-6 h-6 animate-pulse-slow" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">Sign In to SprintHub</h2>
          <p className="text-xs text-gray-500 mt-1.5 text-center">
            Enter your credentials to access your project dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                required
                className="w-full glass-input pl-10"
                placeholder="yourname@college.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Password
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.error('Contact Admin (admin@sprinthub.com) to reset password, or use default: Admin@123');
                }}
                className="text-xs text-primary-500 hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full glass-input pl-10 pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-gradient flex items-center justify-center gap-2 mt-4 font-bold text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6 text-xs text-gray-500">
          New to SprintHub?{' '}
          <Link to="/register" className="text-primary-500 font-bold hover:underline">
            Create an account
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-8 p-3 rounded-xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            💡 Demo Account: <span className="font-semibold text-primary-500">admin@sprinthub.com</span>
            <br />
            Password: <span className="font-semibold text-primary-500">Admin@123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
