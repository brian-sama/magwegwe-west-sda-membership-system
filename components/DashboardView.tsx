
import React, { useState, useEffect } from 'react';
import { Member, AuditLog, UserRole, MemberStatus } from '../types';
import { ICONS } from '../constants';
import { api } from '../src/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardViewProps {
  members: Member[];
  logs: AuditLog[];
  userRole: UserRole;
}

const DashboardView: React.FC<DashboardViewProps> = ({ members, logs, userRole }) => {
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Active Membership logic: Includes specifically marked ACTIVE, plus BAPTIZED and TRANSFERRED_IN
  const activeMembersList = members.filter(m => 
    [MemberStatus.ACTIVE, MemberStatus.BAPTIZED, MemberStatus.TRANSFERRED_IN].includes(m.status)
  );
  
  const totalActivePool = activeMembersList.length;
  const transferredOutCount = members.filter(m => m.status === MemberStatus.TRANSFERRED_OUT).length;
  const inactiveCount = members.filter(m => m.status === MemberStatus.INACTIVE).length;

  const stats = [
    { label: 'Active Members', value: totalActivePool, icon: <ICONS.Users className="w-6 h-6" />, color: 'bg-indigo-600' },
    { label: 'Baptized (Current)', value: members.filter(m => m.status === MemberStatus.BAPTIZED).length, icon: <ICONS.Sparkles className="w-6 h-6" />, color: 'bg-emerald-500' },
    { label: 'Transferred In', value: members.filter(m => m.status === MemberStatus.TRANSFERRED_IN).length, icon: <ICONS.Plus className="w-6 h-6" />, color: 'bg-purple-500' },
    { label: 'Inactive / Out', value: inactiveCount + transferredOutCount, icon: <ICONS.LogOut className="w-6 h-6" />, color: 'bg-slate-400' },
  ];

  const chartData = [
    { name: 'Baptized', count: members.filter(m => m.status === MemberStatus.BAPTIZED).length },
    { name: 'Transferred In', count: members.filter(m => m.status === MemberStatus.TRANSFERRED_IN).length },
    { name: 'Direct Active', count: members.filter(m => m.status === MemberStatus.ACTIVE).length },
    { name: 'Inactive', count: inactiveCount },
  ];

  const COLORS = ['#10B981', '#8B5CF6', '#4F46E5', '#64748B'];

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    try {
      const contextHint = userRole === UserRole.ADMIN ? 'Include security observations.' : 'Focus on membership growth and care.';
      const result = await api.analytics.insights(`Summarize membership trends. ${contextHint}`);
      setAiReport(result?.insight || 'Could not generate report.');
    } catch {
      setAiReport('Could not generate report.');
    }
    setLoadingAi(false);
  };

  useEffect(() => {
    if (userRole === UserRole.PASTOR || userRole === UserRole.ADMIN) {
      handleGenerateReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-lg text-white shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Registry Composition</h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Real-time Data</span>
          </div>
          <div className="h-64 w-full flex-1" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Assistant Summary */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ICONS.Sparkles className="w-32 h-32 text-white" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-indigo-500 rounded-xl">
               <ICONS.Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-black text-white text-sm uppercase tracking-[0.2em]">Pastor's Intel</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10 pr-2">
            {loadingAi ? (
              <div className="space-y-4">
                <div className="h-3 bg-slate-800 rounded-full animate-pulse w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded-full animate-pulse w-full"></div>
                <div className="h-3 bg-slate-800 rounded-full animate-pulse w-2/3"></div>
                <div className="h-3 bg-slate-800 rounded-full animate-pulse w-1/2"></div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 leading-relaxed prose prose-invert max-w-full">
                {aiReport || "No recent intelligence analysis available."}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleGenerateReport}
            className="mt-8 w-full py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95 relative z-10"
          >
            Refresh Insights
          </button>
        </div>
      </div>

      {/* Recent Activity Table - Strictly Admin Only */}
      {userRole === UserRole.ADMIN && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Security Audit Logs</h3>
            <span className="text-[10px] font-bold text-slate-400">Last 5 Activities</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-400 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Authorized User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                           {(log.userName || 'U').charAt(0)}
                         </div>
                         <p className="font-bold text-slate-700">{log.userName || 'Unknown User'}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white border shadow-sm text-slate-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium truncate max-w-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
