import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('my');
  const [timezone, setTimezone] = useState('Asia/Yangon');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo bypass for instant review
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        language,
        timezone: timezone.trim(),
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      console.warn('Register error:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) ||
        err.message;
      setError(msg || 'Registration failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-canvas relative overflow-hidden">
      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card border border-neutral-border shadow-floating space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover mx-auto flex items-center justify-center text-white shadow-glow-violet">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            Create Robot Account
          </h1>
          <p className="text-xs text-neutral-slate">
            Join Aether & Voice Next OS Platform
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-void mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-slate" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl input-glass text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-void mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-slate" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl input-glass text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-void mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-slate" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl input-glass text-sm font-mono"
                placeholder="At least 8 characters"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-void mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl input-glass text-xs"
              >
                <option value="my">မြန်မာ (my)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-void mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl input-glass text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-primary text-sm font-semibold flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Creating Account...' : 'Register & Launch'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-neutral-slate">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

