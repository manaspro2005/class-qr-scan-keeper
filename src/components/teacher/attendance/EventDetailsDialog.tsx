
import { AttendanceEvent } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Download, Users } from 'lucide-react';
import { AttendeeTable } from './AttendeeTable';
import { exportToExcel } from './utils';

interface EventDetailsDialogProps {
  event: AttendanceEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailsDialog = ({ event, open, onOpenChange }: EventDetailsDialogProps) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="space-y-1">
            <div className="flex justify-between items-center">
              <span>Attendance Record</span>
              <Badge variant="outline" className="ml-2">
                {event.department} - Year {event.year}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {event.time}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {event.subject}
            </h3>
            <Badge>Room {event.room}</Badge>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendance ({event.attendees.length || 0})
            </h4>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToExcel(event)}
            >
              <Download className="mr-1 h-4 w-4" />
              Export to Excel
            </Button>
          </div>

          <AttendeeTable attendees={event.attendees} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
