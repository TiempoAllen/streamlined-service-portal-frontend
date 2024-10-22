import React, { useState, useRef, useEffect } from "react";
import classes from "./DropdownPortal.module.css";
import "./DropdownPortal.module.css";
import logoutIcon from "../../assets/logout.svg";
import myProfileIcon from "../../assets/MyProfile.svg";
import historyIcon from "../../assets/History.svg";
import profileImage from "../../assets/profile-image.svg";

import { NavLink, Form } from "react-router-dom";

const DropdownPortal = () => {
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  const handleShowProfile = () =>{
    setShowProfile(!showProfile);
  };

  const handleClickOutside = (event) => {
    if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
      setShowProfile(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
  };
},[]);

  return (
    <div className={classes.dropdown} ref={dropdownRef}>
      <button onClick={handleShowProfile} className={classes.profileTrigger}>
        <img src={profileImage} alt="profile" className={classes.profileImage}/>
      </button>
      {showProfile && (
        <div className={classes.dropdownMenu}>
          <NavLink to="profile" className={classes.dropdownItem}>
            <button type="myprofile" className={classes.myProfileButton}>
            <img src={myProfileIcon} alt="myprofile" />
            My Profile
            </button>
          </NavLink>
          {/* <NavLink to="history" className={classes.dropdownItem}>
            <button type="history" className={classes.historyButton}>
            <img src={historyIcon} alt="history" />
            History
            </button>
          </NavLink> */}
          <Form action="logout" method="post" className={classes.dropdownItem}>
            <button type="logout" className={classes.logoutButton}>
              <img src={logoutIcon} alt="logout" />
              Logout
            </button>
          </Form>
        </div>
      )}
    </div>
  );
};

export default DropdownPortal;
