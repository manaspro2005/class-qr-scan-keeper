
import React from "react";

interface EventDetailsProps {
  eventData: {
    subject: string;
    room: string;
    department: string;
    year: string;
    date: string;
    time: string;
  };
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventData }) => {
  return (
    <div className="w-full space-y-2 mt-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Subject:</span>
          <p className="font-medium">{eventData.subject}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Room:</span>
          <p className="font-medium">{eventData.room}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Department:</span>
          <p className="font-medium">{eventData.department}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Year:</span>
          <p className="font-medium">{eventData.year}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Date:</span>
          <p className="font-medium">{eventData.date}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Time:</span>
          <p className="font-medium">{eventData.time}</p>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
