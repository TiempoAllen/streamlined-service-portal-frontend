import React, { useEffect, useState } from "react";
import profileImg from "../../assets/profile.jpg";
import classes from "./Profile.module.css";
import EditPasswordForm from "../../components/UI/EditPasswordForm";
import axios from "axios";

const Profile = () =>{
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem('userId');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { 
        const fetchUserProfile = async () => {
            try{
                const response = await axios.get(`http://localhost:8080/user/${userId}`);
                setProfile(response.data);
                setIsLoading(false);
            }catch(err){
                setError("Failed to load Profile");
                setIsLoading(false);
            }
        };
        fetchUserProfile();
    }, [userId]);

    if (isLoading){
        return <p>{error}</p>;
    }

    if (error){
        return <p>{error}</p>;
    }

    const censoredPassword = profile.password ? "*".repeat(profile.password.length) : "*******";

    const handleEditPassword = () =>{
        setShowForm(true);
    };

    const handleCloseEdit = () =>{
        setShowForm(false);
    }

    return(
        <section className={classes.main}>
            <div className={classes.profileCard}>
                <img src={profileImg} className={classes.profileImg}/>
                <span>{profile.firstname} {profile.lastname}</span>
                <span>{profile.employee_id}</span>
            </div>
        <div className={classes.columnSection}>
            <div className={classes.editPassword} onClick={handleEditPassword}>
                    Edit Password
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
        {showForm && <EditPasswordForm onClose={handleCloseEdit}/>}
        </section>
    );
};

export default Profile;