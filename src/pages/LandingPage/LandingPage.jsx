import React from "react";
import homepageImage from "../../assets/homepage-image.png";
import classes from "./LandingPage.module.css";

const LandingPage = () => {
  return (
    <section className={classes.landingPage}>
      <div>
        <h1>Service Request Portal</h1>
        <p>
          Streamline campus maintenance with ease.
          Submit building, electrical, and general service requests effortlessly through our user-friendly online portal.
        </p>
      </div>
      <img src={homepageImage} alt="homepage" />
    </section>
  );
};

export default LandingPage;
