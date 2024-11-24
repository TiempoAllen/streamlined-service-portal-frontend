import React, { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import classes from "./RequestDialogPortal.module.css";
import MessagePortal from "./MessagePortal";

const TechnicianPortal = ({
  technicians,
  request,
  onAssignTechnicianToRequest,
  isTimeConflict,
  timeConflictError,
  isTechnicianAssigned,
}) => {
  const [showError, setShowError] = useState(false);
  const [assignedTechnician, setAssignedTechnician] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");

  // const availableTechnicians = technicians.filter(
  //   (technician) => technician.isavailable === true
  // );

  useEffect(() => {
    if (isTimeConflict) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer); // Cleanup the timer
    }
    console.log("Updated assignedTechnician:", assignedTechnician);
  }, [isTimeConflict, assignedTechnician]);

  const handleAssignClick = (technician) => {
    setAssignedTechnician(technician.PersonnelID);
    document.querySelector("input[name='assignedPersonnel']").value =
      technician.Name;
  };

  const handleScheduleDateChange = (event) => {
    setScheduledDate(event.target.value);
  };

  const handleAssignTechnician = () => {
    if (assignedTechnician && scheduledDate) {
      onAssignTechnicianToRequest(
        request.request_id,
        assignedTechnician,
        scheduledDate
      );
    } else {
      alert("Please select a technician and schedule a date.");
    }
  };

  const [colDefs, setColDefs] = useState([
    { field: "PersonnelID", flex: 1 },
    { field: "Name", flex: 1 },
    { field: "Phone Number", flex: 1 },
    { field: "Gender", flex: 1 },
    { field: "Classification", flex: 1 },
    { field: "Availability", flex: 1 },
    {
      field: "Action",
      flex: 1,
      cellRenderer: (params) => (
        <button onClick={() => handleAssignClick(params.data)}>Assign</button>
      ),
    },
  ]);

  const transformedTechnicians = technicians.map((technician) => {
    return {
      PersonnelID: technician.tech_id,
      Name: technician.tech_name,
      "Phone Number": technician.tech_phone,
      Gender: technician.tech_gender,
      Classification: technician.tech_classification,
      Availability: technician.isavailable,
    };
  });

  return (
    <>
      <Dialog.Portal>
        <Dialog.Overlay className={classes.DialogOverlay} />
        <Dialog.Content className={classes.TechnicianDialogContent}>
          <Dialog.Title className={classes.TechnicianDialogTitle}>
            Assign and Schedule
          </Dialog.Title>
          <div className={classes.personnelSection}>
            <h4>1. Assign a Personnel</h4>
            <div className={classes.form}>
              <p>Assigned Personnel:</p>
              <input
                type="text"
                name="assignedPersonnel"
                className={classes.assignedPersonnel}
                readOnly
                required
              />
            </div>
            <div
              className="ag-theme-quartz"
              style={{ height: "100%", width: "100%", marginTop: "1rem" }}
            >
              <AgGridReact
                rowData={transformedTechnicians}
                columnDefs={colDefs}
                domLayout="autoHeight"
              />
            </div>
          </div>
          <div className={classes.personnelSection}>
            <h4>2. Schedule Date and Time</h4>
            <input
              type="datetime-local"
              name="scheduleDate"
              className={classes.scheduledDate}
              value={scheduledDate}
              onChange={handleScheduleDateChange}
              required
            />
          </div>

          {showError && (
            <p className={classes.timeConflictError}>{timeConflictError}</p>
          )}
          <div
            style={{
              display: "flex",
              marginTop: 25,
              justifyContent: "flex-end",
              gap: "1rem",
            }}
          >
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className={classes.btnApprove}>Proceed</button>
              </Dialog.Trigger>
              <MessagePortal
                messageType="assign"
                onAssignTechnicianToRequest={onAssignTechnicianToRequest}
                request_id={request.request_id}
                assignedTechnician={assignedTechnician}
                scheduledDate={scheduledDate}
                isTechnicianAssigned={isTechnicianAssigned}
              />
            </Dialog.Root>
            <Dialog.Close asChild>
              <button className={classes.btnBack}>Back</button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button className={classes.IconButton} aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
};

export default TechnicianPortal;
