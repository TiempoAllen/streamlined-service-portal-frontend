import * as Dialog from "@radix-ui/react-dialog";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import RequestDialogPortal from "../../components/UI/RequestDialogPortal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadRequestsAndTechnicians } from "../../util/auth";
import classes from "./Approval.module.css";
import SelectArea from "../../components/UI/SelectArea";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";


const Approval = () => {
  const { requests: initialRequests, technicians } = useLoaderData();
  const [statusMessage, setStatusMessage] = useState(null);
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState("Pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rowData, setRowData] = useState(
    initialRequests.filter((request) => request.status === "Pending")
  );

  useEffect(() => {
   
    if (statusMessage) {
      toast.success(statusMessage, { autoClose: 1000 });
      setStatusMessage(null); 
    }
  }, [statusMessage]);  
   
  
  

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    setRowData(
        requests.filter((request) => {
            // If "All" is selected, show all requests
            if (selectedFilter === "All") {
                return true;
            }

            // Include "Pending" requests regardless of isOpened state
            if (selectedFilter === "Pending") {
                return request.status === "Pending";
            }

            // Filter by status and check if the request is opened (viewed)
            if (selectedFilter === "Viewed") {
                return request.isOpened === true;
            }

            // Filter by other statuses (Approved, Denied, etc.)
            return request.status === selectedFilter;
        })
    );
};

  


  const approveRequest = async (request_id) => {
    try {
      await axios.put(
        `${API_URL}/request/updateStatus?request_id=${request_id}`,
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
      toast.success("Request saved successfully.", { autoClose: 2000 });
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
    }
  };

  const denyRequest = async (request_id, denialReason) => {
    try {
      await axios.put(
        `${API_URL}/request/updateStatus?request_id=${request_id}`,
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
      toast.success("Request saved successfully.", { autoClose: 5000 });
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
    }
  };

  const handleRequestDone = async (request_id) => {
    try {
      await axios.put(
        `${API_URL}/request/updateStatus?request_id=${request_id}`,
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
      toast.success("Request saved successfully.", { autoClose: 2000 });
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
    }
  };

  const handleStartRequest = async (request_id) => {
    try {
      await axios.put(
        `${API_URL}/request/updateStatus?request_id=${request_id}`,
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
      toast.success("Request saved successfully.", { autoClose: 2000 });
    } catch (error) {
      console.error(error);
      toast.error("There was an error.");
    }
  };

  const markRequestAsOpened = async (request_id) => {
      console.log("Mark request as viewed triggered for request ID:", request_id);
    try {
        await axios.put(`${API_URL}/request/markViewed/${request_id}`);

        const updatedRequests = requests.map((request) =>
            request.request_id === request_id
                ? { ...request, isOpened: true }
                : request
        );
        
    } catch (error) {
        console.error("Error marking request as opened:", error);
        toast.error("An error occurred while processing the request.");
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
     <Dialog.Root
          open={selectedRequest?.request_id === params.data.request_id}
          onOpenChange={(open) => {
            if (open) {
              setSelectedRequest(params.data);
              markRequestAsOpened(params.data.request_id);
            } else {
              setSelectedRequest(null);
            }
          }}
        >
          <Dialog.Trigger asChild>
            <button className={classes.viewBtn}>View</button>
          </Dialog.Trigger>
            <RequestDialogPortal
              request={params.data}
              technicians={technicians}
              onApproveRequest={approveRequest}
              onRequestDone={handleRequestDone}
              onDenyRequest={denyRequest}
              onRequestStart={handleStartRequest}
              onClose={() => setSelectedRequest(null)}
              //={markRequestAsOpened}
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
     
<ToastContainer
/>
 

    </section>
  );
};

export default Approval;

export const loader = loadRequestsAndTechnicians;
