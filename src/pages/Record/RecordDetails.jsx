import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import classes from "./Record.module.css";
import axios from "axios";

const RecordDetails = () => {
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
    <section className={classes.recordDetails}>
      <div className={classes.recordDetailsContainer}>
        <h1>Record Details</h1>
        <div className={classes.singleRow}>
          <div className={classes.inputs}>
            <label>Record ID</label>
            <input value={request.request_id} readOnly />
          </div>
          <div className={classes.inputs}>
            <label>Requested By</label>
            <input value={requestor} readOnly />
          </div>
        </div>
        <div className={classes.inputs}>
          <label>Title</label>
          <input value={request.title} readOnly />
        </div>
        <div className={classes.inputs}>
          <label>Description</label>
          <input value={request.description} readOnly />
        </div>
        <div className={classes.inputs}>
          <label>Location</label>
          <input value={request.request_location} readOnly />
        </div>
        <div className={classes.inputs}>
          <label>Start Date/Time</label>
          <input value={formatDateTime(request.startTime)} readOnly />
        </div>
        <div className={classes.inputs}>
          <label>End Date/Time</label>
          <input value={formatDateTime(request.endTime)} readOnly />
        </div>
        <div className={classes.inputs}>
          <label>Technician Requested</label>
          <input value={request.request_technician} readOnly />
        </div>
        <div className={classes.inputs}>
          <label>Technician Assigned</label>
          <input value={technician.tech_name} readOnly />
        </div>
        <div className={classes.button}>
          <button onClick={() => window.print()}>Print</button>
        </div>
      </div>
    </section>
  );
};

export default RecordDetails;
