import React, { useMemo, useState } from 'react';
import { AttendanceRecord, Member, UserRole } from '../types';

interface AttendanceViewProps {
  records: AttendanceRecord[];
  members: Member[];
  userRole: UserRole;
  onRecord: (payload: { memberId: string; eventType: AttendanceRecord['eventType']; date: string; status?: AttendanceRecord['status'] }) => Promise<void>;
  onScan: (payload: { qr_payload: string; event_type: AttendanceRecord['eventType']; date: string }) => Promise<void>;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ records, members, userRole, onRecord, onScan }) => {
  const [memberId, setMemberId] = useState('');
  const [eventType, setEventType] = useState<AttendanceRecord['eventType']>('Sabbath');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scanPayload, setScanPayload] = useState('');

  const canWrite = [UserRole.ADMIN, UserRole.CLERK, UserRole.PASTOR].includes(userRole);

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  return (
    <div className="space-y-6">
      {canWrite && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase text-slate-500">Manual Attendance</h3>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select className="border rounded-lg px-3 py-2 text-sm" value={eventType} onChange={(e) => setEventType(e.target.value as AttendanceRecord['eventType'])}>
                <option value="Sabbath">Sabbath</option>
                <option value="Youth">Youth</option>
                <option value="Society">Society</option>
                <option value="Campmeeting">Campmeeting</option>
              </select>
              <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button
              onClick={() => memberId && onRecord({ memberId, eventType, date, status: 'Present' })}
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-bold"
            >
              Save Attendance
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase text-slate-500">QR Scan Payload</h3>
            <textarea
              rows={5}
              value={scanPayload}
              onChange={(e) => setScanPayload(e.target.value)}
              placeholder='Paste QR payload JSON here, e.g. {"member_id":1}'
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono"
            />
            <button
              onClick={() => scanPayload && onScan({ qr_payload: scanPayload, event_type: eventType, date })}
              className="w-full bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-bold"
            >
              Submit Scan
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3">{record.memberName}</td>
                <td className="px-4 py-3">{record.eventType}</td>
                <td className="px-4 py-3">{record.date}</td>
                <td className="px-4 py-3">{record.status}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-400" colSpan={4}>No attendance records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceView;
