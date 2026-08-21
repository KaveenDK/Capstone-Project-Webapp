// Student types
export interface Student {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: string;
}

export interface StudentFormData {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: File | null;
}

// Program types
export interface Program {
  programId: string;
  description: string;
}

export interface ProgramFormData {
  programId: string;
  description: string;
}

// Enrollment types
export interface StudentSummary {
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: string;
}

export interface Enrollment {
  id?: number;
  date: string;
  studentId: string;
  programId: string;
  student?: StudentSummary;
}

export interface EnrollmentFormData {
  date: string;
  studentId: string;
  programId: string;
}

// API response wrapper
export interface ApiError {
  message: string;
  status?: number;
}
