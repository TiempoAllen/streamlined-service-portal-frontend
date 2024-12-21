import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import classes from "./RequestDetailsPortal.module.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MessagePortal from "./MessagePortal";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const RequestDetailsPortal = ({ request_id, onCancelRequest }) => {
  const [request, setRequest] = useState({});
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const requestor = `${request.user_firstname} ${request.user_lastname}`;

  const handleResubmit = () => {
    navigate(`resubmit/${request_id}`, { state: { request } });
  };

  const getUserById = async (user_id) => {
    try {
      const response = await axios.get(`${API_URL}/user/${user_id}`);
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getRequestById = async () => {
    try {
      const response = await axios.get(`${API_URL}/request/${request_id}`);
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
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    return `${formattedDate} ${formattedTime}`;
  };

  const renderAttachment = () => {
    if (!request.attachment) {
      return "No Attachment";
    }

    const attachmentUrl = `data:application/octet-stream;base64,${request.attachment}`;
    const isImage = request.attachment.startsWith("iVBOR"); // Checks if the Base64 string is a PNG (example: starts with "iVBOR" for PNG).

    return isImage ? (
      <img
        src={attachmentUrl}
        alt="Attachment"
        style={{ maxWidth: "100%", maxHeight: "6rem" }}
      />
    ) : (
      <a href={attachmentUrl} download={`attachment_${request_id}`}>
        Download Attachment
      </a>
    );
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
                <p className={classes.first}>Request Type</p>
                <p className={classes.second}>{request.request_technician}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Description</p>
                <p className={classes.second}>{request.description}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Attachment</p>
                <p className={classes.second}>{renderAttachment()}</p>
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
              {request.status === "Denied" && (
                <div className={classes.requestDetailsPortalInputs}>
                  <p className={classes.first}>Remarks/Comments</p>
                  <p className={classes.second}>{request.denialReason}</p>
                </div>
              )}
            </div>
            {["In Progress", "Done"].includes(request.status) && (
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
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button className={classes.btnDeny}>Cancel Request</button>
                </Dialog.Trigger>
                <MessagePortal
                  messageType="cancel"
                  onCancelRequest={onCancelRequest}
                  request_id={request_id}
                />
              </Dialog.Root>
            )}
            {request.status === "Denied" && (
              <Dialog.Close asChild>
                <button className={classes.btnDeny} onClick={handleResubmit}>
                  Resubmit
                </button>
              </Dialog.Close>
            )}
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

export default RequestDetailsPortal;
