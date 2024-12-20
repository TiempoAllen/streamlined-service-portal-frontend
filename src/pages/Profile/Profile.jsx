import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { json, redirect, useRouteLoaderData } from "react-router-dom";
import profileImg from "../../assets/profile.svg"; // Fallback image
import EditPasswordForm from "../../components/UI/EditPasswordForm";
import classes from "./Profile.module.css";
import { Snackbar, Alert} from "@mui/material";
import Edit from '@mui/icons-material/Edit';
import { getAuthToken } from "../../util/auth";



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';



const Profile = () => {
  const profile = useRouteLoaderData("profile");

  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(profileImg); // Default to the fallback image
  const fileInputRef = useRef(null); // Reference for the file input
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    console.log("Profile Data: ", profile);
    fetchProfilePicture();
  }, [profile]);

const fetchProfilePicture = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/${profile.user_id}/profile-picture`, {
      responseType: 'blob', 
    });

    if (response.data) {
   
      const imageUrl = URL.createObjectURL(response.data);
      setProfilePicture(imageUrl); 
    } else {
      console.warn("No profile picture available. Using fallback.");
      setProfilePicture(profileImg); 
    }
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    setProfilePicture(profileImg); 
  }
};

  
  

  // Check if profile data is not available
  if (!profile) {
    return <p>Loading profile...</p>;
  }

  const censoredPassword = "***********";

  const handleEditPassword = () => {
    setShowForm(true);
  };

  const handleCloseEdit = () => {
    setShowForm(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setSnackbarMessage("Invalid file type. Please select an image.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setSnackbarMessage("File size exceeds 2MB. Please select a smaller file.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setSelectedFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };
  

  const handleUpload = async () => {
    if (!selectedFile) {
      setSnackbarMessage("Please select an image first!");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const response = await axios.post(
        `${API_URL}/user/uploadProfilePicture/${profile.user_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data) {
        setSnackbarMessage(response.data); 
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
  
        
        fetchProfilePicture();
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setSnackbarMessage("Failed to upload profile picture.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Snackbar function for EditPasswordForm
  const handleSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <section className={classes.main}>
      <div className={classes.profileCard}>
        <div className={classes.profileImgWrapper}>
          <img
            src={profilePicture}
            className={classes.profileImg}
            alt="Profile"
            onClick={() => fileInputRef.current.click()} // Trigger file input on image click
          />
          <div className={classes.overlay} onClick={() => fileInputRef.current.click()}>
            <Edit className={classes.editIcon} /> {/* Edit icon */}
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }} // Hide the file input
          accept="image/*"
          onChange={handleFileChange}
        />
        <span>{profile.firstname} {profile.lastname}</span>
        <span>{profile.employee_id}</span>
      </div>
      <div className={classes.columnSection}>
        <div className={classes.buttonGroup}>
          <div className={classes.uploadPicture} onClick={handleUpload}>
                Upload Profile Picture
          </div>
          {/* <div className={classes.editPassword} onClick={handleEditPassword}>
            Edit Password
          </div> */}
        </div>
        <div className={classes.profileDetails}>
          <div className={classes.name}>
            <span className={classes.itemOne}>Name</span>
            <span className={classes.itemTwo}>:</span>
            <span className={classes.itemThree}>{profile.firstname} {profile.lastname}</span>
          </div>
          <div className={classes.username}>
            <span className={classes.itemOne}>Username</span>
            <span className={classes.itemTwo}>:</span>
            <span className={classes.itemThree}>{profile.username}</span>
          </div>
          <div className={classes.idNumber}>
            <span className={classes.itemOne}>ID Number</span>
            <span className={classes.itemTwo}>:</span>
            <span className={classes.itemThree}>{profile.employee_id}</span>
          </div>
          <div className={classes.password}>
            <span className={classes.itemOne}>Password</span>
            <span className={classes.itemTwo}>:</span>
            <span className={classes.itemThree}>{censoredPassword}</span>
          </div>
          <div className={classes.email}>
            <span className={classes.itemOne}>Email</span>
            <span className={classes.itemTwo}>:</span>
            <span className={classes.itemThree}>{profile.email}</span>
          </div>
          <div className={classes.department}>
            <span className={classes.itemOne}>Department</span>
            <span className={classes.itemTwo}>:</span>
            <span className={classes.itemThree}>{profile.department}</span>
          </div>
        </div>
      </div>
      {showForm && <EditPasswordForm onClose={handleCloseEdit} onSnackbar={handleSnackbar}/>}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </section>
  );
};

export default Profile;

export async function loader({ params }) {
  const user_id = params.user_id;
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/");
  }

  try {
    const response = await axios.get(`${API_URL}/user/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = response.data;

    if (!user) {
      return json({ message: "User not found" }, { status: 404 });
    }

    return user;
  } catch (error) {
    return json({ message: `Error fetching user: ${error.message}` }, { status: 500 });
  }
}
