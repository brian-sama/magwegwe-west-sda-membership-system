import React, { useState } from 'react';
import { User } from '../types';
import { ICONS, APP_NAME } from '../constants';
import { api } from '../src/services/api';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login({ email, password });
      onLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <svg width="80" height="90" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
              {/* Open Bible */}
              <path d="M30 140 L100 120 L170 140 L170 190 L100 170 L30 190 Z" fill="#1a6b5a" stroke="#14574a" strokeWidth="2" />
              <path d="M100 120 L100 170" stroke="#fff" strokeWidth="2" />
              {/* Bible pages */}
              <path d="M35 143 L97 125 L97 167 L35 185 Z" fill="#1f7d6a" />
              <path d="M103 125 L165 143 L165 185 L103 167 Z" fill="#1f7d6a" />
              {/* Cross on Bible */}
              <line x1="100" y1="126" x2="100" y2="150" stroke="#c8a840" strokeWidth="3" />
              <line x1="90" y1="134" x2="110" y2="134" stroke="#c8a840" strokeWidth="3" />
              {/* Flame */}
              <path d="M100 15 C85 50 70 70 75 95 C78 110 88 118 100 120 C112 118 122 110 125 95 C130 70 115 50 100 15Z" fill="#c8a840" />
              <path d="M100 30 C90 55 82 72 85 92 C87 105 93 115 100 118 C107 115 113 105 115 92 C118 72 110 55 100 30Z" fill="#d4b84a" />
              <path d="M100 45 C93 62 88 76 90 90 C92 100 96 110 100 115 C104 110 108 100 110 90 C112 76 107 62 100 45Z" fill="#e0c85a" />
              {/* Second flame wave */}
              <path d="M80 40 C70 65 65 80 72 100 C75 108 82 115 90 118 L88 110 C84 105 78 95 80 80 C82 68 85 55 80 40Z" fill="#c8a840" opacity="0.8" />
              <path d="M120 40 C130 65 135 80 128 100 C125 108 118 115 110 118 L112 110 C116 105 122 95 120 80 C118 68 115 55 120 40Z" fill="#c8a840" opacity="0.8" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{APP_NAME}</h1>
          <p className="text-slate-500 mt-2">Official Portal for Church Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="admin@magwegwesda.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 px-8 leading-relaxed">
          Authorized access only to the Magwegwe West SDA secure system.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
