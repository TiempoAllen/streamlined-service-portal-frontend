import { React, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import bellIcon from "../../assets/bell.svg";
import { formatDateTime } from "../../util/auth";
import profileImg from "../../assets/profile.jpg";
import classes from "./Notification.module.css";
import axios from "axios";

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
  const [notificationCount, setNotificationCount] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // Use useNavigate for navigation

  const handleNotificationClick = () => {
    setShowNotification(!showNotification);
    setNotificationCount(0);
  };

  const fetchNotifications = async () => {
    try {
      // Fetch the user's notifications from the backend using the user_id
      const response = await axios.get(
        `http://localhost:8080/notifications/${user_id}`
      );
      console.log(response.data);

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
    if (notification.recipientRole === "User") {
      navigate(`/home/${user_id}/history`); // Navigate to user history
    }
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
                  key={notification.id} // Add a key for each item
                  className={classes.notificationsRow}
                  onClick={() => handleRowClick(notification)} // Attach the click handler
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
    </div>
  );
};

export default Notification;
