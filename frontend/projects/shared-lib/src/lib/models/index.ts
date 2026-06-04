export interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reporter {
  type: 'STUDENT' | 'STAFF';
  name: string;
  rollNo?: string;
  employeeId?: string;
  department?: string;
  phone: string;
  email: string;
}

export interface ReturnedTo {
  studentName: string;
  rollNo: string;
  phone?: string;
  email?: string;
  returnedDate?: string;
  returnedTime?: string;
  claimedDate?: string; // from lost item mapping
  remarks?: string;
}

export interface Item {
  _id?: string;
  itemId: string;
  name: string;
  description: string;
  category: string;
  location: string;
  collectFrom: string;
  dateFound: string;
  status: string; // "Not Returned" | "Returned"
  image?: string;
  reporter?: Reporter;
  reportedAt?: string;
  lastUpdated?: string;
  isDeleted?: boolean;
  returnedTo?: ReturnedTo;
}

export interface Category {
  _id?: string;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DisposedRecord {
  _id?: string;
  originalItemId: string;
  name: string;
  type: string;
  reportedDate: string;
  location: string;
  disposalLocation: string;
  donatedTo?: string;
  disposedDate: string;
  notes?: string;
  reporter?: Reporter;
  createdAt?: string;
}

export interface OverviewStats {
  total: number;
  lost: number;
  found: number;
  returned: number;
  lostPercentage: number;
  foundPercentage: number;
  returnRate: number;
}

export interface CountdownStats {
  totalUnclaimed: number;
  active: number;
  expiring: number;
  last10: number;
  expired: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export * from './search-config';

