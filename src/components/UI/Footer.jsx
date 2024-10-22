import React from "react";
import classes from "./Footer.module.css";
import cituLogo2 from "../../assets/citu-logo-2.png";
import facebookLogo from "../../assets/facebook-logo.svg";
import mailLogo from "../../assets/mail-logo.svg";
import mobileLogo from "../../assets/mobile-logo.svg";

const Footer = () => {
  return (
    <footer className={classes.footer}>
      <img src={cituLogo2} alt="citu-logo" />
      <div className={classes.center}>
        <h1>CIT-U Streamlined Service</h1>
        <p>© 2023-2024 All Rights Reserved</p>
      </div>
      <div className={classes.end}>
        <img src={facebookLogo} alt="facebook-logo" />
        <img src={mailLogo} alt="mail-logo" />
        <img src={mobileLogo} alt="mobile-logo" />
      </div>
    </footer>
  );
};

export default Footer;
