import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ICONS } from '../constants';

interface AddUserFormProps {
  onAdd: (user: User) => void;
  onCancel: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.CLERK,
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      lastLogin: 'Never',
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
      <div className="p-8 border-b bg-slate-900 text-white">
        <h3 className="text-2xl font-black tracking-tight">Create System Access</h3>
        <p className="text-slate-400 text-sm mt-1">Provision a new user with specific role-based permissions.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
            <input
              required
              type="text"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="e.g. Elder Moyo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <input
              required
              type="email"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="user@magwegwesda.co.zw"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Access Level</label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 appearance-none"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <option value={UserRole.ADMIN}>System Administrator</option>
                <option value={UserRole.PASTOR}>Church Pastor</option>
                <option value={UserRole.ELDER}>Church Elder</option>
                <option value={UserRole.CLERK}>Church Clerk</option>
                <option value={UserRole.VIEWER}>Read-Only Viewer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Initial Password</label>
              <input
                required
                type="password"
                minLength={8}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-2 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ICONS.Plus className="w-5 h-5" />
            Create User Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
