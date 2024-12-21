import React, { useState } from "react";
import classes from "./HomePage.module.css";
import { useRouteLoaderData, useParams } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import { loadUserAndRequests } from "../../util/auth";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import * as Dialog from "@radix-ui/react-dialog";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RequestDetailsPortal from "../../components/UI/RequestDetailsPortal";
import axios from "axios";
import { Table, Tag, Modal, Button, Spin, Input } from "antd";

import { SearchOutlined } from "@ant-design/icons";
import RemarksModal from "../../components/UI/RemarksModal";
import AddRemarkModal from "../../components/UI/AddRemarkModal";
import moment from "moment";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const formatDateTime = (datetime) => {
  const date = new Date(datetime);
  const options = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const HomePage = () => {
  const { user, requests: initialRequests = [] } = useRouteLoaderData("home");
  const isAdmin = user && user.isadmin;
  const [activeTab, setActiveTab] = useState("Pending");
  const [requests, setRequests] = useState(
    Array.isArray(initialRequests) ? initialRequests : []
  );
  const themeClass = "ag-theme-quartz";
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Pending");
  const [rowData, setRowData] = useState(
    (Array.isArray(initialRequests) ? initialRequests : []).filter(
      (request) => request.status === "Pending"
    )
  );
  const { user_id } = useParams();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);
  const [selectedRowForRemarks, setSelectedRowForRemarks] = useState(null);

  const handleCancelRequest = async (request_id) => {
    try {
      await axios.put(
        `${API_URL}/request/updateStatus?request_id=${request_id}`,
        { status: "Cancelled" }
      );
      // Update the requests array
      const updatedRequests = requests.map((request) =>
        request.request_id === request_id
          ? { ...request, status: "Cancelled" }
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
      toast.error("There was an error marking the request as done.");
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

<<<<<<< HEAD
  const [colDefs] = useState([
    { field: "RequestID", headerName: "RequestID" },
    { field: "Request Type", headerName: "Request Type" },
    { field: "Description", headerName: "Description" },
    { field: "Location", headerName: "Location" },
    { field: "Status", headerName: "Status" },
    { field: "Date Requested", headerName: "Date Requested" },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 300,
      maxWidth: 300,
      cellRenderer: (params) => {
        const [isHistoryOpen, setIsHistoryOpen] = useState(false);
        const [isViewOpen, setIsViewOpen] = useState(false);
        const [selectedRequest, setSelectedRequest] = useState(null);
        const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);
        const [selectedRowForRemarks, setSelectedRowForRemarks] =
          useState(null);

        const openAddRemarkModal = () => {
          setIsAddRemarkOpen(true);
          setSelectedRequest(params.data);
        };

        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button
                  type="primary"
                  onClick={() => {
                    setIsViewOpen(true);
                    setSelectedRequest(params.data);
                  }}
                >
                  View
                </Button>
              </Dialog.Trigger>
              <RequestDetailsPortal
                request_id={params.data.RequestID}
                onCancelRequest={handleCancelRequest}
              />
            </Dialog.Root>

            <Button
              onClick={openAddRemarkModal} // Open the Add Remark modal
              className={classes.addRemarkBtn}
            >
              Add Remark
            </Button>

            {/* Add Remark Modal */}
            {isAddRemarkOpen && (
              <AddRemarkModal
                isOpen={isAddRemarkOpen}
                onClose={() => setIsAddRemarkOpen(false)}
                requestId={params.data.RequestID}
                userId={user_id}
                status={params.data.Status}
              />
            )}

            {/* History Button and Modal */}
            <Button
=======
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "green";
      case "pending":
        return "orange";
      case "rejected":
        return "red";
      case "completed":
      case "done":
        return "blue";
      case "in progress":
        return "purple";
      case "cancelled":
        return "gray";
      default:
        return "gray";
    }
  };

  const dateRanges = [
    { text: "Today", value: "today" },
    { text: "This Week", value: "week" },
    { text: "This Month", value: "month" },
    { text: "This Year", value: "year" },
  ];

  const columns = [
    {
      title: "Request ID",
      dataIndex: "RequestID",
      key: "RequestID",
    },
    {
      title: "Request Type",
      dataIndex: "RequestType",
      key: "RequestType",
      filters: [
        { text: "Building Maintenance", value: "Building Maintenance" },
        { text: "General Services", value: "General Services" },
        { text: "Electrical Maintenance", value: "Electrical Maintenance" },
      ],
      onFilter: (value, record) => {
        return record.RequestType?.toLowerCase() === value.toLowerCase();
      },
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
    },
    {
      title: "Location",
      dataIndex: "Location",
      key: "Location",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      filters: [
          { text: "Pending", value: "Pending" },
          { text: "Approved", value: "Approved" },
          { text: "In Progress", value: "In Progress" },
          { text: "Completed", value: "Completed" },
          { text: "Rejected", value: "Rejected" },
      ],
        onFilter: (value, record) => {
          if (value === "Rejected") {
            return (
              record.Status === "Denied" ||
              record.Status === "Cancelled" ||
              record.Status === "Rejected"
            );
            }
              return record.Status === value;
            },
        render: (status) => (
          <Tag color={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </Tag>
        ),
    },
    {
      title: "Date Requested",
      dataIndex: "DateRequested",
      key: "DateRequested",
      filters: dateRanges,
      onFilter: (value, record) => {
        const date = moment(record.DateRequested); // Assuming DateRequested is in a valid date format
        switch (value) {
          case "today":
            return date.isSame(moment(), "day");
          case "week":
            return date.isSame(moment(), "week");
          case "month":
            return date.isSame(moment(), "month");
          case "year":
            return date.isSame(moment(), "year");
          default:
            return true;
        }
      },
      render: (date) => moment(date).format("MM/DD/YYYY, hh:mm A"), // Format date for display
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        return(
        <div style={{ display: "flex", gap: "10px" }}>
          <Dialog.Root>
          <Dialog.Trigger asChild>
          <Button type="primary" onClick={() => {
                    setIsViewOpen(true);
                    setSelectedRequest(record);
                  }}>
                  View
                </Button>
            </Dialog.Trigger>
            <RequestDetailsPortal
              request_id={record.RequestID}
              onCancelRequest={handleCancelRequest}
            />
          </Dialog.Root>

          <Button
             onClick={() => {
              setIsAddRemarkOpen(true);
              setSelectedRequest(record);
            }}
            className={classes.addRemarkBtn}
          >
            Add Remark
          </Button>

          {/* History Button and Modal */}
          <Button
>>>>>>> Justine
              onClick={() => {
                setIsHistoryOpen(true);
                setSelectedRequest(record);
                markRequestAsOpened(record.RequestID);
              }}
              className={classes.historyButton}
            >
              History
            </Button>
<<<<<<< HEAD

            {isHistoryOpen &&
              selectedRequest?.RequestID === params.data.RequestID && (
                <RemarksModal
                  isOpen={isHistoryOpen}
                  onClose={() => {
                    setIsHistoryOpen(false);
                    setSelectedRequest(null);
                  }}
                  requestID={params.data.RequestID}
                />
              )}
          </div>
=======
        </div>
>>>>>>> Justine
        );
      },
    },
  ];

  const handleTabClick = (status) => {
    setActiveTab(status);
    setFilter(status);  // Set filter to the selected tab
    if (status === "all") {
      setRowData(requests);
    } else {
      setRowData(requests.filter((request) => request.status === status));
    }
  };
  

  const onFilterTextBoxChanged = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

<<<<<<< HEAD
  const transformedRequests =
    !isAdmin && Array.isArray(rowData)
      ? rowData
          .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
          .filter(
            (request) => activeTab === "all" || request.status === activeTab
          )
          .filter(
            (request) =>
              request.description.toLowerCase().includes(searchTerm) ||
              (request.request_technician &&
                request.request_technician.toLowerCase().includes(searchTerm))
          )
          .map((request) => {
            return {
              "RequestID": request.request_id,
              "Request Type": request.request_technician,
              Description: request.description,
              Location: request.request_location,
              Status: request.status,
              "Date Requested": formatDateTime(request.datetime),
            };
          })
      : [];
=======
  const transformedRequests = requests
    .filter((request) =>
      filter === "all" ? true : request.status === filter
    )
    .filter((request) =>
      request.description.toLowerCase().includes(searchTerm)
    )
    .map((request) => ({
      key: request.request_id,
      RequestID: request.request_id,
      RequestType: request.request_technician,
      Description: request.description,
      Location: request.request_location,
      Status: request.status,
      DateRequested: formatDateTime(request.datetime),
    }));
>>>>>>> Justine

  const statuses = {
    all: "All",
    Pending: "Pending",
    Approved: "Approved",
    "In Progress": "In Progress",
    Done: "Completed",
    Denied: "Rejected",
    Cancelled: "Cancelled",
  };

  return (
    <section className={isAdmin ? classes.adminHome : classes.home}>
      <div className={classes.main}>
        {isAdmin ? (
          <Dashboard />
        ) : (
          <div className={classes.homeMain}>
            <div className={classes.header}>
              <h1>My Requests</h1>
            </div>
            <div className={classes.exampleHeader}>
              <div className={classes.tabs}>
                {Object.entries(statuses).map(([key, displayValue]) => (
                  <button
                    className={`${classes.tabButton} ${
                      activeTab === key ? classes.active : ""
                    }`}
                    onClick={() => handleTabClick(key)}
                    key={key}
                  >
                    {displayValue}
                  </button>
                ))}
              </div>
<<<<<<< HEAD
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Input
                  id="filter-text-box"
                  placeholder="Search request..."
                  prefix={<SearchOutlined />}
                  onChange={onFilterTextBoxChanged} // Ant Design's Input uses onChange instead of onInput
                  style={{ width: "100%" }} // Customize width as needed
                />
              </div>
=======
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Input
                id="filter-text-box"
                placeholder="Search request..."
                prefix={<SearchOutlined />}
                onChange={onFilterTextBoxChanged}
                style={{ width: '100%' }}
              />
            </div>
>>>>>>> Justine
            </div>
            <div
              className={`${themeClass} ${classes.grid}`}
              style={{
                height: rowData && rowData.length > 0 ? "100%" : "500px", // Set height to 100% if data exists, or 300px if no data
                width: "100%",
                marginTop: "1rem",
                zIndex: 0,
                overflow: "auto",
              }}
            >
            <Table
              dataSource={transformedRequests}
              columns={columns}
              pagination={{ pageSize: 10 }}
              style={{ marginTop: "1rem", backgroundColor: "white", borderRadius: "6px" }}
            />
            </div>
          </div>
        )}
      </div>
      <ToastContainer />

       {/* Add Remark Modal */}
       {isAddRemarkOpen && (
            <AddRemarkModal
              isOpen={isAddRemarkOpen}
              onClose={() => setIsAddRemarkOpen(false)}
              requestId={selectedRequest.RequestID}
              userId = {user_id}
              status={selectedRequest.Status}
            />
          )}

        {isHistoryOpen && selectedRequest && (
          <RemarksModal
            isOpen={isHistoryOpen}
            onClose={() => {
            setIsHistoryOpen(false);
            setSelectedRequest(null);
                }}
            requestID={selectedRequest.RequestID}
            />
          )}
    </section>
  );
};

export default HomePage;

export const loader = async ({ params }) => {
  const user_id = params.user_id;
  return loadUserAndRequests(user_id);
};
