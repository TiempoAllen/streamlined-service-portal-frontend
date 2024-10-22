import React from "react";
import classes from "./AssignButtonRenderer.module.css"; // Optional styling
import { useNavigate } from "react-router-dom";

const AssignButtonRenderer = (props) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleScheduleClick = () => {
    navigate("schedule"); // Navigate to the 'schedule' path under 'technician'
  };

  return (
    <button className={classes.assignButton} onClick={handleScheduleClick}>
      Schedule
    </button>
  );
};

export default AssignButtonRenderer;
