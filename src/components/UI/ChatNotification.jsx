import { Client } from "@stomp/stompjs";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, json, useRouteLoaderData } from "react-router-dom";
import SockJS from "sockjs-client";
import inboxImage from "../../assets/chat.svg";
import profileImg from "../../assets/profile.svg";
import classes from "./ChatNotification.module.css";

const ChatNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);
  const user = useRouteLoaderData("home");
  const [stompClient, setStompClient] = useState(null);
  const [users, setUsers] = useState([]);
  const [newMessages, setNewMessages] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/user/all');
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    fetchUsers();
  }, []);

  const getSenderDetails = (userId) => {
    const sender = users.find(user => String(user.user_id) === String(userId));
  
    if (sender) {
      console.log("Found Sender:", sender); // Log the entire sender object
      console.log("Profile Pic:", sender.profilePicture); // Use correct property name
      return {
        name: `${sender.firstname} ${sender.lastname}`,
        profilePic: sender.profilePicture, // Use correct property name
      };
    } else {
      console.log("No sender found for userId:", userId); // Log if no sender is found
      console.log("Default Profile Picture:", profileImg); // Log the default profile picture
      return { 
        name: userId, 
        profilePic: profileImg 
      };
    }
  };
  
  


  const getSenderName = (userId) => {
    const sender = users.find(user => String(user.user_id) === String(userId));
    return sender ? `${sender.firstname} ${sender.lastname}` : userId;
  };

  const handleNotificationClick = async () => {
    setShowNotification(!showNotification);
    if (!showNotification) {
      await fetchNotifications();
      if (notifications.length > 0) {
        await markMessagesAsRead(notifications.map((msg) => msg.messageId));
        setNotificationCount(0);
      }
    } else {
      setNotifications([]); // Clear notifications when closing
    }
  };
  
  const handleNotificationRowClick = async (sender, messageId) => {
    // Mark the message as read for the specific sender
    await markMessagesAsRead([messageId]);

    // Update notifications state and set the status to READ for the message
    setNotifications((prevNotifications) =>
      prevNotifications.map((msg) =>
        msg.messageId === messageId ? { ...msg, status: 'READ' } : msg
      )
    );

    // Update notification count (decrease by 1 only if it was not already read)
    setNotificationCount((prevCount) => 
      notifications.some((msg) => msg.messageId === messageId && msg.status !== 'READ') 
        ? prevCount - 1 
        : prevCount
    );

    // Redirect to the chat with the sender
    window.location.href = `/home/${user.user_id}/chat`;
};


  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowNotification(false);
      setNotifications([]); // Clear notifications on close
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const connectToWebSocket = () => {
    const socket = new SockJS("http://localhost:8080/chat");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        client.subscribe(`/user/${user.user_id}/queue/messages`, (message) => {
          const newMessage = JSON.parse(message.body);
          setNotifications((prev) => {
            const updatedNotifications = [newMessage, ...prev];
            return updatedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          });
          setNotificationCount((prev) => prev + 1);
          setNewMessages(true); // Set new messages to true
          setShowNotification(true);
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        reconnect();
      },
    });
  
    client.activate();
    setStompClient(client);
  };
  
  // Show notifications when new messages are received
  useEffect(() => {
    if (newMessages) {
      setShowNotification(true);
      // Optional: Automatically hide notifications after a few seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNewMessages(false); // Reset new messages flag
      }, 1000); // Adjust time as needed
  
      return () => clearTimeout(timer);
    }
  }, [newMessages]);

  const reconnect = () => {
    setTimeout(() => {
      console.log("Attempting to reconnect...");
      connectToWebSocket();
    }, 1000); 
  };

  useEffect(() => {
    connectToWebSocket();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [user.user_id]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/messages/unread-recent/${user.user_id}`);
      const sortedNotifications = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Update notification count only with unread messages (status !== 'READ')
      const unreadCount = sortedNotifications.filter((msg) => msg.status !== 'READ').length;
      setNotificationCount(unreadCount);
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  

  const markMessagesAsRead = async (messageId) => {
    try {
      await axios.put("http://localhost:8080/messages/markAsRead", messageId, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const calculateDuration = (timestamp) => {
    if (!timestamp) {
        console.warn("No timestamp provided");
        return "No duration available";
    }


    const [datePart, timePart] = timestamp.split(' - ');


    if (!datePart || !timePart) {
        console.error("Invalid timestamp format:", timestamp);
        return "Invalid timestamp";
    }

    const [year, month, day] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);


    if ([year, month, day, hour, minute].some(part => isNaN(part))) {
        console.error("Invalid date or time component:", { year, month, day, hour, minute });
        return "Invalid date";
    }


    const messageDate = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    const diffMs = now - messageDate;


    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);


    if (diffDays > 0) {
        return `${diffDays}d${diffDays > 1 ? '' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours}h${diffHours > 1 ? '' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes}m${diffMinutes > 1 ? '' : ''} ago`;
    } else {
        return "Just now";
    }
};

  const getUniqueNotifications = () => {
    const map = new Map();
    notifications.forEach(notification => {
      if (!map.has(notification.sender) || 
        new Date(notification.timestamp) > new Date(map.get(notification.sender).timestamp)) {
        map.set(notification.sender, notification);
      }
    });
    return Array.from(map.values());
  };
  
  return (
    <div className={classes.main} ref={dropdownRef}>
      <div className={classes.badgeContainer} onClick={handleNotificationClick}>
        <img src={inboxImage} alt="inbox" className={classes.inboxImage} />
        {notificationCount > 0 && (
          <span className={classes.badge}>{notificationCount}</span>
        )}
      </div>
      {showNotification && (
        <div className={classes.notificationContainer}>
          <div className={classes.title}>
            <span className={classes.firstTitle}>Chat</span>
          </div>
          <div className={classes.notificationItems}>
            {getUniqueNotifications().length > 0 ? (
              getUniqueNotifications().map((notification) => (
                <div
                  className={classes.notificationsRow}
                  key={notification.messageId}
                  onClick={() => handleNotificationRowClick(notification.sender, notification.messageId)}
                >
                  <img src={profileImg} className={classes.profileImg} alt="Profile" />
                  <div className={classes.parentRow}>
                    <div className={classes.childRow}>
                    <p>{getSenderDetails(notification.sender).name}</p>
                    {notification.status !== 'READ' && (
                      <span className={classes.unreadIndicator}></span>
                    )}
                    </div>
                    <div className={classes.childRow}>
                      <span className={classes.message}> {notification.attachment ? 'sent an attachment' : notification.content}</span>
                      <span className={classes.chatDuration}>
                        {calculateDuration(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={classes.noNotifications}>No new messages</div>
            )}
          </div>
          <div className={classes.allMessages}>
            <div className={classes.seeAll}>
              <NavLink
                to={`/home/${user.user_id}/chat`}
                className={({ isActive }) => (isActive ? classes.active : undefined)}
                onClick={handleNotificationClick}
              >
                See All Messages
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatNotification;

export async function loader({ params }) {
    const user_id = params.user_id; // Fetch the user_id from the URL params
    const token = localStorage.getItem("token");
  
    if (!token) {
      throw new Error("No token found");
    }
  
    try {
      const response = await axios.get(`http://localhost:8080/user/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const user = response.data;
      if (!user) {
        throw json({ message: "User not found" }, { status: 500 });
      }
  
      return user; // Return the user data to the loader
    } catch (error) {
      throw json({ message: error.message }, { status: 500 });
    }
}