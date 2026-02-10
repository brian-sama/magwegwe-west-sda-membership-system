
import React, { useState } from 'react';
import { SocietyMember, SocietyType, UserRole } from '../types';
import { ICONS, APP_NAME } from '../constants';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface SocietyRegistryViewProps {
  type: SocietyType;
  members: SocietyMember[];
  userRole: UserRole;
}

const SocietyRegistryView: React.FC<SocietyRegistryViewProps> = ({ type, members, userRole }) => {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<SocietyMember | null>(null);

  const isDorcas = type === SocietyType.DORCAS;
  const filtered = members.filter(m => 
    m.firstName.toLowerCase().includes(search.toLowerCase()) ||
    m.lastName.toLowerCase().includes(search.toLowerCase()) ||
    m.nationalId.toLowerCase().includes(search.toLowerCase())
  );

  const downloadSocietyPDF = () => {
    const doc = new jsPDF('landscape');
    const dateStr = new Date().toLocaleDateString();
    const title = isDorcas ? 'Dorcas Society' : 'Adventist Men Organization (AMO)';

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(`${APP_NAME}`, 14, 22);
    
    doc.setFontSize(16);
    doc.setTextColor(isDorcas ? 225 : 37, isDorcas ? 29 : 99, isDorcas ? 72 : 235); 
    doc.text(`${title} Registry`, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${dateStr} | Total Enrolled: ${members.length}`, 14, 40);

    const tableRows = members.map(m => [
      `${m.firstName} ${m.lastName}`,
      m.nationalId,
      m.phone,
      m.skills,
      new Date(m.registrationDate).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Full Name', 'National ID', 'Phone Number', 'Skills & Expertise', 'Enrolled Date']],
      body: tableRows,
      headStyles: { 
        fillColor: isDorcas ? [225, 29, 72] : [37, 99, 235], 
        textColor: 255, 
        fontSize: 10,
        halign: 'left'
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 50 },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 40 }
      }
    });

    doc.save(`${APP_NAME.replace(/\s+/g, '_')}_${type}_Registry_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className={`text-xl font-bold ${isDorcas ? 'text-rose-900' : 'text-blue-900'}`}>{isDorcas ? 'Dorcas Society' : 'Adventist Men (AMO)'} Registry</h3>
          <p className="text-sm text-gray-500">Current list of {type.toLowerCase()} department members.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or National ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {(userRole === UserRole.CLERK || userRole === UserRole.ADMIN || userRole === UserRole.PASTOR) && (
            <button 
              onClick={downloadSocietyPDF}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm active:scale-95 whitespace-nowrap ${isDorcas ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export PDF
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Name & Profile</th>
                <th className="px-6 py-4">National ID</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Skills</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${isDorcas ? 'bg-rose-500' : 'bg-blue-500'}`}>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-900 leading-tight">{member.firstName} {member.lastName}</p>
                          <button 
                            onClick={() => setSelectedMember(member)}
                            className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-colors text-left ${isDorcas ? 'text-rose-600 hover:text-rose-800' : 'text-blue-600 hover:text-blue-800'}`}
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{member.nationalId}</td>
                    <td className="px-6 py-4 text-gray-600">{member.phone}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={member.skills}>{member.skills}</td>
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={() => setSelectedMember(member)}
                        className={`p-2 rounded-lg transition-all ${isDorcas ? 'bg-rose-50 text-rose-400 hover:text-rose-600' : 'bg-blue-50 text-blue-400 hover:text-blue-600'}`}
                        title="View Full Profile"
                      >
                        <ICONS.Users className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <ICONS.Users className="w-10 h-10" />
                      <p>No members found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-8 border-b flex justify-between items-start ${isDorcas ? 'bg-rose-50' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-white shadow-lg ${isDorcas ? 'bg-rose-600' : 'bg-blue-600'}`}>
                  {selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{selectedMember.firstName} {selectedMember.lastName}</h4>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isDorcas ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                    Department: {selectedMember.type}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">National ID</p>
                  <p className="text-sm font-mono font-bold text-slate-800">{selectedMember.nationalId}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
                  <p className="text-sm font-bold text-slate-800">{selectedMember.phone}</p>
                </div>
              </div>

              <div className="p-6 border-2 border-slate-50 rounded-2xl space-y-3">
                <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDorcas ? 'text-rose-600' : 'text-blue-600'}`}>Service Skills & Expertise</h5>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {selectedMember.skills || "No specific expertise recorded."}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Enrolled Since: {new Date(selectedMember.registrationDate).toLocaleDateString()}</span>
                <span className={isDorcas ? 'text-rose-500' : 'text-blue-500'}>Active Member</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-center">
              <button 
                onClick={() => setSelectedMember(null)} 
                className="px-12 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietyRegistryView;
