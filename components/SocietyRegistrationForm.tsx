import React, { useState } from 'react';
import { SocietyMember, SocietyType } from '../types';
import { ICONS } from '../constants';

interface SocietyRegistrationFormProps {
  type: SocietyType;
  onAdd: (member: SocietyMember) => void;
}

const SocietyRegistrationForm: React.FC<SocietyRegistrationFormProps> = ({ type, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    phone: '',
    skills: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: SocietyMember = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      type,
      registrationDate: new Date().toISOString()
    };
    onAdd(newMember);
  };

  const isDorcas = type === SocietyType.DORCAS;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`p-6 border-b ${isDorcas ? 'bg-rose-50' : 'bg-blue-50'}`}>
        <h3 className={`text-xl font-bold ${isDorcas ? 'text-rose-900' : 'text-blue-900'}`}>
          New {isDorcas ? 'Dorcas Society' : 'Adventist Men (AMO)'} Registration
        </h3>
        <p className="text-sm text-gray-500">Official registration for {type.toLowerCase()} membership and service skills.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">First Name</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Last Name</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">National Identity Number</label>
            <input
              required
              type="text"
              placeholder="e.g. 63-123456A78"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
            <input
              required
              type="tel"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Service Skills & Expertise</label>
          <textarea
            required
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            placeholder={isDorcas ? "e.g. Cooking, Tailoring, Community Visitation, First Aid..." : "e.g. Carpentry, Electrician, Building, Mentorship, Disaster Response..."}
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className={`px-10 py-3 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 ${isDorcas ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            <ICONS.Plus className="w-5 h-5" /> Enroll in {isDorcas ? 'Dorcas' : 'AMO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocietyRegistrationForm;
