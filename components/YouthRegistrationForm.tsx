
import React, { useState } from 'react';
import { YouthMember, YouthClubType } from '../types';
import { ICONS } from '../constants';

interface YouthRegistrationFormProps {
  club: YouthClubType;
  onAdd: (member: YouthMember) => void;
}

const PATHFINDER_RANKS = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];
const ADVENTURER_RANKS = ['Little Lamb', 'Eager Beaver', 'Busy Bee', 'Sunbeam', 'Builder', 'Helping Hand'];

const YouthRegistrationForm: React.FC<YouthRegistrationFormProps> = ({ club, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    parentName: '',
    parentPhone: '',
    grade: '',
    rank: club === YouthClubType.PATHFINDER ? PATHFINDER_RANKS[0] : ADVENTURER_RANKS[0],
    healthNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: YouthMember = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      club,
      registrationDate: new Date().toISOString()
    };
    onAdd(newMember);
  };

  const ranks = club === YouthClubType.PATHFINDER ? PATHFINDER_RANKS : ADVENTURER_RANKS;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`p-6 border-b ${club === YouthClubType.PATHFINDER ? 'bg-indigo-50' : 'bg-orange-50'}`}>
        <h3 className={`text-xl font-bold ${club === YouthClubType.PATHFINDER ? 'text-indigo-900' : 'text-orange-900'}`}>
          New {club === YouthClubType.PATHFINDER ? 'Pathfinder' : 'Adventurer'} Registration
        </h3>
        <p className="text-sm text-gray-500">Register a young soul for {club.toLowerCase()} activities and classes.</p>
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
            <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
            <input
              required
              type="date"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">School Grade</label>
            <input
              required
              type="text"
              placeholder="e.g. Grade 5"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Club Class/Rank</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.rank}
              onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
            >
              {ranks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-xl space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <ICONS.Users className="w-4 h-4" /> Parent/Guardian Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Guardian Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Emergency Phone</label>
              <input
                required
                type="tel"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Health Notes / Allergies (Optional)</label>
          <textarea
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            placeholder="List any medical conditions or dietary requirements..."
            value={formData.healthNotes}
            onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
            <ICONS.Plus className="w-5 h-5" /> Complete Club Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default YouthRegistrationForm;
