import React, { useState, useEffect } from 'react';
import { UserRole, MemberStatus, User, Member, AuditLog, AuthState, YouthMember, YouthClubType, SocietyMember, SocietyType, AttendanceRecord, ReportRequest } from './types';
import { ICONS, APP_NAME } from './constants';
import DashboardView from './components/DashboardView';
import MemberDirectory from './components/MemberDirectory';
import AddMemberForm from './components/AddMemberForm';
import UserManagement from './components/UserManagement';
import AuditLogsView from './components/AuditLogsView';
import LoginForm from './components/LoginForm';
import YouthRegistryView from './components/YouthRegistryView';
import YouthRegistrationForm from './components/YouthRegistrationForm';
import SocietyRegistryView from './components/SocietyRegistryView';
import SocietyRegistrationForm from './components/SocietyRegistrationForm';
import AttendanceView from './components/AttendanceView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import { api } from './src/services/api';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [activeTab, setActiveTab] = useState('dashboard');

  const [members, setMembers] = useState<Member[]>([]);
  const [youthMembers, setYouthMembers] = useState<YouthMember[]>([]);
  const [societyMembers, setSocietyMembers] = useState<SocietyMember[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const loadAll = async () => {
    const [m, y, s, u, l, a] = await Promise.allSettled([
      api.members.getAll(),
      api.youth.getAll(),
      api.society.getAll(),
      api.users.getAll(),
      api.logs.getAll(),
      api.attendance.getAll(),
    ]);

    if (m.status === 'fulfilled') setMembers(m.value);
    if (y.status === 'fulfilled') setYouthMembers(y.value);
    if (s.status === 'fulfilled') setSocietyMembers(s.value);
    if (u.status === 'fulfilled') setSystemUsers(u.value);
    if (l.status === 'fulfilled') setAuditLogs(l.value);
    if (a.status === 'fulfilled') setAttendance(a.value);
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadAll().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated]);

  const addLog = async (action: string, details: string) => {
    if (!authState.user) return;
    try {
      await api.logs.create({ userId: authState.user.id, action, details });
      const logs = await api.logs.getAll();
      setAuditLogs(logs);
    } catch {
      // Ignore logging errors in UI, server middleware still tracks writes.
    }
  };

  const handleLogin = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
    addLog('LOGIN', `User ${user.name} logged in`);
  };

  const handleLogout = async () => {
    addLog('LOGOUT', `User ${authState.user?.name} logged out`);
    await api.auth.logout();
    setAuthState({ user: null, isAuthenticated: false });
    setActiveTab('dashboard');
  };

  const handleAddMember = async (newMember: Member) => {
    try {
      await api.members.create(newMember);
      setMembers(await api.members.getAll());
      addLog('ADD_MEMBER', `Registered: ${newMember.firstName} ${newMember.lastName}`);
      setActiveTab('members');
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportMembers = async (importedMembers: Member[]) => {
    try {
      for (const member of importedMembers) {
        await api.members.create(member);
      }
      setMembers(await api.members.getAll());
      addLog('IMPORT_MEMBERS', `Imported ${importedMembers.length} members via CSV`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddYouth = async (newMember: YouthMember) => {
    try {
      await api.youth.create(newMember);
      setYouthMembers(await api.youth.getAll());
      addLog(`ADD_${newMember.club}`, `Registered: ${newMember.firstName} ${newMember.lastName}`);
      setActiveTab(newMember.club.toLowerCase() + 's');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSociety = async (newMember: SocietyMember) => {
    try {
      await api.society.create(newMember);
      setSocietyMembers(await api.society.getAll());
      addLog(`ADD_${newMember.type}`, `Enrolled: ${newMember.firstName} ${newMember.lastName}`);
      setActiveTab(newMember.type.toLowerCase());
    } catch (e) {
      console.error(e);
    }
  };

  const handleTransferOut = async (memberId: string, destinationChurch: string, boardDate: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (member) {
        await api.members.update(memberId, {
          ...member,
          status: MemberStatus.TRANSFERRED_OUT,
          destinationChurch,
          transferDate: new Date().toISOString(),
          boardApprovalDate: boardDate,
        });
        setMembers(await api.members.getAll());
        addLog('TRANSFER_OUT', `Member ${member.firstName} ${member.lastName} transferred to ${destinationChurch}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreMember = async (memberId: string, comment: string, date: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (member) {
        await api.members.update(memberId, {
          ...member,
          status: MemberStatus.ACTIVE,
          boardApprovalDate: date,
          notes: `Restored: ${comment}`,
        });
        setMembers(await api.members.getAll());
        addLog('RESTORE_MEMBER', `Restored member ${member.firstName} ${member.lastName}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.users.delete(userId);
      setSystemUsers(await api.users.getAll());
      addLog('DELETE_USER', `Removed access for user ID: ${userId}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUser = async (newUser: User) => {
    try {
      await api.users.create(newUser);
      setSystemUsers(await api.users.getAll());
      addLog('ADD_USER', `Granted access to: ${newUser.name}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordAttendance = async (payload: { memberId: string; eventType: AttendanceRecord['eventType']; date: string; status?: AttendanceRecord['status'] }) => {
    await api.attendance.create(payload);
    setAttendance(await api.attendance.getAll());
  };

  const handleScanAttendance = async (payload: { qr_payload: string; event_type: AttendanceRecord['eventType']; date: string }) => {
    await api.attendance.scan(payload);
    setAttendance(await api.attendance.getAll());
  };

  const handleExport = async (request: ReportRequest) => {
    const token = localStorage.getItem('token');
    const response = await fetch(api.reports.getUrl(request.type, request.format), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${request.type}-report.${request.format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!authState.isAuthenticated) return <LoginForm onLogin={handleLogin} />;

  const role = authState.user?.role;
  const isAdmin = role === UserRole.ADMIN;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-sm font-bold flex items-center gap-3">
            <img src="/sda-logo.png" alt="SDA Logo" className="w-[28px] h-[32px] object-contain shrink-0" />
            <span>{APP_NAME}</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <SidebarItem icon={<ICONS.Dashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<ICONS.Users />} label="Member Directory" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
          <SidebarItem icon={<ICONS.Log />} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
          <SidebarItem icon={<ICONS.Log />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <SidebarItem icon={<ICONS.Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Departments</div>
          <SidebarItem icon={<ICONS.Tent />} label="Pathfinders" active={activeTab === 'pathfinders'} onClick={() => setActiveTab('pathfinders')} />
          <SidebarItem icon={<ICONS.Compass />} label="Adventurers" active={activeTab === 'adventurers'} onClick={() => setActiveTab('adventurers')} />
          <SidebarItem icon={<ICONS.Heart />} label="Dorcas" active={activeTab === 'dorcas'} onClick={() => setActiveTab('dorcas')} />
          <SidebarItem icon={<ICONS.Hammer />} label="Adventist Men (AMO)" active={activeTab === 'amo'} onClick={() => setActiveTab('amo')} />

          {(isAdmin || role === UserRole.CLERK) && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Registry Admin</div>
              <SidebarItem icon={<ICONS.UserPlus />} label="Register Member" active={activeTab === 'add-member'} onClick={() => setActiveTab('add-member')} />
              <SidebarItem icon={<ICONS.Plus />} label="Enroll Youth" active={activeTab === 'add-youth'} onClick={() => setActiveTab('add-youth')} />
              <SidebarItem icon={<ICONS.Plus />} label="Enroll Society" active={activeTab === 'add-society'} onClick={() => setActiveTab('add-society')} />

              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">System</div>
              {isAdmin && <SidebarItem icon={<ICONS.Settings />} label="Manage Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />}
              <SidebarItem icon={<ICONS.Log />} label="Security Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">{authState.user?.name.charAt(0)}</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{authState.user?.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <ICONS.LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold capitalize">{activeTab.replace(/-/g, ' ')}</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <DashboardView members={members} logs={auditLogs} userRole={role!} />}
          {activeTab === 'members' && <MemberDirectory members={members} userRole={role!} onTransferOut={handleTransferOut} onRestoreMember={handleRestoreMember} onAddMember={() => setActiveTab('add-member')} onImportMembers={handleImportMembers} />}
          {activeTab === 'attendance' && <AttendanceView records={attendance} members={members} userRole={role!} onRecord={handleRecordAttendance} onScan={handleScanAttendance} />}
          {activeTab === 'reports' && <ReportsView userRole={role!} onExport={handleExport} />}
          {activeTab === 'settings' && <SettingsView userRole={role!} />}

          {activeTab === 'pathfinders' && <YouthRegistryView club={YouthClubType.PATHFINDER} members={youthMembers.filter(m => m.club === YouthClubType.PATHFINDER)} userRole={role!} />}
          {activeTab === 'adventurers' && <YouthRegistryView club={YouthClubType.ADVENTURER} members={youthMembers.filter(m => m.club === YouthClubType.ADVENTURER)} userRole={role!} />}
          {activeTab === 'dorcas' && <SocietyRegistryView type={SocietyType.DORCAS} members={societyMembers.filter(m => m.type === SocietyType.DORCAS)} userRole={role!} />}
          {activeTab === 'amo' && <SocietyRegistryView type={SocietyType.AMO} members={societyMembers.filter(m => m.type === SocietyType.AMO)} userRole={role!} />}

          {(isAdmin || role === UserRole.CLERK) && (
            <>
              {activeTab === 'add-member' && <AddMemberForm onAdd={handleAddMember} />}
              {activeTab === 'add-youth' && (
                <div className="space-y-6">
                  <YouthRegistrationForm club={YouthClubType.PATHFINDER} onAdd={handleAddYouth} />
                  <YouthRegistrationForm club={YouthClubType.ADVENTURER} onAdd={handleAddYouth} />
                </div>
              )}
              {activeTab === 'add-society' && (
                <div className="space-y-6">
                  <SocietyRegistrationForm type={SocietyType.DORCAS} onAdd={handleAddSociety} />
                  <SocietyRegistrationForm type={SocietyType.AMO} onAdd={handleAddSociety} />
                </div>
              )}
              {activeTab === 'users' && isAdmin && <UserManagement users={systemUsers} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} currentUserId={authState.user?.id || ''} />}
              {activeTab === 'logs' && <AuditLogsView logs={auditLogs} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <span className="shrink-0">{icon}</span> <span>{label}</span>
  </button>
);

export default App;
