
import React, { useState } from 'react';
import { Member, MemberStatus } from '../types';
import { ICONS } from '../constants';

interface AddMemberFormProps {
  onAdd: (member: Member) => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    email: '',
    phone: '',
    status: MemberStatus.BAPTIZED,
    department: '',
    baptismDate: '',
    previousChurch: '',
    boardApprovalDate: '',
    address: ''
  });

  const departmentOptions = ['Pathfinders', 'Adventurers', 'Dorcas', 'AMO'];

  const toggleDepartment = (dept: string) => {
    const current = formData.department ? formData.department.split(',').map(d => d.trim()).filter(Boolean) : [];
    const updated = current.includes(dept) ? current.filter(d => d !== dept) : [...current, dept];
    setFormData({ ...formData, department: updated.join(', ') });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      registrationDate: new Date().toISOString()
    };
    onAdd(newMember);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-slate-50">
        <h3 className="text-xl font-bold text-slate-800">New Member Registration</h3>
        <p className="text-sm text-slate-500">Add a new soul to the church registry. National ID is required for official identification.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">First Name</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. John"
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
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">National Identity Number</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. 63-123456A78"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              required
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
            <input
              required
              type="tel"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="555-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Physical Address</label>
          <textarea
            required
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            placeholder="House #, Street Name, City, State"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Department Assignment */}
        <div className="p-6 bg-emerald-50 rounded-xl space-y-4">
          <label className="block text-sm font-bold text-emerald-900">Department Assignment</label>
          <p className="text-xs text-emerald-700">Select all departments this member belongs to:</p>
          <div className="flex flex-wrap gap-3">
            {departmentOptions.map(dept => {
              const isSelected = formData.department.split(',').map(d => d.trim()).includes(dept);
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border shadow-sm ${isSelected
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                >
                  {isSelected ? '✓ ' : ''}{dept}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-indigo-50 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-bold text-indigo-900">Registration Type</label>
              <select
                className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
              >
                <option value={MemberStatus.BAPTIZED}>Baptized Member</option>
                <option value={MemberStatus.TRANSFERRED_IN}>Transfer from Other Church</option>
                <option value={MemberStatus.ACTIVE}>Regular Active Member</option>
              </select>
            </div>

            {formData.status === MemberStatus.BAPTIZED && (
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-bold text-indigo-900">Baptism Date</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.baptismDate}
                  onChange={(e) => setFormData({ ...formData, baptismDate: e.target.value })}
                />
              </div>
            )}

            {formData.status === MemberStatus.TRANSFERRED_IN && (
              <>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-bold text-indigo-900">Previous Church Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. Grace Fellowship"
                    value={formData.previousChurch}
                    onChange={(e) => setFormData({ ...formData, previousChurch: e.target.value })}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-bold text-indigo-900">Board Approval Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.boardApprovalDate}
                    onChange={(e) => setFormData({ ...formData, boardApprovalDate: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            className="px-6 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-10 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <ICONS.Plus className="w-5 h-5" />
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberForm;
