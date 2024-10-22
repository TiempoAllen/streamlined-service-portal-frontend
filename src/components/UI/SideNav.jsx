
import { NavLink } from "react-router-dom";
import React, { useState } from "react";
import classes from "./SideNav.module.css";
import homeIcon from "../../assets/dashboard.svg";
import recordIcon5 from "../../assets/record5.svg";
import approvalIcon3 from "../../assets/approval3.svg";
import superUser2 from "../../assets/superuser2.svg";
import chatIcon from "../../assets/chat.svg";
import hashtagIcon from "../../assets/hashtag.svg";
import technicianIcon from "../../assets/technician-icon.svg";

const SideNav = ({ user_id, isSuperUser }) => {
  const [sideBar, setSideBar] = useState(false);

  const toggleSideBar = () =>{
    setSideBar(!sideBar);
  };


  return (
    <nav className={classes.sideNav}>

      <ul className={classes.list}>
        <li>
          <div className={classes.link}>
            <NavLink
              to={`/home/${user_id}`}
              end
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              <img src={homeIcon} alt="home-icon" className={classes.icon} />
              Home
            </NavLink>
          </div>
        </li>
        <li>
          <div className={classes.link}>
            <NavLink
              to={`/home/${user_id}/approval`}
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              <img src={approvalIcon3} alt="approval-icon" className={classes.icon} />
              Approval
            </NavLink>
          </div>
        </li>
        <li>
          <div className={classes.link}>
            <NavLink
              to={`/home/${user_id}/record`}
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              <img src={recordIcon5} alt="records-icon" className={classes.icon} />
              Record
            </NavLink>
          </div>
        </li>
        <li>
          <div className={classes.link}>
            <NavLink
              to={`/home/${user_id}/technician`}
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              <img
                src={technicianIcon}
                alt="technician-icon"
                className={classes.icon}
              />
              Technician
            </NavLink>
          </div>
        </li>
        {isSuperUser && (
          <li>
            <div className={classes.link}>
              <NavLink
                to={`/home/${user_id}/superuser`}
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                <img src={superUser2} alt="superuser-icon" className={classes.icon} />
                SuperUser
              </NavLink>
            </div>
          </li>
        )}
        <li>
          <div className={classes.link}>
          <NavLink
            to={`/home/${user_id}/chat`}
            className={({ isActive }) =>
              isActive ? classes.active : undefined
            }
          >
          <img src={chatIcon} alt="records-icon" className={classes.icon} />
            Chat
          </NavLink>
          </div>
        </li>
        {/* <li>
          <div className={classes.link}>
          <NavLink
            to={`/home/${user_id}/superuser`}
            className={({ isActive }) =>
              isActive ? classes.active : undefined
            }
          >
          <img src={hashtagIcon} alt="records-icon" className={classes.icon} />
            Superuser
          </NavLink>
          </div>
        </li> */}
      </ul>
    </nav>
  );
};

export default SideNav;
