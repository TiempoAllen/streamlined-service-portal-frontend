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

import { SearchOutlined } from '@ant-design/icons';
import RemarksModal from "../../components/UI/RemarksModal";
import AddRemarkModal from "../../components/UI/AddRemarkModal";

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


  const [colDefs] = useState([
    { field: "Request Type", headerName: "Request Type" },
    { field: "Description", headerName: "Description" },
    { field: "Location", headerName: "Location" },
    { field: "Status", headerName: "Status" },
    { field: "Date Requested", headerName: "Date Requested" },
    {
      headerName: "Actions",
      flex: 1, minWidth: 300, maxWidth: 300,
      cellRenderer: (params) => {

        const [isHistoryOpen, setIsHistoryOpen] = useState(false);
        const [isViewOpen, setIsViewOpen] = useState(false);
        const [selectedRequest, setSelectedRequest] = useState(null);
        const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);
        const [selectedRowForRemarks, setSelectedRowForRemarks] = useState(null);

        const openAddRemarkModal = () => {
          setIsAddRemarkOpen(true);
          setSelectedRequest(params.data);
        };

        return(
        <div style={{ display: "flex", gap: "10px" }}>
          <Dialog.Root>
          <Dialog.Trigger asChild>
          <Button type="primary" onClick={() => {
                    setIsViewOpen(true);
                    setSelectedRequest(params.data);
                  }}>
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
              userId = {user_id}
              status={params.data.Status}
            />
          )}

          {/* History Button and Modal */}
          <Button
              onClick={() => {
                setIsHistoryOpen(true);
                setSelectedRequest(params.data);
                markRequestAsOpened(params.data.RequestID);
              }}
              className={classes.historyButton}
            >
              History
            </Button>
  
            {isHistoryOpen && selectedRequest?.RequestID === params.data.RequestID && (
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
        );
      },
    },
  ]);

  const handleTabClick = (status) => {
    setActiveTab(status);
    if (status === "all") {
      setRowData(requests);
    } else {
      setRowData(requests.filter((request) => request.status === status));
    }
  };

  const onFilterTextBoxChanged = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

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
              RequestID: request.request_id,
              "Request Type": request.request_technician,
              Description: request.description,
              Location: request.request_location,
              Status: request.status,
              "Date Requested": formatDateTime(request.datetime),
            };
          })
      : [];

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Input
                id="filter-text-box"
                placeholder="Search request..."
                prefix={<SearchOutlined />}
                onChange={onFilterTextBoxChanged} // Ant Design's Input uses onChange instead of onInput
                style={{ width: '100%' }} // Customize width as needed
              />
            </div>
            </div>
            <div
              className={`${themeClass} ${classes.grid}`}
              style={{ height: rowData && rowData.length > 0 ? '100%' : '500px',  // Set height to 100% if data exists, or 300px if no data
                width: "100%",
                marginTop: "1rem",
                zIndex: 0,
                overflow: "auto",}}
            >
              {transformedRequests.length > 0 ? (
                <AgGridReact
                  detailRowAutoHeight
                  rowHeight={80}
                  rowData={transformedRequests}
                  columnDefs={colDefs}
                  defaultColDef={{ flex: 1, minWidth: 150 }}
                  pagination={true}
                  paginationPageSize={10}
                />
              ) : (
                <p style={{ width: "100%", textAlign: "center" }}>
                  No requests found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      

      <ToastContainer />
    </section>
  );
};

export default HomePage;

export const loader = async ({ params }) => {
  const user_id = params.user_id;
  return loadUserAndRequests(user_id);
};
