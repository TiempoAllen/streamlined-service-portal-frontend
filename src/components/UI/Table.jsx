import React from "react";
import classes from "./Table.module.css";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import * as Dialog from "@radix-ui/react-dialog";
import RequestDialogPortal from "../../components/UI/RequestDialogPortal";
import { formatDateTime } from "../../util/auth";

const Table = ({
  inputs,
  technicians,
  onApproveRequest,
  onRemoveTechnician,
}) => {
  const isTechnician = inputs.length > 0 && inputs[0].tech_phone !== undefined;

  const sortedInputs = [...inputs].sort((a, b) => {
    const dateA = new Date(a.datetime);
    const dateB = new Date(b.datetime);
    return dateB - dateA; // For descending order (latest to oldest)
  });

  return (
    <>
      <table className={classes.table}>
        <tbody>
          {/* Existing rendering logic using sortedInputs */}
          {sortedInputs.map((input, index) => (
            <tr key={index}>
              {isTechnician ? (
                <>
                  <td>{input.tech_id}</td>
                  <td className={classes.namePhone}>
                    <p>{input.tech_name}</p>
                    <p className={classes.techPhone}>{input.tech_phone}</p>
                  </td>
                  <td>{input.tech_gender}</td>
                  <td>{input.tech_classification}</td>
                  <td>
                    {input.isavailable === true ? "Available" : "Not Available"}
                  </td>
                  <td>{input.tech_status}</td>
                  <td className={classes.assign}>
                    <p>Assign</p>
                  </td>
                </>
              ) : (
                <>
                  {/* This section will render if it's not a technician */}
                  <td>{input.request_id}</td>
                  <td>
                    {input.user_firstname} {input.user_lastname}
                  </td>
                  <td>{input.request_technician}</td>
                  <td>{input.purpose}</td>
                  <td>{formatDateTime(input.datetime)}</td>
                  <td>{input.request_location}</td>
                  <td>{input.department}</td>
                  <td className={classes.attachment}>
                    <p>
                      <AttachFileIcon />
                      {input.attachment ? input.attachment : "No Attachment"}
                    </p>
                  </td>
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <td className={classes.view}>
                        <p>View</p>
                      </td>
                    </Dialog.Trigger>
                    <RequestDialogPortal
                      request={input}
                      technicians={technicians}
                      onApproveRequest={onApproveRequest}
                      onRemoveTechnician={onRemoveTechnician}
                    />
                  </Dialog.Root>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Table;
