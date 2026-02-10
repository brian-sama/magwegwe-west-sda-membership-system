
import React, { useState } from 'react';
import { AuditLog } from '../types';
import { ICONS } from '../constants';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState('ALL');

  // Fix: Explicitly type uniqueActions as string[] to ensure 'action' is inferred as string in map callbacks
  const uniqueActions: string[] = Array.from(new Set(logs.map(l => l.action)));

  const filteredLogs = filterAction === 'ALL' 
    ? logs 
    : logs.filter(l => l.action === filterAction);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">System Audit Logs</h3>
          <p className="text-sm text-gray-500">Immutable record of all administrative actions for transparency.</p>
        </div>
        <div className="bg-white p-2 rounded-lg border flex gap-2 overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterAction('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
              filterAction === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            All Actions
          </button>
          {uniqueActions.map(action => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                filterAction === action ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {action.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Timestamp</th>
                <th className="px-6 py-3 font-semibold">Initiator</th>
                <th className="px-6 py-3 font-semibold">Action Type</th>
                <th className="px-6 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{log.userName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{log.userId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-tight ${
                      log.action.includes('DELETE') ? 'bg-red-50 text-red-600 border border-red-100' :
                      log.action.includes('ADD') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-slate-50 text-slate-600 border border-slate-100'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 italic">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <ICONS.Log className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No log entries found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsView;
