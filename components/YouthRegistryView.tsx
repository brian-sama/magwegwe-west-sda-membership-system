
import React, { useState } from 'react';
import { YouthMember, YouthClubType, UserRole } from '../types';
import { ICONS, APP_NAME } from '../constants';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface YouthRegistryViewProps {
  club: YouthClubType;
  members: YouthMember[];
  userRole: UserRole;
}

const YouthRegistryView: React.FC<YouthRegistryViewProps> = ({ club, members, userRole }) => {
  const [search, setSearch] = useState('');
  const [selectedYouth, setSelectedYouth] = useState<YouthMember | null>(null);

  const filtered = members.filter(m => 
    m.firstName.toLowerCase().includes(search.toLowerCase()) ||
    m.lastName.toLowerCase().includes(search.toLowerCase()) ||
    m.parentName.toLowerCase().includes(search.toLowerCase())
  );

  const downloadYouthPDF = () => {
    const doc = new jsPDF('landscape');
    const dateStr = new Date().toLocaleDateString();
    const clubTitle = club === YouthClubType.PATHFINDER ? 'Pathfinder Club' : 'Adventurer Club';

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(`${APP_NAME} Church`, 14, 22);
    
    doc.setFontSize(16);
    doc.setTextColor(club === YouthClubType.PATHFINDER ? 79 : 234, club === YouthClubType.PATHFINDER ? 70 : 88, club === YouthClubType.PATHFINDER ? 229 : 12); 
    doc.text(`${clubTitle} - Member Registry`, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${dateStr} | Total Enrolled: ${members.length}`, 14, 40);

    const tableRows = members.map(m => [
      `${m.firstName} ${m.lastName}`,
      m.dob,
      m.grade,
      m.rank,
      m.parentName,
      m.parentPhone,
      m.healthNotes || 'None'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Full Name', 'Date of Birth', 'Grade', 'Class/Rank', 'Parent/Guardian', 'Emergency Phone', 'Health/Allergy Notes']],
      body: tableRows,
      headStyles: { 
        fillColor: club === YouthClubType.PATHFINDER ? [79, 70, 229] : [234, 88, 12], 
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
        0: { cellWidth: 45 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 45 },
        5: { cellWidth: 35 },
        6: { cellWidth: 'auto' }
      }
    });

    doc.save(`${APP_NAME.replace(/\s+/g, '_')}_${clubTitle.replace(/\s+/g, '_')}_Report_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{club === YouthClubType.PATHFINDER ? 'Pathfinder' : 'Adventurer'} Club Registry</h3>
          <p className="text-sm text-gray-500">Official list of young people enrolled in the club for the current season.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or parent..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {(userRole === UserRole.CLERK || userRole === UserRole.ADMIN || userRole === UserRole.PASTOR) && (
            <button 
              onClick={downloadYouthPDF}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm active:scale-95 whitespace-nowrap ${
                club === YouthClubType.PATHFINDER ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export Registry PDF
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
                <th className="px-6 py-4">Class/Rank</th>
                <th className="px-6 py-4 text-center">Age/Grade</th>
                <th className="px-6 py-4">Parent/Guardian</th>
                <th className="px-6 py-4">Health Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${club === YouthClubType.PATHFINDER ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-900 leading-tight">{member.firstName} {member.lastName}</p>
                          <button 
                            onClick={() => setSelectedYouth(member)}
                            className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-colors text-left ${club === YouthClubType.PATHFINDER ? 'text-indigo-600 hover:text-indigo-800' : 'text-orange-600 hover:text-orange-800'}`}
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold border ${club === YouthClubType.PATHFINDER ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                        {member.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-medium text-gray-700">{member.grade}</p>
                      <p className="text-[10px] text-gray-500">Born: {member.dob}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{member.parentName}</p>
                      <p className="text-xs text-gray-500">{member.parentPhone}</p>
                    </td>
                    <td className="px-6 py-4 max-w-[150px]">
                      <p className="text-xs text-gray-500 italic truncate" title={member.healthNotes || 'None'}>
                        {member.healthNotes || 'None recorded'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedYouth(member)}
                        className={`p-2 rounded-lg transition-all ${club === YouthClubType.PATHFINDER ? 'bg-indigo-50 text-indigo-400 hover:text-indigo-600' : 'bg-orange-50 text-orange-400 hover:text-orange-600'}`}
                        title="View Full Profile"
                      >
                        <ICONS.Users className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <ICONS.Users className="w-10 h-10" />
                      <p>No club members registered yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedYouth && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-8 border-b flex justify-between items-start ${club === YouthClubType.PATHFINDER ? 'bg-indigo-50' : 'bg-orange-50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-white shadow-lg ${club === YouthClubType.PATHFINDER ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                  {selectedYouth.firstName.charAt(0)}{selectedYouth.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{selectedYouth.firstName} {selectedYouth.lastName}</h4>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${club === YouthClubType.PATHFINDER ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selectedYouth.club} • {selectedYouth.rank}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedYouth(null)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(selectedYouth.dob).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">School Grade</p>
                  <p className="text-sm font-bold text-slate-800">{selectedYouth.grade}</p>
                </div>
              </div>

              <div className="p-6 border-2 border-slate-50 rounded-2xl space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Parent / Guardian Contact</h5>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{selectedYouth.parentName}</p>
                  <p className="text-xs font-mono text-slate-500 mt-1">{selectedYouth.parentPhone}</p>
                </div>
              </div>

              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 mb-2">Health & Medical Notes</h5>
                <p className="text-sm font-medium text-slate-700 italic">
                  {selectedYouth.healthNotes || "No medical alerts or allergies recorded for this club member."}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Registration Date: {new Date(selectedYouth.registrationDate).toLocaleDateString()}</span>
                <span className="text-emerald-500">Active Membership Status</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-center">
              <button 
                onClick={() => setSelectedYouth(null)} 
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

export default YouthRegistryView;
