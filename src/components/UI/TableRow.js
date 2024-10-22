import React from "react";
import classes from "./TableRow.module.css";

const TableRow = ({ technician }) => {
  //   let availability = "";
  //   if (technician.available == true) {
  //     availability = "Available";
  //   } else {
  //     availability = "Not Available";
  //   }

  return (
    <section className={classes.tableRow}>
      <ul key={technician.id}>
        <li>{technician.tech_name}</li>
        <li>{technician.tech_gender}</li>
        <li>{technician.tech_classification}</li>
        <li>{technician.available ? "Available" : "Not Available"}</li>
        <li>{technician.tech_status}</li>
        <li></li>
      </ul>
    </section>
  );
};

export default TableRow;
