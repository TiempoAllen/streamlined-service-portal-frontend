import React, { useState } from "react";
import registerImage from "../../assets/registration-image.png";
import classes from "../Login/Login.module.css";
import { DEPT_DATA } from "./department-data";
import { submitRegistration } from "../../util/auth";
// import RegisterFirstTab from "./RegisterFirstTab";
// import RegisterSecondTab from "./RegisterSecondTab";

const Register = () => {
  const [currentTab, setCurrentTab] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    employee_id: "",
    department: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleNextTab = (event) => {
    event.preventDefault();
    setCurrentTab(2);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await submitRegistration(formData);

    if (result.success) {
      // Redirect or handle successful registration
      window.location.href = "/";
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <section className={classes.main}>
      <img src={registerImage} alt="register" />
      <div className={classes.register_div}>
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          {currentTab === 1 && (
            <>
              <div className={classes.row}>
                <div>
                  <label id="firstNameLabel">First Name</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label id="lastNameLabel">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={classes.row}>
                <div>
                  <label id="usernameLabel">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label id="employeeIdLabel">Employee ID</label>
                  <input
                    type="text"
                    placeholder="Employee ID"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <label id="departmentLabel">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Choose</option>
                {DEPT_DATA.map((dept, index) => (
                  <option key={index} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <button id="nextButton" onClick={handleNextTab}>
                Next
              </button>
            </>
          )}
          {currentTab === 2 && (
            <>
              <label id="emailLabel">Email</label>
              <input
                type="text"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label id="passwordLabel">Password</label>
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label id="confirmPasswordLabel">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </>
          )}
          {errorMessage && <p className={classes.error}>{errorMessage}</p>}
          {currentTab === 2 && (
            <button type="submit" id="registerButton">
              Create
            </button>
          )}
        </form>

        <ul className={classes.pagination}>
          <li
            className={currentTab === 2 ? classes.active : undefined}
            onClick={() => setCurrentTab(1)}
          >
            1
          </li>
          <li
            className={currentTab === 1 ? classes.active : undefined}
            onClick={() => setCurrentTab(2)}
          >
            2
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Register;
