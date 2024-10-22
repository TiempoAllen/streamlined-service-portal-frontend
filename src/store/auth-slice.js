import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  username: "",
  password: "",
  employee_id: "",
  email: "",
  department: "",
  message: "",
  token: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUsername(state, action) {
      state.username = action.payload;
    },
    setPassword(state, action) {
      state.password = action.payload;
    },
    setEmplyeeID(state, action) {
      state.employee_id = action.payload;
    },
    setEmail(state, action) {
      state.email = action.payload;
    },
    setDepartment(state, action) {
      state.department = action.payload;
    },
    setMessage(state, action) {
      state.message = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
  },
});

export const getAuthToken = () => {
  return (dispatch) => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(authActions.setToken(token));
    }
  };
};

export const loginUser = ({ username, password }) => {
  return async (dispatch) => {
    try {
      const requestData = {
        username: username,
        password: password,
      };
      const response = await axios.post(
        "http://localhost:5000/login",
        requestData
      );
      dispatch(authActions.setMessage(response.data.message));
    } catch (error) {
      if (error.response) {
        dispatch(authActions.setMessage(error.response.data.message));
      } else {
        dispatch(authActions.setMessage("An error occurred while logging in."));
      }
      console.error("Login error: ", error);
    }
  };
};

export const registerUser = ({
  username,
  password,
  employee_id,
  email,
  department,
}) => {
  return async (dispatch) => {
    try {
      const response = await axios.post("http://localhost:5000/user", {
        username: username,
        password: password,
        employee_id: employee_id,
        email: email,
        department: department,
      });
      console.log(response.data);
      dispatch(authActions.setMessage(response.data.message));
      alert("User created.");
    } catch (error) {
      console.error("Registration error: ", error);
    }
  };
};

export const authActions = authSlice.actions;

export default authSlice;
