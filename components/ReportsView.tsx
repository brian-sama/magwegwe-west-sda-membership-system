import React from 'react';
import { ReportRequest, UserRole } from '../types';

interface ReportsViewProps {
  userRole: UserRole;
  onExport: (request: ReportRequest) => void;
}

const reportTypes: ReportRequest['type'][] = ['members', 'youth', 'societies', 'attendance'];

const ReportsView: React.FC<ReportsViewProps> = ({ userRole, onExport }) => {
  const allowed = [UserRole.ADMIN, UserRole.CLERK, UserRole.PASTOR].includes(userRole);

  if (!allowed) {
    return <div className="bg-white rounded-xl border p-6 text-sm text-gray-500">You do not have permission to export reports.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reportTypes.map((type) => (
        <div key={type} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
          <h3 className="text-base font-bold capitalize">{type} report</h3>
          <p className="text-sm text-gray-500">Download official {type} records in PDF or Excel format.</p>
          <div className="flex gap-2">
            <button onClick={() => onExport({ type, format: 'pdf' })} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold">PDF</button>
            <button onClick={() => onExport({ type, format: 'xlsx' })} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">Excel</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportsView;
