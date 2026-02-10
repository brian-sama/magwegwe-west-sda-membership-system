
export enum UserRole {
  ADMIN = 'ADMIN',
  PASTOR = 'PASTOR',
  CLERK = 'CLERK'
}

export enum MemberStatus {
  BAPTIZED = 'BAPTIZED',
  TRANSFERRED_IN = 'TRANSFERRED_IN',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED_OUT = 'TRANSFERRED_OUT'
}

export enum YouthClubType {
  PATHFINDER = 'PATHFINDER',
  ADVENTURER = 'ADVENTURER'
}

export enum SocietyType {
  DORCAS = 'DORCAS',
  AMO = 'AMO'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  status: MemberStatus;
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
  rank: string; // e.g., Friend, Companion, Busy Bee, Sunbeam
  healthNotes?: string;
  registrationDate: string;
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
