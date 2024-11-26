import React, { useEffect, useState } from "react";
import classes from "./RequestDetailsPortal.module.css";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import axios from "axios";
import MessagePortal from "./MessagePortal";
import TechnicianPortal from "./TechnicianPortal";
import DeleteIcon from "@mui/icons-material/Delete";
import { LOCAL_ENV } from "../../util/auth";

const formatDateTime = (datetime) => {
  if (!datetime || isNaN(new Date(datetime).getTime())) {
    console.warn("Invalid datetime value:", datetime);
    return "Invalid Date";
  }
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
  onRequestStart,
  onRequestDone,
}) => {
  const requestor = `${request.user_firstname} ${request.user_lastname}`;
  const [techAssigned, setTechAssigned] = useState(null);
  const [isTimeConflict, setIsTimeConflict] = useState(false);
  const [timeConflictError, setTimeConflictError] = useState("");
  const [user, setUser] = useState({});

  const getUserById = async (user_id) => {
    try {
      const response = await axios.get(`${LOCAL_ENV}/user/${user_id}`);
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRequestById = async (id) => {
    try {
      const response = await axios.get(`${LOCAL_ENV}/request/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching request by ID:", error);
      return null;
    }
  };

  useEffect(
    () => {
      const fetchData = async () => {
        const updatedRequest = await fetchRequestById(request.request_id);
        if (updatedRequest) {
          setTechAssigned(updatedRequest.technicianId);
        }
      };
      fetchData();
      if (request.user_id) {
        getUserById(request.user_id); // Call the function to fetch user data by user_id
      }
    },
    [request.request_id],
    [request.user_id]
  );

  const removeTechnician = async (request_id) => {
    try {
      await axios.post(
        `${LOCAL_ENV}/request/removeTechnician?request_id=${request_id}`
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
    scheduledStartDate,
    scheduledEndDate,
    closeDialog
  ) => {
    try {
      const formattedScheduledStartDate = new Date(
        scheduledStartDate
      ).toISOString();
      const formattedScheduledEndDate = new Date(
        scheduledEndDate
      ).toISOString();

      await axios.post(
        `${LOCAL_ENV}/request/assignTechnician?request_id=${request_id}&tech_id=${tech_id}&startTime=${formattedScheduledStartDate}&endTime=${formattedScheduledEndDate}`
      );
      setTechAssigned(tech_id);

      const updatedRequest = await fetchRequestById(request_id);
      if (updatedRequest) {
        setTechAssigned(updatedRequest.technicianId);
      }
      alert("Success");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error("Error details:", error.response.data);
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
            <p>Request Details</p>
            <span>ID #{request.request_id}</span>
          </Dialog.Title>
          <Dialog.Description className={classes.DialogDescription}>
            Detailed Request Information
          </Dialog.Description>
          <div className={classes.requestDetailsPortalMain}>
            <div className={classes.requestDetailsPortalMainInfo}>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Title</p>
                <p className={classes.second}>{request.title}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Description</p>
                <p className={classes.second}>{request.description}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Attachment</p>
                <p className={classes.second}>
                  {!request.attachment ? "No Attachment" : request.attachment}
                </p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Request Type</p>
                <p className={classes.second}>{request.request_technician}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Location</p>
                <p className={classes.second}>{request.request_location}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Created Date and Time</p>
                <p className={classes.second}>
                  {formatDateTime(request.datetime)}
                </p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Urgency Level</p>
                <p
                  className={`${classes.second} ${
                    request.urgencyLevel === "Low"
                      ? classes.lowLevel
                      : request.urgencyLevel === "Medium"
                      ? classes.mediumLevel
                      : classes.highLevel
                  }`}
                >
                  {request.urgencyLevel}
                </p>
              </div>
            </div>
            <div className={classes.requestDetailsPortalReqInfo}>
              <p className={classes.requestDetailsPortalSecHeader}>
                Requester Information
              </p>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Name</p>
                <p className={classes.second}>{requestor}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Department</p>
                <p className={classes.second}>{user.department}</p>
              </div>
            </div>
            <div className={classes.requestDetailsPortalReqInfo}>
              <p className={classes.requestDetailsPortalSecHeader}>
                Status Information
              </p>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Current Status</p>
                <p className={classes.second}>{request.status}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Preferred Date and Time</p>
                <p className={classes.second}>
                  {formatDateTime(request.preferredStartDate)}
                </p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Preferred Date and Time</p>
                <p className={classes.second}>
                  {formatDateTime(request.preferredEndDate)}
                </p>
              </div>
              {["Assigned", "In Progress", "Done"].includes(request.status) && (
                <div className={classes.requestDetailsPortalInputs}>
                  <p className={classes.first}>Scheduled Date and Time</p>
                  <p className={classes.second}>
                    {formatDateTime(request.scheduledStartDate)}
                  </p>
                </div>
              )}
              {request.status === "Denied" && (
                <div className={classes.requestDetailsPortalInputs}>
                  <p className={classes.first}>Remarks/Comments</p>
                  <p className={classes.second}>{request.denialReason}</p>
                </div>
              )}
            </div>
            {/* Displays if a Personnel is assigned, if not assigned then empty. */}
            {["Assigned", "In Progress", "Done"].includes(request.status) && (
              <div className={classes.requestDetailsPortalReqInfo}>
                <p className={classes.requestDetailsPortalSecHeader}>
                  Personnel Information
                </p>
                <div className={classes.requestDetailsPortalInputs}>
                  <p className={classes.first}>Assigned Personnel</p>
                  <p className={classes.second}>Jake Doe</p>
                </div>
                <div className={classes.requestDetailsPortalInputs}>
                  <p className={classes.first}>Personnel Type</p>
                  <p className={classes.second}>Janitor</p>
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              justifyContent: "flex-end",
              gap: "1rem",
            }}
          >
            {request.status === "Pending" && (
              <>
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className={classes.btnApprove}>Approve</button>
                  </Dialog.Trigger>
                  <MessagePortal
                    messageType="approve"
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
            )}
            {request.status === "Approved" && (
              <>
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className={classes.btnApprove}>
                      Assign Personnel
                    </button>
                  </Dialog.Trigger>
                  {/* <MessagePortal
                    messageType="assign"
                    request_id={request.request_id}
                  /> */}
                  <TechnicianPortal
                    technicians={technicians}
                    request={request}
                    isTechnicianAssigned={techAssigned !== null}
                    onAssignTechnicianToRequest={
                      handleAssignTechnicianToRequest
                    }
                  />
                </Dialog.Root>
                <Dialog.Close asChild>
                  <button className={classes.btnBack}>Back</button>
                </Dialog.Close>
              </>
            )}
            {request.status === "Assigned" && (
              <>
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className={classes.btnApprove}>Start</button>
                  </Dialog.Trigger>
                  <MessagePortal
                    messageType="startRequest"
                    request_id={request.request_id}
                    onRequestStart={(request_id) => {
                      onRequestStart(request_id);
                    }}
                  />
                </Dialog.Root>
                <Dialog.Close asChild>
                  <button className={classes.btnBack}>Back</button>
                </Dialog.Close>
              </>
            )}
            {request.status === "In Progress" && (
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