import { redirect } from "react-router-dom";
import axios from "axios";


export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token;

};


export const checkAuthLoader = () => {
  const token = getAuthToken();

  if (!token) {
    return redirect("/");
  }

  return null;  
};



export const AddSuperUser = async (formData) => {
  const {
    firstname,
    lastname,
    username,
    employee_id,
    department,
    email,
    password,
  } = formData;

 

  if (password.length < 8) {
    return {
      success: false,
      message: "Your password must be at least 8 characters long.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      success: false,
      message: "Your password must include at least one uppercase letter.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      success: false,
      message: "Your password must include at least one lowercase letter.",
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      success: false,
      message:
        "Your password must include at least one special character (e.g., !, @, #, $, %, ^, &, *).",
    };
  }
  if (!email.endsWith("@cit.edu")) {
    return { success: false, message: "Email must end with '@cit.edu'." };
  }

  const registerData = {
    firstname,
    lastname,
    username,
    password,
    employee_id,
    email,
    department,
 
  };

  try {
    const response = await axios.post(
      "http://localhost:8080/user/add",
      registerData
    );

    if (response.status !== 200) {
      throw new Error("Could not register user.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error: ", error.response?.data || error.message);
    if (error.response && error.response.data === "Email already exists") {
      return { success: false, message: "Email already exists" };
    }
    if (error.response && error.response.data === "Employee ID already exists") {
      return { success: false, message: "Employee ID already exists" };
    }
    return { success: false, message: "Could not register user." };
  }
};
