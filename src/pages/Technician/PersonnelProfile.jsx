import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Card, Statistic, List, Tooltip } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import classes from "../../components/UI/RequestDialogPortal.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";


const PersonnelProfile = ({ tech_id, requests }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [feedbackHighlights, setFeedbackHighlights] = useState({
    positive: [],
    negative: [],
  });

  const [schedules, setSchedule] = useState([]);

  const getScheduleByPersonnel = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/technician/${tech_id}/schedule`
      );
      setSchedule(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getScheduleByPersonnel();
  }, [schedules]);


  const [personnelDetails, setPersonnelDetails] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    technicianId: null, // Added technicianId to store the fetched technicianId
  });

  useEffect(() => {
    // Ensure that requests array has items and fetch technicianId based on the request_id
    console.log('useEffect called, requests:', requests);
    if (requests.length > 0 && requests[0].request_id) {
      fetchTechnicianId(requests[0].request_id); // Fetch technicianId using the request_id
    }
  }, [requests]);

  const fetchTechnicianId = async (request_id) => {
    try {
      const response = await axios.get(`${API_URL}/request/technician/${request_id}`);
      console.log('Technician ID Response:', response.data);  // Log the response
      const technicianId = response.data;
      setPersonnelDetails((prevState) => ({
        ...prevState,
        technicianId,
      }));
      
      console.log(`Fetching technician with ID: ${technicianId}`);
      fetchPersonnelDetails(technicianId);
      fetchAverageRating(technicianId);
      fetchUserFeedbackHighlights(technicianId);
    } catch (error) {
      console.error("Error fetching technician ID:", error);
    }
  };
  

  const fetchPersonnelDetails = async (technicianId) => {
    if (!technicianId) return;

    try {
      const response = await axios.get(
        `${API_URL}/technician/getTechnician/${technicianId}` // Assuming there's an endpoint for fetching technician details by ID
      );
      setPersonnelDetails((prevState) => ({
        ...prevState,
        name: response.data.tech_name,
        gender: response.data.tech_gender,
        phone: response.data.tech_phone,
        classifcation: response.data.tech_classification,
      }));
    } catch (error) {
      console.error("Error fetching personnel details:", error);
    }
  };

  const fetchAverageRating = async (technicianId) => {
    try {
      const response = await axios.get(
        `${API_URL}/request/average/${technicianId}`
      );
      setAverageRating(response.data); // Set average rating
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  };

  const fetchUserFeedbackHighlights = async (technicianId) => {
    try {
      const response = await axios.get(
        `${API_URL}/request/highlights/${technicianId}`
      );
      setFeedbackHighlights(response.data); // Set feedback highlights
    } catch (error) {
      console.error("Error fetching feedback highlights:", error);
    }
  };

  const events = requests.map((request) => ({
    title: request.title,
    start: request.scheduledDate,
    end: request.scheduledDate,
  }));

  return (
    <Dialog.Portal>
  <Dialog.Overlay className={classes.DialogOverlay} />
  <Dialog.Content className={classes.TechnicianDialogContent}>
    {/* Dialog Title */}
    <Dialog.Title className={classes.DialogTitle}>
      <p>Profile and Schedule</p>
    </Dialog.Title>
    <Dialog.Description className={classes.DialogDescription}>
      Detailed Personnel Information
    </Dialog.Description>

    {/* Container for Personnel Details and Calendar */}
    <Row gutter={16}>
      {/* Personnel Details, Average Rating, and Feedback in a Column */}
      <Col span={8}>
        <Card title="Personal Information">
          <p><strong>Name:</strong> {personnelDetails.name}</p>
          <p><strong>Gender:</strong> {personnelDetails.gender}</p>
          <p><strong>Phone Number:</strong> {personnelDetails.phone}</p>
          <p><strong>Classification:</strong> {personnelDetails.classifcation}</p>
        </Card>

        <Card title="Average Rating">
          <Statistic
            title="Rating"
            value={averageRating != null && averageRating > 0 ? averageRating : null}
            precision={Number.isInteger(averageRating) ? 0 : 1} // Remove decimal for whole numbers
            valueStyle={{ color: "#3f8600" }}
            suffix={averageRating != null && averageRating > 0 ? "/ 5" : ""}
          />
          {averageRating === 0 || averageRating == null ? <p>No ratings yet</p> : null}
        </Card>

        <Card title="Feedback Highlights">
          <List
            size="small"
            bordered
            dataSource={[...feedbackHighlights.positive, ...feedbackHighlights.negative]}
            renderItem={(feedback) => (
              <List.Item>
                <Tooltip title={feedback}>
                  <p>
                    {feedbackHighlights.positive.includes(feedback) ? "👍" : "👎"} {feedback}
                  </p>
                </Tooltip>
              </List.Item>
            )}
            style={{ maxHeight: 200, overflowY: 'auto' }} // Scrollable feedback section
          />
        </Card>
      </Col>

      {/* Calendar on the Right */}
      <Col span={16}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={events}
        />
      </Col>
    </Row>

    {/* Close Button */}
    <Dialog.Close asChild>
      <button className={classes.IconButton} aria-label="Close">
        <Cross2Icon />
      </button>
    </Dialog.Close>
  </Dialog.Content>
</Dialog.Portal>
  );
};

export default PersonnelProfile;
