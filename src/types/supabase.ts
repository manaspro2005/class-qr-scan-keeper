
import { Database } from '@/integrations/supabase/types';

// Export useful type aliases based on the generated Database type
export type Tables = Database['public']['Tables'];
export type User = Tables['users']['Row'];
export type Subject = Tables['subjects']['Row'];
export type Department = Tables['departments']['Row'];
export type Year = Tables['years']['Row'];

// Define additional types needed for our application
export type AttendanceRecordWithDetails = Tables['attendance_records']['Row'] & {
  user: User;
  subject: Subject;
};
