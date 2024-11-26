import React, { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import classes from "./RequestDialogPortal.module.css";
import MessagePortal from "./MessagePortal";
import { LOCAL_ENV } from "../../util/auth";
import axios from "axios";

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
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [scheduledEndDate, setScheduledEndDate] = useState("");
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // const availableTechnicians = technicians.filter(
  //   (technician) => technician.isavailable === true
  // );

  // useEffect(() => {
  //   if (isTimeConflict) {
  //     setShowError(true);
  //     const timer = setTimeout(() => {
  //       setShowError(false);
  //     }, 3000);
  //     return () => clearTimeout(timer); // Cleanup the timer
  //   }
  //   console.log("Updated assignedTechnician:", assignedTechnician);
  // }, [isTimeConflict, assignedTechnician]);

  useEffect(() => {
    fetchAvailableTechnicians(
      request.preferredStartDate,
      request.preferredEndDate
    );
  }, [request.preferredStartDate, request.preferredEndDate]);

  const handleAssignClick = (technician) => {
    setAssignedTechnician(technician.PersonnelID);
    document.querySelector("input[name='assignedPersonnel']").value =
      technician.Name;
  };

  const handleStartDateChange = (event) => {
    setScheduledStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setScheduledEndDate(event.target.value);
  };

  const [colDefs, setColDefs] = useState([
    { field: "PersonnelID", flex: 1 },
    { field: "Name", flex: 1 },
    { field: "Phone Number", flex: 1 },
    { field: "Gender", flex: 1 },
    { field: "Classification", flex: 1 },
    { field: "Department", flex: 1 },
    { field: "Availability", flex: 1 },
    {
      field: "Action",
      flex: 1,
      cellRenderer: (params) => (
        <button onClick={() => handleAssignClick(params.data)}>Assign</button>
      ),
    },
  ]);

  const fetchAvailableTechnicians = async (startDate, endDate) => {
    if (startDate && endDate) {
      try {
        const response = await axios.get(
          `${LOCAL_ENV}/technician/getAvailablePersonnel`,
          {
            params: {
              requestedStartTime: startDate,
              requestedEndTime: endDate,
            },
          }
        );
        const techniciansData = response.data.map((technician) => ({
          PersonnelID: technician.tech_id,
          Name: technician.tech_name,
          "Phone Number": technician.tech_phone,
          Gender: technician.tech_gender,
          Classification: technician.tech_classification,
          Department: technician.tech_department,
          Availability: technician.isavailable,
        }));
        setAvailableTechnicians(techniciansData);
      } catch (error) {
        console.error("Error fetching available technicians:", error);
      }
    }
  };

  const filters = {
    all: "All",
    Available: "Available",
  };

  const handleTabClick = (status) => {
    setActiveTab(status);
  };

  const allTechnicians = technicians.map((technician) => ({
    PersonnelID: technician.tech_id,
    Name: technician.tech_name,
    "Phone Number": technician.tech_phone,
    Gender: technician.tech_gender,
    Classification: technician.tech_classification,
    Department: technician.tech_department,
    Availability: technician.isavailable,
  }));

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
            <div className={classes.exampleHeader}>
              <div className={classes.tabs}>
                {Object.entries(filters).map(([key, displayValue]) => (
                  <button
                    className={`${classes.tabButton} ${
                      activeTab === key ? classes.active : ""
                    }`}
                    onClick={() => handleTabClick(key)}
                    key={key}
                  >
                    {displayValue}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="ag-theme-quartz"
              style={{ height: "100%", width: "100%", marginTop: "1rem" }}
            >
              <AgGridReact
                rowData={
                  activeTab === "all" ? allTechnicians : availableTechnicians
                }
                columnDefs={colDefs}
                domLayout="autoHeight"
              />
            </div>
          </div>
          <div className={classes.personnelSection}>
            <h4>2. Start Date and Time</h4>
            <input
              type="datetime-local"
              name="scheduledStartDate"
              className={classes.scheduledDate}
              value={scheduledStartDate}
              onChange={handleStartDateChange}
              required
            />
          </div>
          <div className={classes.personnelSection}>
            <h4>3. End Date and Time</h4>
            <input
              type="datetime-local"
              name="scheduleEndDate"
              className={classes.scheduledDate}
              value={scheduledEndDate}
              onChange={handleEndDateChange}
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
                scheduledStartDate={scheduledStartDate}
                scheduledEndDate={scheduledEndDate}
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
