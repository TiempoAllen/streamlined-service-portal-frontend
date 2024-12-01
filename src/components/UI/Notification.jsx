import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bellIcon from "../../assets/bell.svg";
import classes from "./Notification.module.css";
import axios from "axios";
import EvaluationFormDialog from "./EvaluationFormDialog.jsx"; // Import the evaluation form dialog
import { formatDateTime } from "../../util/auth";

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

const Notification = ({ user_id, userType }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    setShowNotification(!showNotification);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/${user_id}`);
      console.log("Fetched Notifications:", response.data);

      const mappedNotifications = response.data.map((n) => ({
        ...n,
        notificationId: n.notification_id, 
      }));

      
      const readStatusKey = userType === "admin" ? "readNotificationsAdmin" : "readNotificationsUser";
      console.log("Using LocalStorage key:", readStatusKey);

     
      const storedReadStatus = JSON.parse(localStorage.getItem(readStatusKey)) || [];
      console.log("Stored Read Status:", storedReadStatus);

     
      const notificationsWithReadStatus = mappedNotifications.map((n) => {
        return {
          ...n,
          isRead: storedReadStatus.includes(n.notificationId) || n.isRead,
        };
      });

      
      const sortedNotifications = notificationsWithReadStatus.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(sortedNotifications);

      const unreadCount = sortedNotifications.filter((n) => !n.isRead).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleRowClick = async (notification) => {
    if (notification.isRead) return;
  
    try {
   
      const response = await axios.put(
        `${API_URL}/notifications/mark-as-read/${notification.notificationId}`
      );
      console.log("Backend Response:", response.data);
  
      
      const updatedNotifications = notifications.map((n) =>
        n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
  
  
      const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
      setNotificationCount(unreadCount);
  
     
      const readStatusKey = userType === "admin" ? "readNotificationsAdmin" : "readNotificationsUser";
      let storedReadStatus = JSON.parse(localStorage.getItem(readStatusKey)) || [];
  
      
      if (!storedReadStatus.includes(notification.notificationId)) {
        storedReadStatus.push(notification.notificationId);
      }
  
      
      localStorage.setItem(readStatusKey, JSON.stringify(storedReadStatus));
      if (notification.notificationType === "Admin") {
        navigate(`/home/${user_id}/approval`);
      } else if (notification.recipientRole === "User") {
        
        navigate(`/home/${user_id}/history`); 
      }
      
  
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  

  const handleCloseDialog = () => {
    setSelectedNotification(null);
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
  }, [user_id, userType]); 

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
                  key={notification.notificationId}
                  className={`${classes.notificationsRow} ${
                    !notification.isRead ? classes.unread : ""
                  }`}
                  onClick={() => handleRowClick(notification)}
                >
                  <div className={classes.parentRow}>
                    <p
                      style={{
                        fontWeight: !notification.isRead ? "700" : "400",
                      }}
                    >
                      {notification.message}
                    </p>
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
          requestId={selectedNotification.request_id}
        />
      )}
    </div>
  );
};

export default Notification;
