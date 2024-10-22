import React from "react";
import classes from "./DetailsHeader.module.css";

const DetailsHeader = ({ isTechnician }) => {
  return (
    <>
      <table className={classes.table}>
        <tbody>
          <tr>
            {isTechnician ? (
              <>
                <td>Full Name/Phone</td>
                <td>Gender</td>
                <td>Classification</td>
                <td>Availability</td>
                <td>Status</td>
                <td className={classes.assign}>
                  <p>View</p>
                </td>
                <td className={classes.assign}>
                  <p>View</p>
                </td>
              </>
            ) : (
              <>
                <td>Requestor</td>
                <td>Technician Requested</td>
                <td>Purpose</td>
                <td>Date and Time</td>
                <td>Location</td>
                <td>Department</td>
                <td>Attachment</td>
                <td className={classes.assign}>
                  <p>View</p>
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default DetailsHeader;
