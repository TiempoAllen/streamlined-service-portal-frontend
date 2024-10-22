import React from "react";
import classes from "../Login/Login.module.css";
import { DEPT_DATA } from "./department-data";

const RegisterFirstTab = ({ errorMessage, handleNextTab }) => {
  return (
    <>
      <div className={classes.row}>
        <div>
          <label id="firstNameLabel">First Name</label>
          <input
            type="text"
            placeholder="First Name"
            name="firstname"
            required
          />
        </div>
        <div>
          <label id="lastNameLabel">Last Name</label>
          <input type="text" placeholder="Last Name" name="lastname" required />
        </div>
      </div>
      <div className={classes.row}>
        <div>
          <label id="usernameLabel">Username</label>
          <input type="text" placeholder="Username" name="username" required />
        </div>

        <div>
          <label id="employeeIdLabel">Employee ID</label>
          <input
            type="text"
            placeholder="Employee ID"
            name="employee_id"
            required
          />
        </div>
      </div>
      <label id="departmentLabel">Department</label>
      <select name="department" required>
        <option value="">Choose</option>
        {DEPT_DATA.map((dept, index) => (
          <option key={index} value={dept.name}>
            {dept.name}
          </option>
        ))}
      </select>

      {errorMessage && <p className={classes.error}>{errorMessage}</p>}
      <button id="nextButton" onClick={handleNextTab}>
        Next
      </button>
    </>
  );
};

export default RegisterFirstTab;
