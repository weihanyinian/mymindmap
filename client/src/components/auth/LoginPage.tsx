import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLanguage } from '../../lib/i18n';
import { Brain, User, Lock, ArrowRight, Globe } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const { lang, setLang } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-animated relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="floating-shape w-96 h-96 bg-primary-300 -top-20 -right-20" style={{ animationDelay: '0s' }} />
      <div className="floating-shape w-80 h-80 bg-accent-300 bottom-0 -left-20" style={{ animationDelay: '-4s' }} />
      <div className="floating-shape w-64 h-64 bg-indigo-200 top-1/2 left-1/4" style={{ animationDelay: '-2s' }} />

      <div className="w-full max-w-md px-4 relative z-10 animate-fade-in">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 glass rounded-full px-3 py-1.5 transition-all duration-200"
        >
          <Globe className="w-3 h-3" />
          {t.language.switch}
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-lg shadow-primary-500/25 mb-5 animate-float">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MindFlow</h1>
          <p className="text-gray-500 mt-2 text-sm">{t.auth.loginTitle}</p>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} className="glass-lg rounded-2xl p-8 space-y-5 animate-slide-up">
          {error && (
            <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between animate-scale-in">
              <span>{error}</span>
              <button type="button" onClick={clearError} className="ml-2 text-red-400 hover:text-red-600 text-lg leading-none">&times;</button>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              {t.auth.username}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="username" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-10" placeholder={t.auth.usernamePlaceholder}
                required autoFocus
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10" placeholder={t.auth.passwordPlaceholder}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.auth.loggingIn}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t.auth.loginBtn}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

          <p className="text-sm text-center text-gray-500 pt-2">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              {t.auth.signUp}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
