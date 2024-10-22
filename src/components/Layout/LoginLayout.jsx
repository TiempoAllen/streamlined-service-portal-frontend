import React from "react";
import LoginHeader from "../UI/LoginHeader";
import { Outlet } from "react-router-dom";
import Footer from "../UI/Footer";
import classes from "./HomeLayout.module.css";

const LoginLayout = () => {
  return (
    <>
      <LoginHeader />
      <main className={classes.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default LoginLayout;
