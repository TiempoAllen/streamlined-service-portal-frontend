import {React, useState, useRef, useEffect} from "react";
import classes from "./ChatNotification.module.css";
import closeIcon from "../../assets/close.svg";
import profileImg from "../../assets/profile.jpg";
import inboxImage from "../../assets/chat.svg";
import sendImage from "../../assets/send.svg";
import attachmentImage from "../../assets/attachment.svg";
import { NavLink, useRouteLoaderData } from "react-router-dom";
 
const ChatNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(1);
  const dropdownRef = useRef(null);

  const handleNotificationClick = () => {
    setShowNotification(!showNotification);
    setNotificationCount(0);
  };

  const handleClickOutside = (event) => {
    if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
      setShowNotification(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
  };
},[]);

const user = useRouteLoaderData("home");
const user_id = user && user.user_id;

    return(
        <div className={classes.main} ref={dropdownRef}>
            <div className={classes.badgeContainer} onClick={handleNotificationClick}>
            <img src={inboxImage} alt="inbox" className={classes.inboxImage}/>
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
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
            <div className={classes.notificationsRow}>
                <img src={profileImg} className={classes.profileImg} />
                <div className={classes.parentRow}>
                    <p>John Doe</p>
                    <div className={classes.childRow}>
                        <span className={classes.message}>Hey, heyhedasdasd</span>
                        <span className={classes.chatDuration}>5 mins ago</span>
                    </div>
                </div>
            </div>
        </div>
            <div className={classes.allMessages}>
                <div className={classes.seeAll}>
                    <NavLink to={`/home/${user_id}/chat`} className={({isActive})=> isActive ? classes.active : undefined} onClick={handleNotificationClick}>
                        <a>See All Messages</a>
                    </NavLink>
                </div>
            </div>
    </div>
            )}
        </div>
    );
};

export default ChatNotification;