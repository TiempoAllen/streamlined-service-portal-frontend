import axios from "axios";
import React from "react";
import loginImage from "../../assets/login-image.png";
import { LOCAL_ENV } from "../../util/auth";
import {
  Form,
  json,
  redirect,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import classes from "./Login.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Login = () => {
  const errorMessage = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <section className={classes.main}>
      <img src={loginImage} alt="login" />
      <div className={classes.login_div}>
        <h1>Welcome!</h1>
        <Form method="post">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            name="email"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            name="password"
            required
          />
          {errorMessage && <p className={classes.error}>{errorMessage}</p>}
          <button id="loginButton" disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : "Login"}
          </button>
          <p>
            Don't have an account?{" "}
            <span
              onClick={() => {
                navigate("/register");
              }}
            >
              Sign up
            </span>
          </p>
        </Form>
      </div>
    </section>
  );
};

export default Login;

export async function action({ request }) {
  const data = await request.formData();
  const authData = {
    email: data.get("email"),
    password: data.get("password"),
  };

  try {
    const response = await axios.post(`${LOCAL_ENV}/user/login`, authData);

    // Check if response exists and has the required data
    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }

    const { token, user_id } = response.data;

    if (!token || !user_id) {
      throw new Error("Missing required data from server");
    }

    localStorage.setItem("token", token);
    return redirect(`/home/${user_id}`);
  } catch (error) {
    console.error("Error: ", error);

    // Handle different types of errors
    if (error.response) {
      // Server responded with an error
      if (error.response.status === 401) {
        return json("Invalid email or password", { status: 401 });
      }
      return json(error.response.data || "Authentication failed", {
        status: error.response.status,
      });
    }

    if (error.request) {
      // Request was made but no response received (network error)
      return json(
        "Unable to connect to server. Please check your internet connection.",
        {
          status: 503,
        }
      );
    }

    // Something else went wrong
    return json("An unexpected error occurred. Please try again.", {
      status: 500,
    });
  }
}
