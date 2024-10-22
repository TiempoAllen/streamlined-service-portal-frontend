import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // for month/day views
import timeGridPlugin from "@fullcalendar/timegrid"; // for time-based views
import listPlugin from "@fullcalendar/list"; // for list views
import { useLocation } from "react-router-dom";
import classes from "./Technician.module.css";

const TechnicianSchedule = () => {
  const location = useLocation();
  const { requests } = location.state || { requests: [] };

  const events = requests.map((request) => ({
    title: `${request.title}`,
    start: request.startTime,
    end: request.endTime,
  }));

  return (
    <div className={classes.calendarParent}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        views={{
          listWeek: { buttonText: "List" },
        }}
        weekends={true}
        events={events}
      />
    </div>
  );
};

export default TechnicianSchedule;
