import React, { useState } from 'react';
import { api } from '../src/services/api';
import { SearchResult, UserRole } from '../types';

interface SettingsViewProps {
  userRole: UserRole;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userRole }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState('');

  const canSms = [UserRole.ADMIN, UserRole.CLERK, UserRole.PASTOR].includes(userRole);

  const runSearch = async () => {
    if (!search.trim()) return;
    const data = await api.search.global(search);
    setResults(data || []);
  };

  const sendSms = async () => {
    try {
      await api.notifications.sendSms({ recipient, message });
      setStatus('SMS queued successfully.');
      setRecipient('');
      setMessage('');
    } catch (e: any) {
      setStatus(e.message || 'SMS failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800">Global Member Search</h3>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Search by name, phone, society, email" />
          <button onClick={runSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Search</button>
        </div>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="text-sm border rounded-lg px-3 py-2">{r.first_name} {r.last_name} - {r.email || r.phone || 'No contact'}</div>
          ))}
          {results.length === 0 && <p className="text-xs text-gray-400">No results loaded yet.</p>}
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800">SMS Notifications (Africa's Talking)</h3>
        {!canSms ? (
          <p className="text-sm text-gray-500">You do not have permission to send SMS.</p>
        ) : (
          <>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Recipient phone number" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Message" />
            <button onClick={sendSms} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">Send SMS</button>
            {status && <p className="text-xs text-slate-500">{status}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
