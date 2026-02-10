
import React, { useState, useMemo } from 'react';
import { Member, MemberStatus, UserRole } from '../types';
import { ICONS, APP_NAME } from '../constants';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface MemberDirectoryProps {
  members: Member[];
  userRole: UserRole;
  onTransferOut: (memberId: string, destinationChurch: string, boardDate: string) => void;
  onRestoreMember: (memberId: string, comment: string, date: string) => void;
}

const MemberDirectory: React.FC<MemberDirectoryProps> = ({ members, userRole, onTransferOut, onRestoreMember }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  
  // State for Member Details and Action Modals
  const [memberModal, setMemberModal] = useState<{ isOpen: boolean, member: Member | null, mode: 'VIEW' | 'TRANSFER' | 'RESTORE' }>({
    isOpen: false,
    member: null,
    mode: 'VIEW'
  });
  
  const [destinationChurch, setDestinationChurch] = useState('');
  const [boardApprovalDate, setBoardApprovalDate] = useState('');
  const [restorationComment, setRestorationComment] = useState('');
  const [restorationDate, setRestorationDate] = useState('');

  const isAdmin = userRole === UserRole.ADMIN;

  const availableBaptismYears = useMemo(() => {
    const years = new Set<string>();
    members.forEach(m => {
      if (m.status === MemberStatus.BAPTIZED && m.baptismDate) {
        try {
          const year = new Date(m.baptismDate).getFullYear().toString();
          if (year && year !== 'NaN') years.add(year);
        } catch (e) {
          console.error("Invalid date", m.baptismDate);
        }
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [members]);

  const filteredMembers = members.filter(member => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = 
      member.firstName.toLowerCase().includes(s) ||
      member.lastName.toLowerCase().includes(s) ||
      member.email.toLowerCase().includes(s) ||
      member.nationalId.toLowerCase().includes(s);
    
    let matchesFilter = false;
    if (filterStatus === 'ALL') {
      matchesFilter = true;
    } else if (filterStatus === MemberStatus.ACTIVE) {
      matchesFilter = [MemberStatus.ACTIVE, MemberStatus.BAPTIZED, MemberStatus.TRANSFERRED_IN].includes(member.status);
    } else if (filterStatus === MemberStatus.BAPTIZED) {
      matchesFilter = member.status === MemberStatus.BAPTIZED;
      if (selectedYear !== 'ALL') {
        const bYear = member.baptismDate ? new Date(member.baptismDate).getFullYear().toString() : '';
        matchesFilter = matchesFilter && bYear === selectedYear;
      }
    } else {
      matchesFilter = member.status === filterStatus;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.BAPTIZED: return 'bg-green-100 text-green-700';
      case MemberStatus.TRANSFERRED_IN: return 'bg-purple-100 text-purple-700';
      case MemberStatus.ACTIVE: return 'bg-blue-100 text-blue-700';
      case MemberStatus.INACTIVE: return 'bg-gray-100 text-gray-600';
      case MemberStatus.TRANSFERRED_OUT: return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRelevantDate = (member: Member) => {
    switch (member.status) {
      case MemberStatus.BAPTIZED:
        return member.baptismDate || '-';
      case MemberStatus.TRANSFERRED_IN:
      case MemberStatus.TRANSFERRED_OUT:
        return member.boardApprovalDate || member.transferDate || '-';
      default:
        return new Date(member.registrationDate).toLocaleDateString();
    }
  };

  const openMemberModal = (member: Member, mode: 'VIEW' | 'TRANSFER' | 'RESTORE' = 'VIEW') => {
    setMemberModal({ isOpen: true, member, mode });
    setDestinationChurch('');
    setBoardApprovalDate('');
    setRestorationComment('');
    setRestorationDate(new Date().toISOString().split('T')[0]);
  };

  const confirmTransfer = () => {
    if (memberModal.member && destinationChurch && boardApprovalDate) {
      onTransferOut(memberModal.member.id, destinationChurch, boardApprovalDate);
      setMemberModal({ isOpen: false, member: null, mode: 'VIEW' });
    }
  };

  const confirmRestore = () => {
    if (memberModal.member && restorationComment && restorationDate) {
      onRestoreMember(memberModal.member.id, restorationComment, restorationDate);
      setMemberModal({ isOpen: false, member: null, mode: 'VIEW' });
    }
  };

  const downloadPDFReport = () => {
    if (filterStatus === 'ALL') return;

    const doc = new jsPDF('landscape');
    const dateStr = new Date().toLocaleDateString();

    let reportMembers = [...filteredMembers];
    let reportTitle = filterStatus === 'ALL' ? "Full Membership Registry" : `${filterStatus.replace('_', ' ')} Category Report`;
    
    if (filterStatus === MemberStatus.ACTIVE) {
      reportTitle = "Active Membership List (Aggregated)";
    } else if (filterStatus === MemberStatus.BAPTIZED && selectedYear !== 'ALL') {
      reportTitle = `Baptized Members (${selectedYear}) Registry Report`;
    }

    if (searchQuery) {
      reportTitle += ` (Filtered: "${searchQuery}")`;
    }

    reportMembers.sort((a, b) => a.lastName.localeCompare(b.lastName));

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(`${APP_NAME}`, 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(reportTitle, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Authorized Export by: ${userRole} | Date: ${dateStr} | Records: ${reportMembers.length}`, 14, 40);

    const tableRows = reportMembers.map(m => [
      `${m.firstName} ${m.lastName}`,
      m.status === MemberStatus.TRANSFERRED_OUT ? "" : m.nationalId,
      m.email,
      m.phone,
      getRelevantDate(m),
      m.status === MemberStatus.TRANSFERRED_OUT ? "" : "GOOD STANDING",
      m.status === MemberStatus.TRANSFERRED_IN 
        ? `FROM: ${m.previousChurch || "N/A"}`.toUpperCase()
        : m.status === MemberStatus.TRANSFERRED_OUT 
          ? `TO: ${m.destinationChurch || "TRANSFERRED OUT"}`.toUpperCase() 
          : "MAG-WEST SDA"
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Full Name', 'National ID', 'Email', 'Phone', 'Relevant Date', 'Status', 'Notes']],
      body: tableRows,
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 10, halign: 'left' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 50 },
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
    });

    doc.save(`${APP_NAME.replace(/\s+/g, '_')}_Report_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      {/* Search & Filter Controls */}
      <div className="p-6 border-b flex flex-col xl:flex-row gap-4 items-center justify-between bg-slate-50">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-80">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name, ID, or Phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap">View Category:</span>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => { setFilterStatus('ALL'); setSelectedYear('ALL'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
              >
                All Members
              </button>
              {Object.values(MemberStatus).map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); if (s !== MemberStatus.BAPTIZED) setSelectedYear('ALL'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                >
                  {s === MemberStatus.ACTIVE ? 'Active Members' : s.replace('_', ' ')}
                </button>
              ))}
            </div>

            {filterStatus === MemberStatus.BAPTIZED && (
              <div className="flex items-center gap-2 ml-0 md:ml-4 bg-white border border-emerald-200 rounded-xl px-3 py-1 shadow-sm animate-in slide-in-from-left duration-200">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Year:</span>
                <select
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer p-1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="ALL">All Baptism Years</option>
                  {availableBaptismYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-end">
          <button 
            onClick={downloadPDFReport}
            disabled={filterStatus === 'ALL'}
            title={filterStatus === 'ALL' ? "Select a specific category to export a report" : "Export category report as PDF"}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap ${
              filterStatus === 'ALL' 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export List as PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-4 border-b">Member Profile</th>
              <th className="px-6 py-4 border-b text-center">National ID</th>
              <th className="px-6 py-4 border-b text-center">Key Date</th>
              <th className="px-6 py-4 border-b text-center">Category Status</th>
              <th className="px-6 py-4 border-b">NOTES</th>
              <th className="px-6 py-4 border-b text-right">Registry Tools</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const isTransferredOut = member.status === MemberStatus.TRANSFERRED_OUT;
                const isTransferredIn = member.status === MemberStatus.TRANSFERRED_IN;
                const isInactive = member.status === MemberStatus.INACTIVE;
                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black transition-all shadow-sm shrink-0 ${isTransferredOut ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-900 leading-tight text-sm">{member.firstName} {member.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!isTransferredOut ? (
                        <span className="text-[10px] font-mono font-bold bg-white px-3 py-1 rounded-lg text-slate-600 border border-slate-200 shadow-sm">
                          {member.nationalId}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold ${isTransferredOut ? 'text-orange-600' : 'text-slate-700'}`}>
                        {getRelevantDate(member)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!isTransferredOut ? (
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(member.status)}`}>
                          GOOD STANDING
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      {isTransferredIn ? (
                        <span className="text-[10px] font-black uppercase tracking-tight text-purple-600">
                          FROM: {member.previousChurch || "N/A"}
                        </span>
                      ) : isTransferredOut ? (
                        <span className="text-[10px] font-black uppercase tracking-tight text-orange-600">
                          TO: {member.destinationChurch || "TRANSFERRED OUT"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-500">
                          MAG-WEST SDA
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin ? (
                          <>
                            {!isTransferredOut && (
                              <>
                                {isInactive ? (
                                  <button 
                                    onClick={() => openMemberModal(member, 'RESTORE')}
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                  >
                                    Restore
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => openMemberModal(member, 'TRANSFER')}
                                    className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                  >
                                    Transfer
                                  </button>
                                )}
                              </>
                            )}
                            <button 
                              onClick={() => openMemberModal(member, 'VIEW')}
                              className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                              title="Quick View"
                            >
                              <ICONS.Users className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => openMemberModal(member, 'VIEW')}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                          >
                            <ICONS.Users className="w-4 h-4" />
                            View Full Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-24 text-center bg-white">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                      <ICONS.Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">No records found for this category</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t bg-slate-50 text-[10px] font-black text-slate-400 flex justify-between items-center uppercase tracking-[0.15em]">
        <div className="flex gap-4">
          <p>Registry View: {userRole}</p>
          <p>Records Displayed: {filteredMembers.length}</p>
        </div>
        <p>Magwegwe West Seventh-day Adventist Church Administration Portal</p>
      </div>

      {memberModal.isOpen && memberModal.member && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            {/* Compact Modal Header */}
            <div className={`px-8 py-6 border-b flex justify-between items-start ${
              memberModal.mode === 'TRANSFER' ? 'bg-orange-50' : 
              memberModal.mode === 'RESTORE' ? 'bg-emerald-50' : 'bg-slate-50'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-2xl font-black text-white shadow-lg ${
                  memberModal.mode === 'TRANSFER' ? 'bg-orange-500' : 
                  memberModal.mode === 'RESTORE' ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}>
                  {memberModal.member.firstName.charAt(0)}{memberModal.member.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {memberModal.member.firstName} {memberModal.member.lastName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm border ${getStatusColor(memberModal.member.status)}`}>
                      GOOD STANDING
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-inner">
                      ID: {memberModal.member.nationalId}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setMemberModal({ isOpen: false, member: null, mode: 'VIEW' })} 
                className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-900 shadow-md transition-all active:scale-90 border border-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {memberModal.mode === 'VIEW' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100 pb-1">Communication</h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><ICONS.Log className="w-4 h-4 rotate-180" /></div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{memberModal.member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><ICONS.Plus className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                            <p className="text-xs font-bold text-slate-800">{memberModal.member.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100 pb-1">Record Dates</h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><ICONS.Dashboard className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Joined</p>
                            <p className="text-xs font-bold text-slate-800">{new Date(memberModal.member.registrationDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><ICONS.Sparkles className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Updated</p>
                            <p className="text-xs font-bold text-slate-800">{getRelevantDate(memberModal.member)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-lg">
                    <h5 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Residential Address</h5>
                    <p className="text-xs font-bold leading-relaxed">{memberModal.member.address}</p>
                  </div>

                  {memberModal.member.status === MemberStatus.TRANSFERRED_IN && (
                     <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <h5 className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-600 mb-2">Origin Church</h5>
                        <p className="text-xs font-bold text-slate-700">{memberModal.member.previousChurch || "Information Not Provided"}</p>
                        <p className="text-[9px] text-slate-400 mt-2 font-medium italic">Membership transfer formally accepted on: {memberModal.member.boardApprovalDate || "Date Pending"}</p>
                     </div>
                  )}

                  {memberModal.member.status === MemberStatus.TRANSFERRED_OUT && (
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                      <h5 className="text-[8px] font-black uppercase tracking-[0.25em] text-orange-600 mb-2">Registry Notes</h5>
                      <p className="text-xs font-bold text-slate-700">MEMBER PROFILE ONLY, WITH VIEW DETAILS</p>
                      <div className="mt-2 pt-2 border-t border-orange-200">
                        <p className="text-[9px] text-slate-400 font-medium">Destination: {memberModal.member.destinationChurch || "N/A"}</p>
                        <p className="text-[9px] text-slate-400 font-medium">Board Action: {memberModal.member.boardApprovalDate || "N/A"}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {isAdmin && memberModal.member.status !== MemberStatus.TRANSFERRED_OUT && (
                      <>
                        {memberModal.member.status === MemberStatus.INACTIVE ? (
                          <button 
                            onClick={() => setMemberModal({ ...memberModal, mode: 'RESTORE' })}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all"
                          >
                            Restore
                          </button>
                        ) : (
                          <button 
                            onClick={() => setMemberModal({ ...memberModal, mode: 'TRANSFER' })}
                            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                          >
                            <ICONS.LogOut className="w-4 h-4" />
                            Transfer
                          </button>
                        )}
                      </>
                    )}
                    <button 
                      onClick={() => setMemberModal({ isOpen: false, member: null, mode: 'VIEW' })}
                      className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : memberModal.mode === 'TRANSFER' ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                    <p className="text-[11px] text-orange-800 font-medium leading-tight">
                      Process official transfer for this record.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Receiving Church</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Central SDA Church"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 transition-all font-bold text-xs text-slate-800"
                        value={destinationChurch}
                        onChange={(e) => setDestinationChurch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Board Action Date</label>
                      <input
                        required
                        type="date"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 transition-all font-bold text-xs text-slate-800"
                        value={boardApprovalDate}
                        onChange={(e) => setBoardApprovalDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMemberModal({ ...memberModal, mode: 'VIEW' })}
                      className="flex-1 py-3 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Back
                    </button>
                    <button
                      disabled={!destinationChurch || !boardApprovalDate}
                      onClick={confirmTransfer}
                      className="flex-1 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <p className="text-[11px] text-emerald-800 font-medium leading-tight">
                      Restore member to Active Members list.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Comment</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Reason for restoration..."
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 transition-all font-bold text-xs text-slate-800 resize-none"
                        value={restorationComment}
                        onChange={(e) => setRestorationComment(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Restoration Date</label>
                      <input
                        required
                        type="date"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 transition-all font-bold text-xs text-slate-800"
                        value={restorationDate}
                        onChange={(e) => setRestorationDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMemberModal({ ...memberModal, mode: 'VIEW' })}
                      className="flex-1 py-3 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Back
                    </button>
                    <button
                      disabled={!restorationComment || !restorationDate}
                      onClick={confirmRestore}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
