import React from "react";
import MainNavigation from "../../components/UI/MainNavigation";
import { Outlet, useRouteLoaderData } from "react-router-dom";
import classes from "./HomeLayout.module.css";
import SideNav from "../../components/UI/SideNav";
import Footer from "../UI/Footer";

const HomeLayout = () => {
  const user = useRouteLoaderData("home");
  const isAdmin = user && user.isadmin;
  const isSuperUser = user && user.isSuperUser;
  const user_id = user && user.user_id;

  return (
    <>
      <MainNavigation user={user} />
      {isAdmin ? (
        <div className={classes.layout}>
          <SideNav 
            user_id={user_id} 
            isSuperUser={isSuperUser} 
            isadmin={isAdmin} 
            className={classes.menu} 
          />
          <main className={classes.adminMain}>
            <Outlet />
            <Footer className={classes.footerAdmin} />
          </main>
        </div>
      ) : (
        <>
          <main className={classes.main}>
            <Outlet />
          </main>
          <Footer className={classes.footer} />
        </>
      )}
    </>
  );
};

export default HomeLayout;
