import React from "react";
import classes from "../Login/Login.module.css";

const RegisterSecondTab = ({ errorMessage }) => {
  return (
    <>
      <label id="emailLabel">Email</label>
      <input type="text" placeholder="Email" name="email" required />
      <label id="passwordLabel">Password</label>
      <input type="password" placeholder="Password" name="password" required />
      <label id="confirmPasswordLabel">Confirm Password</label>
      <input
        type="password"
        placeholder="Confirm Password"
        name="confirmPassword"
        required
      />
      {errorMessage && <p className={classes.error}>{errorMessage}</p>}
      <button type="submit" id="registerButton">
        Create
      </button>
    </>
  );
};

export default RegisterSecondTab;
