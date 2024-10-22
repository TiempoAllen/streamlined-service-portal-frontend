import { useParams } from "react-router-dom";
import classes from "./DetailsModal.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DetailsModal() {
  const { requestId } = useParams();
  const [request, setRequest] = useState({});
  const [technician, setTechnician] = useState({});

  const requestor = `${request.user_firstname} ${request.user_lastname}`;

  const getTechnicianById = async (technicianId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/technician/getTechnician/${technicianId}`
      );
      setTechnician(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getRequestById = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/request/${requestId}`
      );
      setRequest(response.data);
      if (response.data.technicianId) {
        getTechnicianById(response.data.technicianId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getRequestById();
  }, [requestId]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return ""; // Return empty if no value
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString(); // Get date in format MM/DD/YYYY
    const formattedTime = date.toLocaleTimeString(); // Get time in format HH:MM:SS AM/PM
    return `${formattedDate} ${formattedTime}`;
  };
  return (
    <section className={classes.detailsModal}>
      <div className={classes.container}>
        <header>
          <h3>Request Details</h3>
          <p>Information and status</p>
        </header>
        <div className={classes.main}>
          <div className={classes.left}>
            <div className={classes.contents}>
              <p className={classes.first}>Request ID</p>
              <p className={classes.second}>{request.request_id}</p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>Requested By</p>
              <p className={classes.second}>{requestor}</p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>Title</p>
              <p className={classes.second}>{request.title}</p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>Description</p>
              <p className={classes.second}>{request.description}</p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>Location</p>
              <p className={classes.second}>{request.request_location}</p>
            </div>

            <div className={classes.contents}>
              <p className={classes.first}>Status</p>
              <p className={classes.second}>{request.status}</p>
            </div>
          </div>
          <div className={classes.right}>
            <div className={classes.contents}>
              <p className={classes.first}>Date Requested</p>
              <p className={classes.second}>
                {formatDateTime(request.datetime)}
              </p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>Start Date/Time</p>
              <p className={classes.second}>
                {formatDateTime(request.startTime)}
              </p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>End Date/Time</p>
              <p className={classes.second}>
                {formatDateTime(request.endTime)}
              </p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>Technician Requested</p>
              <p className={classes.second}>{request.request_technician}</p>
            </div>
            <div className={classes.contents}>
              <p className={classes.first}>Technician Assigned</p>
              <p className={classes.second}>
                {request.status === "Denied" ? "NA" : technician.tech_name}
              </p>
            </div>
            {request.status === "Denied" && (
              <div className={classes.contents}>
                <p className={classes.first}>Reason for Denial</p>
                <p className={classes.second}>{request.denialReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
