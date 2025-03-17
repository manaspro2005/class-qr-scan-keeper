
import { Attendee } from '@/types';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface AttendeeTableProps {
  attendees: Attendee[];
}

export const AttendeeTable = ({ attendees }: AttendeeTableProps) => {
  if (attendees.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No students marked present yet.</p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Roll No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SAP ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendees
            .sort((a, b) => a.rollNo.localeCompare(b.rollNo))
            .map((attendee: Attendee) => (
              <TableRow key={attendee.studentId}>
                <TableCell>{attendee.rollNo}</TableCell>
                <TableCell>{attendee.name}</TableCell>
                <TableCell>{attendee.sapId}</TableCell>
                <TableCell>
                  {attendee.present ? (
                    <Badge variant="default" className="bg-green-500">
                      <Check className="mr-1 h-3 w-3" />
                      Present
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <X className="mr-1 h-3 w-3" />
                      Absent
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {attendee.present ? 
                    new Date(attendee.scanTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'
                  }
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
