import React, { useState } from "react";
import classes from "./LoginHeader.module.css";
import cituLogo from "../../assets/citu-logo.png";
import homeIcon from "../../assets/home.svg";
import historyIcon from "../../assets/history-icon.svg";
import requestIcon from "../../assets/request.svg";
import { NavLink } from "react-router-dom";
import DropdownPortal from "./DropdownPortal";
import Notification from "./Notification";
import ChatNotification from "./ChatNotification";

const MainNavigation = ({ user = {} }) => {
  const [showNotification, setShowNotification] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);
  const isAdmin = user && user.isadmin;
  const user_id = user && user.user_id;

  return (
    <>
      <header className={classes.header}>
        <div className={classes.logo}>
          <img src={cituLogo} alt="citu-logo" />
          <p>Streamlined Service Portal</p>
        </div>
        <ul className={classes.list}>
          {!isAdmin ? (
            <>
              <li>
                <NavLink
                  to={`/home/${user_id}`}
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                  end
                >
                  <img
                    src={homeIcon}
                    alt="home-icon"
                    className={classes.icon}
                  />
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={`/home/${user_id}/request`}
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  <img
                    src={requestIcon}
                    alt="request-icon"
                    className={classes.icon}
                  />
                  Request
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={`/home/${user_id}/history`}
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  <img
                    src={historyIcon}
                    alt="request-icon"
                    className={classes.icon}
                  />
                  History
                </NavLink>
              </li>
            </>
          ) : (
            <></>
          )}
        </ul>
        <div className={classes.buttons}>
          <Notification user_id={user_id} />
          <ChatNotification />
          <DropdownPortal />
        </div>
      </header>
    </>
  );
};

export default MainNavigation;
