import axios from "axios";
import React from "react";
import { json, useRouteLoaderData } from "react-router-dom";
import homepageImage from "../../assets/homepage-image.png";
import Dashboard from "../Dashboard/Dashboard";
import classes from "./HomePage.module.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


const HomePage = () => {
  const user = useRouteLoaderData("home");
  const isAdmin = user && user.isadmin;
  return (
    <section className={isAdmin ? classes.adminHome : classes.home}>
      <div>
      {!isAdmin && <h1>Welcome, {user.firstname}!</h1>}
        {isAdmin ? (
            <>
           <Dashboard />
            </>
          ) : (
            <>
      
              <p>Enjoy effortless campus maintenance with our streamlined service,
              offering swift and professional janitorial, plumbing, and electrical
              support via an intuitive online portal. </p>
            </>
          )}
      </div>
      {!isAdmin && (
        <img src={homepageImage} alt="homepage" />
      )}
    </section>
  );
};

export default HomePage;

export async function loader({ request, params }) {
  const user_id = params.user_id;
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(`${API_URL}/user/${user_id}`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });

    const user = response.data;
    console.log("User: ", user);
    if (!user) {
      throw json({ message: "User not found" }, { status: 500 });
    }

    return user;
  } catch (error) {
    throw new Error(`Error fetching user details: ${error.message}`);
  }
}
