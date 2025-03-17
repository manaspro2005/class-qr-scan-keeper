
import { AttendanceEvent } from '@/types';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Download } from 'lucide-react';
import { exportToExcel } from './utils';

interface EventCardProps {
  event: AttendanceEvent;
  onViewDetails: (event: AttendanceEvent) => void;
}

export const EventCard = ({ event, onViewDetails }: EventCardProps) => {
  return (
    <TableRow className="hover-scale">
      <TableCell>{event.date}</TableCell>
      <TableCell>{event.time}</TableCell>
      <TableCell className="hidden md:table-cell">{event.subject}</TableCell>
      <TableCell className="hidden md:table-cell">{event.room}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-normal">
          <Users className="mr-1 h-3 w-3" />
          {event.attendees.length}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(event)}
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(event)}
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
