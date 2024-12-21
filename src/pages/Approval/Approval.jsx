import * as Dialog from "@radix-ui/react-dialog";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import RequestDialogPortal from "../../components/UI/RequestDialogPortal";
import { ToastContainer, toast } from "react-toastify";
import { Spin, Button, notification, Table, Tooltip  } from "antd";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/reset.css"; // Import Ant Design CSS reset
import { LoadingOutlined } from "@ant-design/icons"; // For custom loading icon
import { loadRequestsAndTechnicians } from "../../util/auth";
import classes from "./Approval.module.css";
import SelectArea from "../../components/UI/SelectArea";
import RemarksModal from "../../components/UI/RemarksModal.jsx";
import AddRemarkModal from "../../components/UI/AddRemarkModal.jsx";
import moment from "moment";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// The loader for fetching data
export const loader = async () => {
  try {
    const response = await loadRequestsAndTechnicians();
    return response; // Return the fetched data
  } catch (error) {
    console.error("Error loading requests and technicians:", error);
    return { requests: [], technicians: [] }; // Return empty data in case of error
  }
};

const Approval = () => {
  const { requests: initialRequests, technicians } = useLoaderData();
  const [statusMessage, setStatusMessage] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Pending");
  const [isLoading, setIsLoading] = useState(true);
  const [rowData, setRowData] = useState([]);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedRowForRemarks, setSelectedRowForRemarks] = useState(null);
  const { user_id } = useParams();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (initialRequests.length === 0) {
      setIsLoading(true); // Start loading
    } else {
      // Sort and set data
      setRequests(
        initialRequests.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        )
      );
      setRowData(
        initialRequests
          .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
          .filter((request) => request.status === "Pending")
      );

      // Add a 1-second delay before stopping the loader
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [initialRequests]);

  const handleAssignTechnicianToRequest = async (
    request_id,
    tech_ids,
    scheduledStartDate,
    closeDialog
  ) => {
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
        null,
        { params }
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

      setSelectedRequest(null);

      notification.success({
        message: "Success",
        description: "Request saved successfully.",
        duration: 2,
      });
    } catch (error) {
      console.error(
        "Error assigning technicians:",
        error.response?.data || error.message
      );

      notification.error({
        message: "Error",
        description: "Failed to assign technician.",
        duration: 2,
      });
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

      notification.success({
        message: "Success",
        description: "Request saved successfully.",
        duration: 2,
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        description: "Failed to assign technician.",
        duration: 2,
      });
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
      notification.error({
        message: "Error",
        description: "Failed to assign technician.",
        duration: 2,
      });
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
      notification.success({
        message: "Success",
        description: "Request saved successfully.",
        duration: 2,
      });
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
      notification.success({
        message: "Success",
        description: "Request saved successfully.",
        duration: 2,
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        description: "Failed to assign technician.",
        duration: 2,
      });
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
    {
      title: "Request ID",
      dataIndex: "request_id",
      key: "request_id",
    },
    {
      title: "Requestor",
      key: "user",
      render: (_, record) =>
        `${record.user_firstname} ${record.user_lastname}`,
    },
    {
      title: "Request Type",
      dataIndex: "request_technician",
      key: "request_technician",
      filters: [
        { text: "Building Maintenance", value: "Building Maintenance" },
        { text: "General Services", value: "General Services" },
        { text: "Electrical Maintenance", value: "Electrical Maintenance" },
      ],
      onFilter: (value, record) => {
        return record.request_technician?.toLowerCase() === value.toLowerCase();
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Date/Time",
      dataIndex: "datetime",
      key: "datetime",
      render: (text) => {
        const date = new Date(text);
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // Optional: use `false` for 24-hour format
        });
      },
      filters: [
        { text: "Today", value: "today" },
        { text: "This Week", value: "week" },
        { text: "This Month", value: "month" },
        { text: "This Year", value: "year" },
      ],
      onFilter: (value, record) => {
        const date = moment(record.datetime); // Adjust based on your data field
        const today = moment().startOf("day");
    
        switch (value) {
          case "today":
            return date.isSame(today, "day");
          case "week":
            return date.isSame(today, "week");
          case "month":
            return date.isSame(today, "month");
          case "year":
            return date.isSame(today, "year");
          default:
            return false;
        }
      },
    },
    {
    title: "Location",
    dataIndex: "request_location",
    key: "request_location",
    },
    {
      title: "Attachment",
      dataIndex: "attachment",
      key: "attachment",
      render: (text) => {
        if (!text) return "No Attachment";
        const maxLength = 20;
        const truncatedText =
          text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
        return (
          <Tooltip title={text}>
            <span>{truncatedText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          {/* View Button */}
          <Dialog.Root>
          <Dialog.Trigger asChild>
          <Button
            type="primary"
            onClick={() => {
              setIsViewOpen(true);
              setSelectedRequest(record);
            }}
          >
            View
          </Button>
          </Dialog.Trigger>

           {/* View Modal */}
            {isViewOpen && selectedRequest && (
              <RequestDialogPortal
                request={selectedRequest}
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
            )}
          </Dialog.Root>

          {/* Add Remark Button */}
          <Button
            onClick={() => {
              setIsAddRemarkOpen(true);
              setSelectedRequest(record);
            }}
          >
            Add Remark
          </Button>

          {/* History Button */}
          <Button
            onClick={() => {
              setIsHistoryOpen(true);
              setSelectedRequest(record);
              markRequestAsOpened(record.request_id);
            }}
          >
            History
          </Button>
        </div>
      ),
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

  return isLoading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin size="large" />
    </div>
  ) : (
    <section className={classes.approval}>
      {/* Dropdown filter component */}
      <SelectArea header="Requests" isRecords={true} />

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
        style={{
          height: rowData && rowData.length > 0 ? "100%" : "500px", // Set height to 100% if data exists, or 300px if no data
          width: "100%",
          marginTop: "1rem",
          zIndex: 0,
          overflow: "auto",
        }}
      >
        <Table
          dataSource={rowData}
          columns={columns}
          rowKey="request_id"
          pagination={{ pageSize: 10 }}
          style={{ backgroundColor: "white", borderRadius: "6px" }}
        />
      </div>
     

      {/* Add Remark Modal */}
      {isAddRemarkOpen && selectedRequest && (
        <AddRemarkModal
          isOpen={isAddRemarkOpen}
          onClose={() => {
            setIsAddRemarkOpen(false);
            setSelectedRequest(null);
          }}
          requestId={selectedRequest.request_id}
          userId={user_id}
          status={selectedRequest.status}
        />
      )}

      {/* History Modal */}
      {isHistoryOpen && selectedRequest && (
        <RemarksModal
          isOpen={isHistoryOpen}
          onClose={() => {
            setIsHistoryOpen(false);
            setSelectedRequest(null);
          }}
          requestID={selectedRequest.request_id}
        />
      )}
    </section>
  );
};
export default Approval;

// export const loader = loadRequestsAndTechnicians;
