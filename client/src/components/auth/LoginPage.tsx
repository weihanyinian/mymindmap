import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLanguage } from '../../lib/i18n';

export default function LoginPage() {
  const [email, setEmail] = useState('');
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
      await login(email, password);
      navigate('/');
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md px-3 py-1"
        >
          {t.language.switch}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">MindFlow</h1>
          <p className="text-gray-500 mt-1">{t.auth.loginTitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={clearError} className="ml-2 text-red-400 hover:text-red-600">
                &times;
              </button>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t.auth.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder={t.auth.emailPlaceholder}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t.auth.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={t.auth.passwordPlaceholder}
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full text-center">
            {submitting ? t.auth.loggingIn : t.auth.loginBtn}
          </button>

          <p className="text-sm text-center text-gray-500">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              {t.auth.signUp}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
