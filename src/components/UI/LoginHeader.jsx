import React from "react";
import classes from "./LoginHeader.module.css";
import cituLogo from "../../assets/citu-logo.png";
import { Link } from "react-router-dom";

const LoginHeader = () => {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <img src={cituLogo} alt="citu-logo" />
        <p>Streamlined Service Portal</p>
      </div>
      <div className={classes.buttons}>
        <Link to="/">
          <button className={classes.btnSignIn}>Sign in</button>
        </Link>
        <Link to="/register">
          <button className={classes.btnSignUp}>Sign up</button>
        </Link>
      </div>
    </header>
  );
};

export default LoginHeader;
