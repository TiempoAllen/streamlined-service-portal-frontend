import React from "react";
import classes from "./Error.module.css";
import MainNavigation from "../../components/UI/MainNavigation";
import { useRouteError } from "react-router-dom";

const Error = () => {
  const error = useRouteError();

  let title = "An error occured!";
  let content = "Something went wrong.";

  if (error.status === 500) {
    content = error.data.message;
  }

  if (error.status === 404) {
    title = "Not found";
    content = "Could not find resource or page.";
  }
  return (
    <>
      <MainNavigation />
      <div className={classes.error}>
        <h1>{title}</h1>
        <p>{content}</p>
      </div>
    </>
  );
};

export default Error;
