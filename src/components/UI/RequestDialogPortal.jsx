import React, { useEffect, useState } from "react";
import classes from "./RequestDialogPortal.module.css";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import MessagePortal from "./MessagePortal";
import TechnicianPortal from "./TechnicianPortal";
import DeleteIcon from "@mui/icons-material/Delete";

const formatDateTime = (datetime) => {
  const date = new Date(datetime);
  const options = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const RequestDialogPortal = ({
  request,
  technicians,
  onApproveRequest,
  onDenyRequest,
  onRemoveTechnician,
  onRequestDone,
}) => {
  const requestor = `${request.user_firstname} ${request.user_lastname}`;
  const [techAssigned, setTechAssigned] = useState(null);
  const [isTimeConflict, setIsTimeConflict] = useState(false);
  const [timeConflictError, setTimeConflictError] = useState("");

  const fetchRequestById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/request/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching request by ID:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const updatedRequest = await fetchRequestById(request.request_id);
      if (updatedRequest) {
        setTechAssigned(updatedRequest.technicianId);
      }
      console.log("Tech Assigned", techAssigned);
    };

    fetchData();
    console.log("Technicians: ", technicians);
  }, [request.request_id]);

  const removeTechnician = async (request_id) => {
    try {
      await axios.post(
        `http://localhost:8080/request/removeTechnician?request_id=${request_id}`
      );
      const updatedRequest = await fetchRequestById(request_id);
      setTechAssigned(updatedRequest.technician); // Update technician info
      onRemoveTechnician(request_id);
    } catch (error) {
      console.error("Error removing technician:", error);
    }
  };

  const handleAssignTechnicianToRequest = async (
    request_id,
    tech_id,
    startTime,
    endTime,
    closeDialog
  ) => {
    try {
      const formattedStartTime = new Date(startTime).toISOString();
      const formattedEndTime = new Date(endTime).toISOString();

      await axios.post(
        `http://localhost:8080/request/assignTechnician?request_id=${request_id}&tech_id=${tech_id}&startTime=${formattedStartTime}&endTime=${formattedEndTime}`
      );
      setTechAssigned(tech_id);

      const updatedRequest = await fetchRequestById(request_id);
      if (updatedRequest) {
        setTechAssigned(updatedRequest.technicianId);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setTimeConflictError(error.response.data.message);
        setIsTimeConflict(true);
      } else {
        console.error("Failed to assign technician:", error);
      }
    }
  };

  return (
    <>
      <Dialog.Portal>
        <Dialog.Overlay className={classes.DialogOverlay} />
        <Dialog.Content className={classes.DialogContent}>
          <Dialog.Title className={classes.DialogTitle}>
            Request Details
          </Dialog.Title>
          <div className={classes.requestDetails}>
            <div className={classes.firstHalf}>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Title
                </label>
                <input
                  className={classes.Input}
                  id="name"
                  defaultValue={request.title}
                  disabled
                />
              </fieldset>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Description
                </label>
                <textarea
                  className={classes.Input}
                  id="name"
                  value={request.description}
                  disabled
                />
              </fieldset>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Start Date and Time
                </label>
                <input
                  className={classes.Input}
                  id="name"
                  defaultValue={formatDateTime(request.startTime)}
                  disabled
                />
              </fieldset>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  End Date and Time
                </label>
                <input
                  className={classes.Input}
                  id="name"
                  defaultValue={formatDateTime(request.endTime)}
                  disabled
                />
              </fieldset>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Attachment
                </label>
                <p className={classes.attachment}>
                  <AttachFileIcon />
                  {request.attachment ? request.attachment : "No Attachment"}
                </p>
              </fieldset>
            </div>

            <div className={classes.secondHalf}>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Requestor
                </label>
                <input
                  className={classes.Input}
                  id="name"
                  defaultValue={requestor}
                  disabled
                />
              </fieldset>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Technician Requested
                </label>
                <input
                  className={classes.Input}
                  id="name"
                  defaultValue={request.request_technician} // Update this if necessary
                  disabled
                />
              </fieldset>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Technician Assigned
                </label>
                <div className={classes.techAssignedInput}>
                  {techAssigned ? (
                    <>
                      {technicians && technicians.length > 0 ? (
                        <>
                          <input
                            className={classes.Input}
                            id="techAssigned"
                            value={
                              technicians.find(
                                (tech) => tech.tech_id === techAssigned
                              )?.tech_name || "Unknown Technician"
                            }
                            disabled
                          />
                          <span
                            onClick={() => removeTechnician(request.request_id)}
                          >
                            <DeleteIcon
                              sx={{
                                padding: "0.50rem",
                                border: "solid 1px #631c21",
                                color: "#ffffff",
                                backgroundColor: "#631c21",
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </>
                      ) : (
                        <input
                          className={classes.Input}
                          id="techAssigned"
                          value="Technician Not Found"
                          disabled
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <Dialog.Root>
                        <Dialog.Trigger asChild>
                          <AddIcon
                            sx={{
                              padding: "0.50rem",
                              border: "solid 1px #631c21",
                              color: "#ffffff",
                              backgroundColor: "#631c21",
                              cursor: "pointer",
                            }}
                          />
                        </Dialog.Trigger>
                        <TechnicianPortal
                          isTimeConflict={isTimeConflict}
                          timeConflictError={timeConflictError}
                          technicians={technicians}
                          request={request}
                          onAssignTechnicianToRequest={(
                            request_id,
                            tech_id,
                            startTime,
                            endTime
                          ) => {
                            handleAssignTechnicianToRequest(
                              request_id,
                              tech_id,
                              startTime,
                              endTime,
                              () => {
                                document
                                  .querySelector('button[aria-label="Close"]')
                                  .click();
                              }
                            );
                          }}
                        />
                      </Dialog.Root>
                      <input
                        className={classes.Input}
                        id="techAssigned"
                        value="None"
                        disabled
                      />
                    </>
                  )}
                </div>
              </fieldset>
              <fieldset className={classes.Fieldset}>
                <label className={classes.Label} htmlFor="name">
                  Date and Time Requested
                </label>
                <input
                  className={classes.Input}
                  id="name"
                  defaultValue={formatDateTime(request.datetime)}
                  disabled
                />
              </fieldset>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              justifyContent: "flex-end",
              gap: "1rem",
            }}
          >
            {request.status === "Pending" ? (
              <>
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className={classes.btnApprove}>Approve</button>
                  </Dialog.Trigger>
                  <MessagePortal
                    messageType="approve"
                    isTechnicianAssigned={techAssigned !== null}
                    request_id={request.request_id}
                    onApproveRequest={onApproveRequest}
                  />
                </Dialog.Root>
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className={classes.btnDeny}>Deny</button>
                  </Dialog.Trigger>
                  <MessagePortal
                    messageType="deny"
                    request_id={request.request_id}
                    onDenyRequest={onDenyRequest}
                  />
                </Dialog.Root>
                <Dialog.Close asChild>
                  <button className={classes.btnBack}>Back</button>
                </Dialog.Close>
              </>
            ) : (
              <>
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className={classes.btnApprove}>Mark as Done</button>
                  </Dialog.Trigger>
                  <MessagePortal
                    messageType="markAsDone"
                    request_id={request.request_id}
                    onRequestDone={(request_id) => {
                      onRequestDone(request_id);
                    }}
                  />
                </Dialog.Root>
                <Dialog.Close asChild>
                  <button className={classes.btnBack}>Back</button>
                </Dialog.Close>
              </>
            )}
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

export default RequestDialogPortal;
