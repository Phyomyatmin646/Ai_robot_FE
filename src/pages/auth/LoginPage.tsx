import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect with replace to avoid browser back loops
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      console.warn('Login error:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) ||
        err.message;
      setError(msg || 'Failed to connect to backend. Verify server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass for immediate review
  const handleDemoLogin = () => {
    localStorage.setItem('ai_robot_access_token', 'demo-token');
    localStorage.setItem(
      'ai_robot_user',
      JSON.stringify({
        id: 'usr_demo_123',
        name: 'Demo Parent',
        email: 'parent@example.com',
        role: 'user',
        isActive: true,
      })
    );
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-canvas relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 via-primary-hover/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tl from-aether/25 via-primary/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card border border-neutral-border shadow-floating space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover mx-auto flex items-center justify-center text-white shadow-glow-violet">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-void tracking-tight">
            Aether & Voice Next OS
          </h1>
          <p className="text-xs text-neutral-slate">
            Autonomous Voice Assistant Robot Control Center
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="block mt-1 font-semibold text-primary underline"
              >
                Click here for instant Demo Preview
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-void mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-slate" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl input-glass text-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-void mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-slate" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl input-glass text-sm font-mono"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 rounded-lg text-neutral-slate hover:text-neutral-void hover:bg-neutral-border/40 transition-colors focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-primary text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Authenticating...' : 'Sign In to Robot Center'}</span>
          </button>
        </form>

        {/* Quick Demo Preview Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl btn-glass text-xs font-semibold text-neutral-void hover:text-primary flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Instant Demo Sign-in (UI Preview)</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-slate">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
};

