import * as Dialog from "@radix-ui/react-dialog";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import React, { useState } from "react";
import { useLoaderData } from "react-router-dom";
import RequestDialogPortal from "../../components/UI/RequestDialogPortal";
import { LOCAL_ENV } from "../../util/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadRequestsAndTechnicians } from "../../util/auth";

const Approval = () => {
  const { requests: initialRequests, technicians } = useLoaderData();

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
        `${LOCAL_ENV}/request/updateStatus?request_id=${request_id}`,
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
      toast.success("Request saved successfully.");
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
    }
  };

  const denyRequest = async (request_id, denialReason) => {
    try {
      await axios.put(
        `${LOCAL_ENV}/request/updateStatus?request_id=${request_id}`,
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
      toast.success("Request saved successfully.");
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
    }
  };

  const handleRequestDone = async (request_id) => {
    try {
      await axios.put(
        `${LOCAL_ENV}/request/updateStatus?request_id=${request_id}`,
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
      toast.success("Request saved successfully.");
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
    }
  };

  const handleStartRequest = async (request_id) => {
    try {
      await axios.put(
        `${LOCAL_ENV}/request/updateStatus?request_id=${request_id}`,
        { status: "In Progress" }
      );

      const updatedRequests = requests.map((request) =>
        request.request_id === request_id
          ? { ...request, status: "In Progress" }
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
      toast.success("Request saved successfully.");
      setTimeout(() => {
        toast.dismiss();
      }, 5000);
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
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
    { headerName: "Title", field: "title", flex: 1 },
    { headerName: "Description", field: "description", flex: 1 },
    { headerName: "Technician", field: "request_technician", flex: 1 },
    {
      headerName: "Date/Time",
      field: "datetime",
      flex: 1,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
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
              onRequestStart={handleStartRequest}
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
          rowHeight={80}
        />
      </div>
      <ToastContainer />
    </section>
  );
};

export default Approval;

export const loader = loadRequestsAndTechnicians;
