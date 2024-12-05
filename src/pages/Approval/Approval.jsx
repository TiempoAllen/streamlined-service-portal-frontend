import * as Dialog from "@radix-ui/react-dialog";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLoaderData, useRouteLoaderData, useParams } from "react-router-dom";
import RequestDialogPortal from "../../components/UI/RequestDialogPortal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadRequestsAndTechnicians } from "../../util/auth";
import classes from "./Approval.module.css";
import SelectArea from "../../components/UI/SelectArea";
import RemarksModal from "../../components/UI/RemarksModal.jsx";
import AddRemarkModal from "../../components/UI/AddRemarkModal.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Approval = () => {
  const { requests: initialRequests, technicians } = useLoaderData();
  const [statusMessage, setStatusMessage] = useState(null);
  const [requests, setRequests] = useState(
    initialRequests.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
  );
  const [filter, setFilter] = useState("Pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [rowData, setRowData] = useState(
    initialRequests
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
      .filter((request) => request.status === "Pending")
  );
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedRowForRemarks, setSelectedRowForRemarks] = useState(null);
  const { user_id } = useParams();

  useEffect(() => {
    if (statusMessage) {
      toast.success(statusMessage, { autoClose: 1000 });
      setStatusMessage(null);
    }
  }, [statusMessage]);

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    setRowData(
      requests
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
        .filter((request) => {
          if (selectedFilter === "All") {
            return true;
          }
          if (selectedFilter === "Pending") {
            return request.status === "Pending";
          }
          if (selectedFilter === "Viewed") {
            return request.isOpened === true;
          }
          return request.status === selectedFilter;
        })
    );
  };

  const handleAssignTechnicianToRequest = async (
    request_id,
    tech_ids,
    scheduledStartDate,
    closeDialog
  ) => {
    console.log(request_id);
    console.log("Tech IDs: ", tech_ids);

    try {
      const formattedScheduledStartDate = new Date(
        scheduledStartDate
      ).toISOString();

      const params = new URLSearchParams();
      params.append("requestId", request_id);
      params.append("techIds", tech_ids.join(",")); // Convert array to comma-separated values
      params.append("scheduledStartDate", formattedScheduledStartDate);

      const response = await axios.post(
        `${API_URL}/request/assignTechnician`,
        null, // No body
        { params } // Attach formatted query params
      );
      const updatedRequests = requests
        .map((request) =>
          request.request_id === request_id
            ? { ...request, status: "Approved" }
            : request
        )
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

      setRequests(updatedRequests);
      setRowData(
        updatedRequests.filter((request) => {
          if (filter === "All") {
            return true;
          }
          return request.status === filter;
        })
      );

      // Reset selected request to close the dialog
      setSelectedRequest(null);

      toast.success("Request saved successfully.", { autoClose: 2000 });
    } catch (error) {
      // Error handling
      console.error(
        "Error assigning technicians:",
        error.response?.data || error.message
      );
      throw error;
    }
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

      const updatedRequests = requests
        .map((request) =>
          request.request_id === request_id
            ? { ...request, status: "Approved" }
            : request
        )
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

      setRequests(updatedRequests);
      setRowData(
        updatedRequests.filter((request) => {
          if (filter === "All") {
            return true;
          }
          return request.status === filter;
        })
      );

      // Reset selected request to close the dialog
      setSelectedRequest(null);

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

      const updatedRequests = requests
        .map((request) =>
          request.request_id === request_id
            ? { ...request, status: "Denied" }
            : request
        )
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

      setRequests(updatedRequests);
      setRowData(
        updatedRequests.filter((request) => {
          if (filter === "All") {
            return true;
          }
          return request.status === filter;
        })
      );

      // Reset selected request to close the dialog
      setSelectedRequest(null);

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

      const updatedRequests = requests
        .map((request) =>
          request.request_id === request_id
            ? { ...request, status: "Completed" }
            : request
        )
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

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
      toast.error("There was an error marking the request as done.");
    }
  };

  const handleStartRequest = async (request_id) => {
    try {
      await axios.put(
        `${API_URL}/request/updateStatus?request_id=${request_id}`,
        { status: "In Progress" }
      );

      const updatedRequests = requests
        .map((request) =>
          request.request_id === request_id
            ? { ...request, status: "In Progress" }
            : request
        )
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

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
    { headerName: "Request Type", field: "request_technician", flex: 1 },
    { headerName: "Description", field: "description", flex: 1 },
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
      cellRenderer: (params) => {
        // Separate states for View and History modals
        const [isViewOpen, setIsViewOpen] = useState(false);
        const [isHistoryOpen, setIsHistoryOpen] = useState(false);
        const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);

        const openAddRemarkModal = () => {
          setIsAddRemarkOpen(true);
          setSelectedRowForRemarks(params.data); // Set selected request for remark
        };

        return (
          <div style={{ display: "flex", gap: "10px" }}>
            {/* View Button and Modal */}
            <Dialog.Root
              open={
                isViewOpen &&
                selectedRequest?.request_id === params.data.request_id
              }
              onOpenChange={(open) => {
                setIsViewOpen(open);
                if (open) {
                  setSelectedRequest(params.data);
                  markRequestAsOpened(params.data.request_id);
                } else {
                  setSelectedRequest(null);
                }
              }}
            >
              <Dialog.Trigger asChild>
                <button
                  onClick={() => {
                    setIsViewOpen(true);
                    setSelectedRequest(params.data);
                  }}
                  className={classes.viewBtn}
                >
                  View
                </button>
              </Dialog.Trigger>
              <RequestDialogPortal
                request={params.data}
                technicians={technicians}
                onApproveRequest={approveRequest}
                onRequestDone={handleRequestDone}
                onDenyRequest={denyRequest}
                onRequestStart={handleStartRequest}
                onAssignTechnician={handleAssignTechnicianToRequest}
                onClose={() => {
                  setIsViewOpen(false);
                  setSelectedRequest(null);
                }}
              />
            </Dialog.Root>

            {/* History Button and Modal */}
            <button
              onClick={() => {
                setIsHistoryOpen(true);
                setSelectedRequest(params.data);
                markRequestAsOpened(params.data.request_id);
              }}
              className={classes.historyButton}
            >
              History
            </button>

            {isHistoryOpen &&
              selectedRequest?.request_id === params.data.request_id && (
                <RemarksModal
                  isOpen={isHistoryOpen}
                  onClose={() => {
                    setIsHistoryOpen(false);
                    setSelectedRequest(null);
                  }}
                  requestID={params.data.request_id}
                />
              )}

            {/* Add Remark Button */}
            <button
              onClick={openAddRemarkModal} // Open the Add Remark modal
              className={classes.addRemarkBtn}
            >
              Add Remark
            </button>

            {/* Add Remark Modal */}
            {isAddRemarkOpen && (
              <AddRemarkModal
                isOpen={isAddRemarkOpen}
                onClose={() => setIsAddRemarkOpen(false)}
                requestId={selectedRowForRemarks}
                userId={user_id}
              />
            )}
          </div>
        );
      },
    },
  ];

  const handleTabClick = (status) => {
    setActiveTab(status);

    if (status === "all") {
      setRowData(requests);
    } else {
      setRowData(requests.filter((request) => request.status === status));
    }
  };

  const statuses = {
    all: "All",
    Pending: "Pending",
    Approved: "Approved",
    "In Progress": "In Progress",
    Done: "Completed",
    Denied: "Rejected",
  };

  return (
    <section className={classes.approval}>
      {/* Dropdown filter component */}
      <SelectArea
        onFilterChange={handleFilterChange}
        header="Requests"
        isRecords={true}
      />

      {/* Tabs for filtering by status */}
      <div className={classes.exampleHeader}>
        <div className={classes.tabs}>
          {Object.entries(statuses).map(([statusKey, displayValue]) => (
            <button
              key={statusKey}
              className={`${classes.tabButton} ${
                activeTab === statusKey ? classes.active : ""
              }`}
              onClick={() => handleTabClick(statusKey)}
            >
              {displayValue}
            </button>
          ))}
        </div>
      </div>

      {/* Data grid display */}
      <div
        className="ag-theme-quartz"
        style={{ height: "100%", width: "100%", marginTop: "1rem" }}
      >
        <AgGridReact
          rowData={rowData} // Data for the grid rows
          columnDefs={columns} // Column definitions
          domLayout="autoHeight" // Automatically adjust height
          pagination={true} // Enable pagination
          paginationPageSize={10} // Number of rows per page
          rowHeight={80} // Height of each row
        />
      </div>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Remarks Modal */}
      {isRemarksModalOpen && (
        <RemarksModal
          onClose={() => setIsRemarksModalOpen(false)}
          data={selectedRowForRemarks}
        />
      )}
    </section>
  );
};

export default Approval;

export const loader = loadRequestsAndTechnicians;
