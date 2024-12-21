import React, { useState, useRef, useEffect } from "react";
import classes from "./DropdownPortal.module.css";
import "./DropdownPortal.module.css";
import logoutIcon from "../../assets/logout.svg";
import myProfileIcon from "../../assets/MyProfile.svg";
import { json, redirect, useRouteLoaderData } from "react-router-dom";
import historyIcon from "../../assets/History.svg";
import profileImg from "../../assets/profile-image.svg"; // Default fallback image

import { NavLink, Form } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8080"; // Replace with your actual API URL

const DropdownPortal = ({  }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [profilePicture, setProfilePicture] = useState(profileImg); // Default to fallback image
  const dropdownRef = useRef(null);
  const profile = useRouteLoaderData("profile");

  const handleShowProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowProfile(false);
    }
  };

  useEffect(() => {
    if (profile?.user_id) {
      fetchProfilePicture();
    }
  }, [profile?.user_id]);

  const fetchProfilePicture = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/${profile.user_id}/profile-picture`, {
        responseType: "blob",
      });

      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfilePicture(imageUrl); // Set the fetched profile picture
      } else {
        console.warn("No profile picture available. Using fallback.");
        setProfilePicture(profileImg); // Use fallback
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      setProfilePicture(profileImg); // Use fallback
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={classes.dropdown} ref={dropdownRef}>
      <button onClick={handleShowProfile} className={classes.profileTrigger}>
        <img src={profilePicture} alt="profile" className={classes.profileImage} />
      </button>
      {showProfile && (
        <div className={classes.dropdownMenu}>
          <NavLink to="profile" className={classes.dropdownItem}>
            <button type="myprofile" className={classes.myProfileButton}>
              <img src={myProfileIcon} alt="myprofile"/>
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
