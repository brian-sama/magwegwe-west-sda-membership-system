
import React, { useState, useEffect } from 'react';
import { UserRole, MemberStatus, User, Member, AuditLog, AuthState, YouthMember, YouthClubType, SocietyMember, SocietyType } from './types';
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

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('members');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'm1', firstName: 'Sipho', lastName: 'Ndlovu', nationalId: '63-123456A78', email: 'sipho.n@example.com', phone: '+263 77 111 2222', status: MemberStatus.BAPTIZED, registrationDate: '2023-01-15', baptismDate: '2023-01-15', address: 'Plot 42 Magwegwe West, Bulawayo' },
      { id: 'm2', firstName: 'Nomsa', lastName: 'Moyo', nationalId: '08-987654B32', email: 'nomsa.m@example.com', phone: '+263 71 333 4444', status: MemberStatus.TRANSFERRED_IN, registrationDate: '2023-03-20', previousChurch: 'Solusi University Church', boardApprovalDate: '2023-03-15', address: 'House 1205, Cowdray Park, Bulawayo' },
      { id: 'm3', firstName: 'Themba', lastName: 'Sibanda', nationalId: '29-555444C11', email: 'themba.s@example.com', phone: '+263 73 555 6666', status: MemberStatus.ACTIVE, registrationDate: '2022-11-10', address: '789 Nkulumane 5, Bulawayo' },
      { id: 'm4', firstName: 'Bongani', lastName: 'Ncube', nationalId: '44-222333D99', email: 'bongani.n@example.com', phone: '+263 78 444 5555', status: MemberStatus.INACTIVE, registrationDate: '2021-05-12', address: 'Flat 4B, Lobengula West, Bulawayo' },
      { id: 'm5', firstName: 'Lindiwe', lastName: 'Dube', nationalId: '15-666777E44', email: 'lindiwe.d@example.com', phone: '+263 77 999 8888', status: MemberStatus.TRANSFERRED_OUT, registrationDate: '2020-08-15', destinationChurch: 'Mabvuku SDA Church', transferDate: '2023-09-12', boardApprovalDate: '2023-09-10', address: '2234 Luveve 4, Bulawayo' }
    ];
  });

  const [youthMembers, setYouthMembers] = useState<YouthMember[]>(() => {
    const saved = localStorage.getItem('youthMembers');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'y1', firstName: 'Junior', lastName: 'Ndlovu', dob: '2012-05-14', parentName: 'Sipho Ndlovu', parentPhone: '+263 77 111 2222', grade: 'Grade 6', club: YouthClubType.PATHFINDER, rank: 'Companion', healthNotes: 'Allergic to peanuts', registrationDate: '2024-01-20' }
    ];
  });

  const [societyMembers, setSocietyMembers] = useState<SocietyMember[]>(() => {
    const saved = localStorage.getItem('societyMembers');
    if (saved) return JSON.parse(saved);
    return [
      { id: 's1', firstName: 'Martha', lastName: 'Ncube', nationalId: '22-888777X12', phone: '+263 77 888 9999', type: SocietyType.DORCAS, skills: 'Tailoring, Counseling', registrationDate: '2023-05-10' }
    ];
  });

  const [systemUsers, setSystemUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('systemUsers');
    return saved ? JSON.parse(saved) : [
      { id: 'u1', name: 'Elder Musoni', email: 'admin@magwegwesda.org', role: UserRole.ADMIN, lastLogin: '2023-10-25' },
      { id: 'u2', name: 'Pastor Peter', email: 'pastor@magwegwesda.org', role: UserRole.PASTOR, lastLogin: '2023-10-24' },
      { id: 'u3', name: 'Clerk Moyo', email: 'clerk@magwegwesda.org', role: UserRole.CLERK, lastLogin: '2023-10-25' }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('auditLogs');
    return saved ? JSON.parse(saved) : [
      { id: 'l1', timestamp: new Date().toISOString(), userId: 'u1', userName: 'Elder Musoni', action: 'SYSTEM_BOOT', details: 'System initialized' }
    ];
  });

  useEffect(() => { localStorage.setItem('members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('youthMembers', JSON.stringify(youthMembers)); }, [youthMembers]);
  useEffect(() => { localStorage.setItem('societyMembers', JSON.stringify(societyMembers)); }, [societyMembers]);
  useEffect(() => { localStorage.setItem('systemUsers', JSON.stringify(systemUsers)); }, [systemUsers]);
  useEffect(() => { localStorage.setItem('auditLogs', JSON.stringify(auditLogs)); }, [auditLogs]);

  const addLog = (action: string, details: string) => {
    if (!authState.user) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: authState.user.id,
      userName: authState.user.name,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
    addLog('LOGIN', `User ${user.name} logged in`);
  };

  const handleLogout = () => {
    addLog('LOGOUT', `User ${authState.user?.name} logged out`);
    setAuthState({ user: null, isAuthenticated: false });
    setActiveTab('dashboard');
  };

  const handleAddMember = (newMember: Member) => {
    setMembers(prev => [...prev, newMember]);
    addLog('ADD_MEMBER', `Registered: ${newMember.firstName} ${newMember.lastName}`);
    setActiveTab('members');
  };

  const handleAddYouth = (newMember: YouthMember) => {
    setYouthMembers(prev => [...prev, newMember]);
    addLog(`ADD_${newMember.club}`, `Registered: ${newMember.firstName} ${newMember.lastName}`);
    setActiveTab(newMember.club.toLowerCase() + 's');
  };

  const handleAddSociety = (newMember: SocietyMember) => {
    setSocietyMembers(prev => [...prev, newMember]);
    addLog(`ADD_${newMember.type}`, `Enrolled: ${newMember.firstName} ${newMember.lastName}`);
    setActiveTab(newMember.type.toLowerCase());
  };

  const handleTransferOut = (memberId: string, destinationChurch: string, boardDate: string) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, status: MemberStatus.TRANSFERRED_OUT, destinationChurch, transferDate: new Date().toISOString(), boardApprovalDate: boardDate } : m
    ));
    const member = members.find(m => m.id === memberId);
    addLog('TRANSFER_OUT', `Member ${member?.firstName} ${member?.lastName} transferred to ${destinationChurch}`);
  };

  const handleRestoreMember = (memberId: string, comment: string, date: string) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, status: MemberStatus.ACTIVE, boardApprovalDate: date, notes: `Restored: ${comment}` } : m
    ));
    const member = members.find(m => m.id === memberId);
    addLog('RESTORE_MEMBER', `Restored member ${member?.firstName} ${member?.lastName}`);
  };

  const handleDeleteUser = (userId: string) => {
    setSystemUsers(prev => prev.filter(u => u.id !== userId));
    addLog('DELETE_USER', `Removed access for: ${userId}`);
  };

  const handleAddUser = (newUser: User) => {
    setSystemUsers(prev => [...prev, newUser]);
    addLog('ADD_USER', `Granted access to: ${newUser.name}`);
  };

  if (!authState.isAuthenticated) return <LoginForm onLogin={handleLogin} />;

  const role = authState.user?.role;
  const isAdmin = role === UserRole.ADMIN;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-sm font-bold flex items-center gap-2">
            <ICONS.Shield className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>{APP_NAME}</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <SidebarItem icon={<ICONS.Dashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<ICONS.Users />} label="Member Directory" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
          
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
          {activeTab === 'members' && <MemberDirectory members={members} userRole={role!} onTransferOut={handleTransferOut} onRestoreMember={handleRestoreMember} />}
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
