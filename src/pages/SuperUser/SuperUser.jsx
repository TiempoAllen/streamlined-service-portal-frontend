import React, { useState, useEffect } from "react";
import axios from "axios";
import UsersTable from "../../components/UI/UsersTable";
import RequestsTable from "../../components/UI/RequestsTable";
import TechniciansTable from "../../components/UI/TechniciansTable"; // Import the TechniciansTable
import classes from "./SuperUser.module.css";
import { Link } from "react-router-dom";
import { useRouteLoaderData } from "react-router-dom";

const SuperUser = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
   const [isViewingUsers, setIsViewingUsers] = useState(true);
  const [isViewingRequests, setIsViewingRequests] = useState(false);
  const [isViewingTechnicians, setIsViewingTechnicians] = useState(false);

  

  const user = useRouteLoaderData("home");
  const user_id = user && user.user_id;
  console.log("User ID:", user_id);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:8080/request/all");
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);



 

  return (
    <div className={classes.supermain}>
      <div className={classes.header}>
        <div className={classes.navContainer}>
          <nav className={classes.nav}>
            <Link
              to="#"
              className={`${classes.navLink} ${
                isViewingUsers ? classes.active : ""
              }`}
              onClick={() => {
                setIsViewingUsers(true);
                setIsViewingRequests(false);
                setIsViewingTechnicians(false);
              }}
            >
              Users
            </Link>
            <Link
              to="#"
              className={`${classes.navLink} ${
                isViewingRequests ? classes.active : ""
              }`}
              onClick={() => {
                setIsViewingUsers(false);
                setIsViewingRequests(true);
                setIsViewingTechnicians(false);
              }}
            >
              Requests
            </Link>
            <Link
              to="#"
              className={`${classes.navLink} ${
                isViewingTechnicians ? classes.active : ""
              }`}
              onClick={() => {
                setIsViewingUsers(false);
                setIsViewingRequests(false);
                setIsViewingTechnicians(true);
              }}
            >
              Technicians
            </Link>
          </nav>
        </div>
      </div>
      <div className={classes.tableContainer}>
        {isViewingUsers && <UsersTable users={users} />}
        {isViewingRequests && (
          <>
            <RequestsTable
              requests={requests}
              user_id={user_id}
           
            />
           
          </>
        )}
        {isViewingTechnicians && (
          <TechniciansTable technicians={technicians}  />
        )}
      </div>
    </div>
  );
};

export default SuperUser;
