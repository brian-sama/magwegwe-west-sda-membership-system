
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ICONS, APP_NAME } from '../constants';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);

  const handleQuickLogin = () => {
    const mockUsers: Record<UserRole, User> = {
      [UserRole.ADMIN]: { id: 'u1', name: 'System Admin', email: 'admin@magwegwesda.org', role: UserRole.ADMIN, lastLogin: new Date().toISOString() },
      [UserRole.PASTOR]: { id: 'u2', name: 'Pastor Peter', email: 'pastor@magwegwesda.org', role: UserRole.PASTOR, lastLogin: new Date().toISOString() },
      [UserRole.CLERK]: { id: 'u3', name: 'Church Clerk', email: 'clerk@magwegwesda.org', role: UserRole.CLERK, lastLogin: new Date().toISOString() }
    };
    onLogin(mockUsers[selectedRole]);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-xl mb-4">
            <ICONS.Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{APP_NAME} Registry</h1>
          <p className="text-slate-500 mt-2">Official Portal for Church Administration</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Access Role</label>
            <div className="grid grid-cols-1 gap-3">
              {(Object.values(UserRole) as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <span className="font-semibold uppercase tracking-wide text-sm">{role.replace('_', ' ')}</span>
                  {selectedRole === role && (
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleQuickLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5"
          >
            Enter Portal
          </button>
          
          <p className="text-center text-xs text-slate-400 px-8 leading-relaxed">
            Authorized access only. All actions are logged under the Magwegwe West SDA secure protocol.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
