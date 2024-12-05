import React, { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import classes from "./RequestDialogPortal.module.css";
import MessagePortal from "./MessagePortal";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const TechnicianPortal = ({
  technicians,
  request,
  onAssignTechnicianToRequest,
  isTechnicianAssigned,
}) => {
  const [assignedTechnicians, setAssignedTechnicians] = useState([]);
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [assignedTechnicianIds, setAssignedTechnicianIds] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  // useEffect(() => {
  //   fetchAvailableTechnicians(
  //     request.preferredStartDate,
  //     request.preferredEndDate
  //   );
  // }, [request.preferredStartDate, request.preferredEndDate]);

  const handleAssignClick = (technician) => {
    // Use a consistent property for comparison
    const isAlreadyAssigned = assignedTechnicians.find(
      (tech) => tech.PersonnelID === technician.PersonnelID
    );

    if (!isAlreadyAssigned) {
      setAssignedTechnicians((prevTechnicians) => [
        ...prevTechnicians,
        technician,
      ]);
      setAssignedTechnicianIds((prevIds) => [
        ...prevIds,
        technician.PersonnelID,
      ]);
    } else {
      console.log(`Technician ${technician.Name} is already assigned.`);
    }
  };

  const handleRemoveTechnician = (index) => {
    setAssignedTechnicians((prevTechnicians) =>
      prevTechnicians.filter((_, i) => i !== index)
    );
  };
  const handleStartDateChange = (event) => {
    setScheduledStartDate(event.target.value);
  };

  const [colDefs, setColDefs] = useState([
    { field: "PersonnelID", flex: 1 },
    { field: "Name", flex: 1 },
    { field: "Phone Number", flex: 1 },
    { field: "Gender", flex: 1 },
    { field: "Classification", flex: 1 },
    { field: "Department", flex: 1 },
    {
      field: "Action",
      flex: 1,
      cellRenderer: (params) => (
        <button onClick={() => handleAssignClick(params.data)}>Assign</button>
      ),
    },
  ]);

  // const fetchAvailableTechnicians = async (startDate, endDate) => {
  //   if (startDate && endDate) {
  //     try {
  //       const response = await axios.get(
  //         `${API_URL}/technician/getAvailablePersonnel`,
  //         {
  //           params: {
  //             requestedStartTime: startDate,
  //             requestedEndTime: endDate,
  //           },
  //         }
  //       );
  //       const techniciansData = response.data.map((technician) => ({
  //         PersonnelID: technician.tech_id,
  //         Name: technician.tech_name,
  //         "Phone Number": technician.tech_phone,
  //         Gender: technician.tech_gender,
  //         Classification: technician.tech_classification,
  //         Department: technician.tech_department,
  //       }));
  //       setAvailableTechnicians(techniciansData);
  //     } catch (error) {
  //       console.error("Error fetching available technicians:", error);
  //     }
  //   }
  // };

  const filters = {
    all: "All",
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
              {/* <input
                type="text"
                name="assignedPersonnel"
                className={classes.assignedPersonnel}
                readOnly
                required
              /> */}
              <div className={classes.personnelField}>
                {assignedTechnicians.map((technician, index) => (
                  <div key={index} className={classes.personnel}>
                    <p>{technician.Name}</p>
                    <Cross2Icon onClick={() => handleRemoveTechnician(index)} />
                  </div>
                ))}
              </div>
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
          {/* <div className={classes.personnelSection}>
            <h4>3. End Date and Time</h4>
            <input
              type="datetime-local"
              name="scheduleEndDate"
              className={classes.scheduledDate}
              value={scheduledEndDate}
              onChange={handleEndDateChange}
              required
            />
          </div> */}

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
                assignedTechnicians={assignedTechnicianIds}
                scheduledStartDate={scheduledStartDate}
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
