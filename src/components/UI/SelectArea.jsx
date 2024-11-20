import React, { useState } from "react";
import classes from "./SelectArea.module.css";

const SelectArea = ({ onFilterChange, header, isRecords }) => {
  const [selectedFilter, setSelectedFilter] = useState("Pending");

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    onFilterChange(event.target.value);
  };

  return (
    <section className={classes.selectArea}>
      <h1>{header}</h1>
      {!isRecords && (
        <select value={selectedFilter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Completed</option>
          <option value="Denied">Rejected</option>
        </select>
      )}
    </section>
  );
};

export default SelectArea;
