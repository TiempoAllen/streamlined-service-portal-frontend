import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import classes from "../../components/UI/RequestDialogPortal.module.css";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import axios from "axios";
import { LOCAL_ENV } from "../../util/auth";

const PersonnelProfile = ({ tech_id }) => {
  const [schedules, setSchedule] = useState([]);

  const getScheduleByPersonnel = async () => {
    try {
      const response = await axios.get(
        `${LOCAL_ENV}/technician/${tech_id}/schedule`
      );
      setSchedule(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getScheduleByPersonnel();
  }, [schedules]);

  const events = schedules.map((schedule) => {
    return {
      title: schedule.request.title,
      start: schedule.request.scheduledStartDate,
      end: schedule.request.scheduledEndDate,
    };
  });

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={classes.DialogOverlay} />
      <Dialog.Content className={classes.TechnicianDialogContent}>
        <Dialog.Title className={classes.DialogTitle}>
          <p>Profile and Schedule</p>
        </Dialog.Title>
        <Dialog.Description className={classes.DialogDescription}>
          Detailed Personnel Information
        </Dialog.Description>
        <div className={classes.technicianCalendarParent}>
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

        <Dialog.Close asChild>
          <button className={classes.IconButton} aria-label="Close">
            <Cross2Icon />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default PersonnelProfile;
