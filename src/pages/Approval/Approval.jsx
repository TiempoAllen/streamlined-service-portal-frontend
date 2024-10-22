import React, { useState } from "react";
import classes from "./Approval.module.css";
import { loadRequestsAndTechnicians } from "../../util/auth";
import axios from "axios";
import { useLoaderData } from "react-router-dom";
import SelectArea from "../../components/UI/SelectArea";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import * as Dialog from "@radix-ui/react-dialog";
import RequestDialogPortal from "../../components/UI/RequestDialogPortal";

const Approval = () => {
  const { requests: initialRequests, technicians } = useLoaderData();
  console.log("Requests", initialRequests);

  // Manage the `requests` state, not just `rowData`
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState("Pending");
  const [rowData, setRowData] = useState(
    initialRequests.filter((request) => request.status === "Pending")
  );

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    setRowData(
      requests.filter((request) => {
        if (selectedFilter === "All") {
          return true;
        }
        return request.status === selectedFilter;
      })
    );
  };

  const approveRequest = async (request_id) => {
    try {
      await axios.put(
        `http://localhost:8080/request/updateStatus?request_id=${request_id}`,
        {
          status: "Approved",
          denialReason: null,
        }
      );

      // Update the requests array
      const updatedRequests = requests.map((request) =>
        request.request_id === request_id
          ? { ...request, status: "Approved" }
          : request
      );

      // Update both requests and rowData states
      setRequests(updatedRequests);
      setRowData(
        updatedRequests.filter((request) => {
          if (filter === "All") {
            return true;
          }
          return request.status === filter;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const denyRequest = async (request_id, denialReason) => {
    try {
      await axios.put(
        `http://localhost:8080/request/updateStatus?request_id=${request_id}`,
        {
          status: "Denied",
          denialReason: denialReason,
        }
      );

      // Update the requests array
      const updatedRequests = requests.map((request) =>
        request.request_id === request_id
          ? { ...request, status: "Denied" }
          : request
      );

      // Update both requests and rowData states
      setRequests(updatedRequests);
      setRowData(
        updatedRequests.filter((request) => {
          if (filter === "All") {
            return true;
          }
          return request.status === filter;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestDone = async (request_id) => {
    try {
      await axios.put(
        `http://localhost:8080/request/updateStatus?request_id=${request_id}`,
        { status: "Done" }
      );

      const updatedRequests = requests.map((request) =>
        request.request_id === request_id
          ? { ...request, status: "Done" }
          : request
      );

      setRequests(updatedRequests);
      setRowData(
        updatedRequests.filter((request) => {
          if (filter === "All") {
            return true;
          }
          return request.status === filter;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { headerName: "Request ID", field: "request_id", flex: 1 },
    {
      headerName: "User",
      field: "user_firstname",
      cellRenderer: (params) =>
        `${params.data.user_firstname} ${params.data.user_lastname}`,
      flex: 1,
    },
    { headerName: "Technician", field: "request_technician", flex: 1 },
    { headerName: "Title", field: "title", flex: 1 },
    { headerName: "Description", field: "description", flex: 1 },
    {
      headerName: "Date/Time",
      field: "datetime",
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    { headerName: "Location", field: "request_location", flex: 1 },
    { headerName: "Department", field: "department", flex: 1 },
    {
      headerName: "Attachment",
      field: "attachment",
      flex: 1,
      cellRenderer: (params) => (
        <span>{params.value ? params.value : "No Attachment"}</span>
      ),
    },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params) => (
        <div>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <p className={classes.viewBtn}>View</p>
            </Dialog.Trigger>
            <RequestDialogPortal
              request={params.data}
              technicians={technicians}
              onApproveRequest={approveRequest}
              onRequestDone={handleRequestDone}
              onDenyRequest={denyRequest}
            />
          </Dialog.Root>
        </div>
      ),
    },
  ];

  return (
    <section className={classes.approval}>
      <SelectArea onFilterChange={handleFilterChange} header="Requests" />
      <div
        className="ag-theme-quartz"
        style={{ height: "100%", width: "100%", marginTop: "1rem" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columns}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </section>
  );
};

export default Approval;

export const loader = loadRequestsAndTechnicians;
