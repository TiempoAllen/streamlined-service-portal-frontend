import React, { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { Table, Button } from "antd";
import "antd/dist/reset.css"; // Ant Design reset styles
import classes from "./RequestDialogPortal.module.css";
import MessagePortal from "./MessagePortal";

const TechnicianPortal = ({
  technicians,
  request,
  onAssignTechnicianToRequest,
  isTechnicianAssigned,
}) => {
  const [assignedTechnicians, setAssignedTechnicians] = useState([]);
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [assignedTechnicianIds, setAssignedTechnicianIds] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const handleAssignClick = (technician) => {
    const isAlreadyAssigned = assignedTechnicianIds.includes(
      technician.PersonnelID
    );

    if (isAlreadyAssigned) {
      alert(`Technician ${technician.Name} is already assigned.`);
      return;
    }

    setAssignedTechnicians((prev) => [...prev, technician]);
    setAssignedTechnicianIds((prev) => [...prev, technician.PersonnelID]);
  };

  const handleRemoveTechnician = (index) => {
    setAssignedTechnicians((prev) => prev.filter((_, i) => i !== index));
    setAssignedTechnicianIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartDateChange = (event) => {
    setScheduledStartDate(event.target.value);
  };

  const allTechnicians = technicians.map((technician) => ({
    PersonnelID: technician.tech_id,
    Name: technician.tech_name,
    PhoneNumber: technician.tech_phone,
    Gender: technician.tech_gender,
    Classification: technician.tech_classification,
    Availability: technician.isavailable,
  }));

  const columns = [
    {
      title: "Personnel ID",
      dataIndex: "PersonnelID",
      key: "PersonnelID",
    },
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
    },
    {
      title: "Phone Number",
      dataIndex: "PhoneNumber",
      key: "PhoneNumber",
    },
    {
      title: "Gender",
      dataIndex: "Gender",
      key: "Gender",
    },
    {
      title: "Classification",
      dataIndex: "Classification",
      key: "Classification",
    },
    {
      title: "Action",
      key: "Action",
      render: (_, technician) => {
        const assigned = assignedTechnicianIds.includes(technician.PersonnelID);
        return (
          <Button
            type="primary"
            onClick={() => handleAssignClick(technician)}
            disabled={assigned}
          >
            {assigned ? "Assigned" : "Assign"}
          </Button>
        );
      },
    },
  ];

  const isProceedEnabled =
    assignedTechnicians.length > 0 && scheduledStartDate.trim() !== "";

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={classes.DialogOverlay} />
      <Dialog.Content className={classes.TechnicianDialogContent}>
        <Dialog.Title className={classes.TechnicianDialogTitle}>
          Assign and Schedule
        </Dialog.Title>
        <div className={classes.personnelSection}>
          <h4>1. Assign a Personnel</h4>
          <div className={classes.personnelField}>
            {assignedTechnicians.map((technician, index) => (
              <div key={index} className={classes.personnel}>
                <p>{technician.Name}</p>
                <Cross2Icon
                  onClick={() => handleRemoveTechnician(index)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            ))}
          </div>
          <Table
            dataSource={allTechnicians}
            columns={columns}
            rowKey="PersonnelID"
            pagination={{ pageSize: 5 }}
            style={{ marginTop: "1rem" }}
          />
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
              <button
                className={classes.btnApprove}
                disabled={!isProceedEnabled}
              >
                Proceed
              </button>
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
  );
};

export default TechnicianPortal;
