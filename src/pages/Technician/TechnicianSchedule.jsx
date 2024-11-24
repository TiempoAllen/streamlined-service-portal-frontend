import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import React from "react";
import { useLocation } from "react-router-dom";
import classes from "./Technician.module.css";

const TechnicianSchedule = () => {
  const location = useLocation();
  const { requests } = location.state || { requests: [] };

  console.log(requests);

  const events = requests.map((request) => {
    return {
      title: request.title,
      start: request.scheduledDate,
      end: request.scheduledDate,
    };
  });

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
