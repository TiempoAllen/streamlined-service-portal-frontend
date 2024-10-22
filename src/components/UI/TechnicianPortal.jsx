import React, { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { Table } from "@radix-ui/themes";
import classes from "./RequestDialogPortal.module.css";

const TechnicianPortal = ({
  technicians, // Default to an empty array
  request,
  onAssignTechnicianToRequest,
  isTimeConflict,
  timeConflictError,
}) => {
  const [showError, setShowError] = useState(false);
  const availableTechnicians = technicians.filter(
    (technician) => technician.isavailable === true
  );

  useEffect(() => {
    if (isTimeConflict) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [isTimeConflict]);

  return (
    <>
      <Dialog.Portal>
        <Dialog.Overlay className={classes.DialogOverlay} />
        <Dialog.Content className={classes.TechnicianDialogContent}>
          <Dialog.Title className={classes.DialogTitle}>
            Available Technicians
          </Dialog.Title>
          <Table.Root variant="surface" size="3">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Full name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Phone Number</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Gender</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Classification</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Availability</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {availableTechnicians.map((technician, index) => (
                <Table.Row key={index}>
                  <Table.RowHeaderCell>
                    {technician.tech_name}
                  </Table.RowHeaderCell>
                  <Table.Cell>{technician.tech_phone}</Table.Cell>
                  <Table.Cell>{technician.tech_gender}</Table.Cell>
                  <Table.Cell>{technician.tech_classification}</Table.Cell>
                  <Table.Cell>
                    {technician.isavailable ? "Available" : "Not Available"}
                  </Table.Cell>
                  <Table.Cell>{technician.tech_status}</Table.Cell>
                  <Table.Cell>
                    <p
                      className={classes.assign}
                      onClick={() =>
                        onAssignTechnicianToRequest(
                          request.request_id,
                          technician.tech_id,
                          request.startTime,
                          request.endTime
                        )
                      }
                    >
                      Assign
                    </p>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

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
