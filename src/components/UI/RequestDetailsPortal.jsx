import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import classes from "./RequestDetailsPortal.module.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import axios from "axios";

const RequestDetailsPortal = ({ request_id }) => {
  const [request, setRequest] = useState({});
  const [user, setUser] = useState({});

  const requestor = `${request.user_firstname} ${request.user_lastname}`;

  const getUserById = async (user_id) => {
    try {
      const response = await axios.get(`http://localhost:8080/user/${user_id}`);
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getRequestById = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/request/${request_id}`
      );
      setRequest(response.data);
      if (response.data.user_id) {
        getUserById(response.data.user_id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getRequestById();
  }, [request_id]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return ""; // Return empty if no value
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString(); // Get date in format MM/DD/YYYY
    const formattedTime = date.toLocaleTimeString(); // Get time in format HH:MM:SS AM/PM
    return `${formattedDate} ${formattedTime}`;
  };

  return (
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
                {formatDateTime(request.preferredDate)}
              </p>
            </div>
            {request.status === "Denied" && (
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Remarks/Comments</p>
                <p className={classes.second}>{request.denialReason}</p>
              </div>
            )}
          </div>
          {/* Displays if a Personnel is assigned, if not assigned then empty. */}
          {request.status === "Assigned" && (
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
          style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
        >
          <Dialog.Close asChild>
            <button className={classes.btnClose}>Back</button>
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

export default RequestDetailsPortal;
