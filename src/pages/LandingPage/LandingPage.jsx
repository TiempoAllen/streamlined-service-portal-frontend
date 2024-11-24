import React from "react";
import homepageImage from "../../assets/homepage-image.png";
import classes from "./LandingPage.module.css";

const LandingPage = () => {
  return (
    <section className={classes.landingPage}>
      <div>
        <h1>Streamlined Service Portal</h1>
        <p>
          Enjoy effortless campus maintenance with our streamlined service,
          offering swift and professional janitorial, plumbing, and electrical
          support via an intuitive online portal.
        </p>
      </div>
      <img src={homepageImage} alt="homepage" />
    </section>
  );
};

export default LandingPage;
