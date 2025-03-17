
export interface User {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  name: string;
  department?: string;
  year?: string;
  rollNo?: string;
  sapId?: string;
  phone?: string;
  verified: boolean;
}

export interface Teacher extends User {
  role: 'teacher';
}

export interface Student extends User {
  role: 'student';
  rollNo: string;
  sapId: string;
  department: string;
  year: string;
}

export interface AttendanceEvent {
  id: string;
  teacherId: string;
  date: string;
  time: string;
  room: string;
  subject: string;
  department: string;
  year: string;
  qrCode: string;
  qrExpiry: Date;
  createdAt: Date;
  attendees: Attendee[];
  absentProcessed?: boolean; // Added this property
}

export interface Attendee {
  studentId: string;
  name: string;
  rollNo: string;
  sapId: string;
  scanTime: Date;
  present: boolean;
}

export interface QRData {
  eventId: string;
  teacherId: string;
  room: string;
  subject: string;
  department: string;
  year: string;
  expiry: Date;
  secret: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  role: 'teacher' | 'student';
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: 'teacher' | 'student';
  department?: string;
  year?: string;
  rollNo?: string;
  sapId?: string;
  phone?: string;
}

export interface AttendanceFormData {
  time: string;
  room: string;
  subject: string;
  department: string;
  year: string;
}
