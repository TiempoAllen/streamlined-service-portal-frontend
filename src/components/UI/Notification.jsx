import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bellIcon from "../../assets/bell.svg";
import profileImg from "../../assets/profile.jpg";
import classes from "./Notification.module.css";
import axios from "axios";
import EvaluationFormDialog from "./EvaluationFormDialog.jsx"; // Import the evaluation form dialog
import { formatDateTime } from "../../util/auth";
import axios from "axios";
import { React, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import bellIcon from "../../assets/bell.svg";
import { formatDateTime } from "../../util/auth";
import classes from "./Notification.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const timeDifference = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMs = now - notificationTime;

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
};

const Notification = ({ user_id }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null); // Track the notification for evaluation
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    setShowNotification(!showNotification);
    setNotificationCount(0);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `https://streamlined-service-portal-backend-cswk.onrender.com/notifications/${user_id}`
      );
      const sortedNotifications = response.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(sortedNotifications);
      const unreadCount = sortedNotifications.filter((n) => !n.isRead).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleRowClick = (notification) => {
    if (notification.type === "EVALUATION") {
      setSelectedNotification(notification); // Open evaluation dialog
    } else if (notification.recipientRole === "User") {
      navigate(`/home/${user_id}/history`);
    }
  };

  const handleCloseDialog = () => {
    setSelectedNotification(null); // Close the dialog
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    fetchNotifications();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user_id]);

  return (
    <div className={classes.main} ref={dropdownRef}>
      <div className={classes.badgeContainer} onClick={handleNotificationClick}>
        <img src={bellIcon} alt="bell" className={classes.bellIcon} />
        {notificationCount > 0 && (
          <span className={classes.badge}>{notificationCount}</span>
        )}
      </div>
      {showNotification && (
        <div className={classes.notificationContainer}>
          <div className={classes.title}>
            <span className={classes.firstTitle}>Notification</span>
          </div>
          {notifications.length > 0 ? (
            <ul className={classes.notificationItems}>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={classes.notificationsRow}
                  onClick={() => handleRowClick(notification)}
                >
                  <div className={classes.parentRow}>
                    <p>{notification.message}</p>
                    <div className={classes.childRow}>
                      <span>{timeDifference(notification.timestamp)}</span>
                      <span>{formatDateTime(notification.timestamp)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notifications</p>
          )}
        </div>
      )}
      {selectedNotification && (
        <EvaluationFormDialog
          open={!!selectedNotification}
          onClose={handleCloseDialog}
          requestId={selectedNotification.requestId} // Pass the relevant request ID
        />
      )}
    </div>
  );
};

export default Notification;
