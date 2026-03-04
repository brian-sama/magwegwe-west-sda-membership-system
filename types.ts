export enum UserRole {
  ADMIN = 'Admin',
  PASTOR = 'Pastor',
  CLERK = 'Clerk',
  VIEWER = 'Viewer',
}

export enum MemberStatus {
  BAPTIZED = 'BAPTIZED',
  TRANSFERRED_IN = 'TRANSFERRED_IN',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED_OUT = 'TRANSFERRED_OUT',
}

export enum YouthClubType {
  PATHFINDER = 'PATHFINDER',
  ADVENTURER = 'ADVENTURER',
}

export enum SocietyType {
  DORCAS = 'DORCAS',
  AMO = 'AMO',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: string;
  password?: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  status: MemberStatus;
  department?: string;
  registrationDate: string;
  baptismDate?: string;
  previousChurch?: string;
  destinationChurch?: string;
  transferDate?: string;
  boardApprovalDate?: string;
  address: string;
  notes?: string;
}

export interface YouthMember {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  parentName: string;
  parentPhone: string;
  grade: string;
  club: YouthClubType;
  rank: string;
  healthNotes?: string;
  registrationDate: string;
  school?: string;
}

export interface SocietyMember {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  type: SocietyType;
  skills: string;
  registrationDate: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  eventType: 'Sabbath' | 'Youth' | 'Society' | 'Campmeeting';
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface Society {
  id: string;
  name: string;
  leader?: string;
  assistantLeader?: string;
  meetingDay?: string;
  memberCount?: number;
}

export interface ReportRequest {
  type: 'members' | 'youth' | 'societies' | 'attendance';
  format: 'pdf' | 'xlsx';
}

export interface SearchResult {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  status: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
