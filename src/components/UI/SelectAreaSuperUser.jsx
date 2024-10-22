import React from "react";
import classes from "./SelectArea.module.css";

const SelectAreaSuperUser = () => {
  return (
    <section className={classes.selectAreaSuper}>
      <h1>Requests</h1>
      <select>
        <option>All</option>
      </select>
    </section>
  );
};

export default SelectAreaSuperUser;
