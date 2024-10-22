import React from "react";
import loginImage from "../../assets/login-image.png";
import classes from "./Login.module.css";
import {
  Form,
  json,
  redirect,
  useNavigate,
  useActionData,
} from "react-router-dom";
import axios from "axios";

const Login = () => {
  const errorMessage = useActionData();
  const navigate = useNavigate();

  return (
    <section className={classes.main}>
      <img src={loginImage} alt="login" />
      <div className={classes.login_div}>
        <h1>Welcome!</h1>
        <Form method="post">
          <label id="emailLabel">Email</label>
          <input type="text" placeholder="Email" name="email" required />
          <label id="passwordLabel">Password</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            required
          />
          {errorMessage && <p className={classes.error}>{errorMessage}</p>}
          <button id="loginButton">Login</button>
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
    const response = await axios.post(
      "http://localhost:8080/user/login",
      authData
    );

    if (response.status !== 200) {
      throw json({ message: "Could not authenticate user." }, { status: 500 });
    }

    const resData = response.data;
    const token = resData.token;
    const user_id = resData.user_id;

    localStorage.setItem("token", token);
 

    return redirect(`/home/${user_id}`);
  } catch (error) {
    console.error("Error: ", error.response.data);
    if (
      error.response &&
      error.response.data === "Invalid username or password"
    ) {
      return json("Invalid username or password", { status: 401 });
    }
    return json("Could not authenticate user.", { status: 500 });
  }
}
