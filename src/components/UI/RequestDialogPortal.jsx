import React, { useEffect, useState } from "react";
import classes from "./RequestDetailsPortal.module.css";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import axios from "axios";
import MessagePortal from "./MessagePortal";
import TechnicianPortal from "./TechnicianPortal";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const formatDateTime = (datetime) => {
  if (!datetime) {
    return "No Date Provided";
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
  onAssignTechnician,
  onRequestDone,
}) => {
  const requestor = `${request.user_firstname} ${request.user_lastname}`;
  const [techAssigned, setTechAssigned] = useState(null);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchAttachment = async (filename) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/request/${filename}`, {
        method: "GET",
        headers: {
          Accept: "application/pdf, image/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      console.log("Content-Type returned by server:", contentType);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const fileExtension = filename.split(".").pop().toLowerCase();
      console.log("File Extension:", fileExtension);

      if (
        ["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension) ||
        contentType.startsWith("image/")
      ) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.src = e.target.result;
          const imgWindow = window.open("", "_blank");
          imgWindow.document.write(img.outerHTML);
        };
        reader.readAsDataURL(blob);
      } else if (
        contentType === "application/pdf" ||
        contentType === "application/x-pdf"
      ) {
        window.open(url, "_blank");
      } else {
        throw new Error("Unsupported file type.");
      }
    } catch (error) {
      console.error("Error fetching attachment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (user_id) => {
    try {
      const response = await axios.get(`${API_URL}/user/${user_id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const fetchRequestById = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/request/${id}`);
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
        `${API_URL}/request/removeTechnician?request_id=${request_id}`
      );
      const updatedRequest = await fetchRequestById(request_id);
      setTechAssigned(updatedRequest.technician); // Update technician info
      onRemoveTechnician(request_id);
    } catch (error) {
      console.error("Error removing technician:", error);
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
                <p className={classes.first}>Request Type</p>
                <p className={classes.second}>{request.request_technician}</p>
              </div>
              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Description</p>
                <p className={classes.second}>{request.description}</p>
              </div>

              <div className={classes.requestDetailsPortalInputs}>
                <p className={classes.first}>Attachment</p>
                {!request.attachment ? (
                  <p className={classes.second}>No Attachment</p>
                ) : (
                  <div className={classes.attachmentPreview}>
                    <h4 style={{ marginBottom: "1rem" }}>
                      {request.attachmentTitle}
                    </h4>
                    <button
                      onClick={() => fetchAttachment(request.attachment)}
                      style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        padding: "5px 15px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px",
                        transition: "background-color 0.3s",
                      }}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Preview Attachment"}
                    </button>
                  </div>
                )}
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
                  {request.datetime
                    ? formatDateTime(request.datetime)
                    : "No Date Provided"}
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
                <p className={classes.second}>{user?.department || "Null"}</p>
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
              {["Assigned", "In Progress", "Done"].includes(request.status) && (
                <div className={classes.requestDetailsPortalInputs}>
                  <p className={classes.first}>Scheduled Date and Time</p>
                  <p className={classes.second}>
                    {request.scheduledStartDate
                      ? formatDateTime(request.scheduledStartDate)
                      : "No Scheduled Date"}
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
                  <TechnicianPortal
                    technicians={technicians}
                    request={request}
                    isTechnicianAssigned={techAssigned !== null}
                    onAssignTechnicianToRequest={onAssignTechnician}
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
