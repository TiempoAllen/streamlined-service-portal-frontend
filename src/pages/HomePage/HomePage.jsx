import React, { useState } from "react";
import classes from "./HomePage.module.css";
import { useRouteLoaderData } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import { loadUserAndRequests } from "../../util/auth";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import * as Dialog from "@radix-ui/react-dialog";
import RequestDetailsPortal from "../../components/UI/RequestDetailsPortal";

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
  const { user, requests } = useRouteLoaderData("home");
  const isAdmin = user && user.isadmin;
  const [activeTab, setActiveTab] = useState("all");
  const themeClass = "ag-theme-quartz";
  const [searchTerm, setSearchTerm] = useState("");

  const sortedRequests = requests.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const [colDefs] = useState([
    { field: "RequestID", flex: 1 },
    { field: "Title", headerName: "Title" },
    { field: "Description", headerName: "Description" },
    { field: "Technician Requested", headerName: "Technician Requested" },
    { field: "Status", headerName: "Status" },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params) => (
        <div>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <p className={classes.viewBtn}>View</p>
            </Dialog.Trigger>
            <RequestDetailsPortal request_id={params.data.RequestID} />
          </Dialog.Root>
        </div>
      ),
    },
  ]);

  const handleTabClick = (status) => {
    setActiveTab(status);
  };

  const onFilterTextBoxChanged = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const transformedRequests = sortedRequests
    .filter((request) => activeTab === "all" || request.status === activeTab)
    .filter(
      (request) =>
        request.title.toLowerCase().includes(searchTerm) ||
        request.description.toLowerCase().includes(searchTerm) ||
        (request.request_technician &&
          request.request_technician.toLowerCase().includes(searchTerm))
    )
    .map((request) => {
      return {
        RequestID: request.request_id,
        Title: request.title,
        Description: request.description,
        "Technician Requested": request.request_technician,
        Status: request.status,
      };
    });

  const statuses = {
    all: "All",
    Pending: "Pending",
    Approved: "Approved",
    Done: "Done",
    Rejected: "Rejected",
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
              <button>See all</button>
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
              <div className={classes.inputWrapper}>
                <svg
                  className={classes.searchIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.5014 7.00039C11.5014 7.59133 11.385 8.1765 11.1588 8.72246C10.9327 9.26843 10.6012 9.7645 10.1833 10.1824C9.76548 10.6002 9.2694 10.9317 8.72344 11.1578C8.17747 11.384 7.59231 11.5004 7.00136 11.5004C6.41041 11.5004 5.82525 11.384 5.27929 11.1578C4.73332 10.9317 4.23725 10.6002 3.81938 10.1824C3.40152 9.7645 3.07005 9.26843 2.8439 8.72246C2.61776 8.1765 2.50136 7.59133 2.50136 7.00039C2.50136 5.80691 2.97547 4.66232 3.81938 3.81841C4.6633 2.97449 5.80789 2.50039 7.00136 2.50039C8.19484 2.50039 9.33943 2.97449 10.1833 3.81841C11.0273 4.66232 11.5014 5.80691 11.5014 7.00039ZM10.6814 11.7404C9.47574 12.6764 7.95873 13.1177 6.43916 12.9745C4.91959 12.8314 3.51171 12.1145 2.50211 10.9698C1.49252 9.8251 0.957113 8.33868 1.0049 6.81314C1.05268 5.28759 1.68006 3.83759 2.75932 2.75834C3.83857 1.67908 5.28856 1.0517 6.81411 1.00392C8.33966 0.956136 9.82608 1.49154 10.9708 2.50114C12.1154 3.51073 12.8323 4.91862 12.9755 6.43819C13.1187 7.95775 12.6773 9.47476 11.7414 10.6804L14.5314 13.4704C14.605 13.539 14.6642 13.6218 14.7051 13.7138C14.7461 13.8058 14.7682 13.9052 14.77 14.0059C14.7717 14.1066 14.7532 14.2066 14.7155 14.3C14.6778 14.3934 14.6216 14.4782 14.5504 14.5494C14.4792 14.6206 14.3943 14.6768 14.301 14.7145C14.2076 14.7522 14.1075 14.7708 14.0068 14.769C13.9061 14.7672 13.8068 14.7452 13.7148 14.7042C13.6228 14.6632 13.54 14.6041 13.4714 14.5304L10.6814 11.7404Z"
                    fill="currentColor"
                  />
                </svg>

                <input
                  type="text"
                  id="filter-text-box"
                  placeholder="Search request..."
                  onInput={onFilterTextBoxChanged}
                />
              </div>
            </div>
            <div
              className={`${themeClass} ${classes.grid}`}
              style={{ height: "100%", width: "100%" }}
            >
              <div className={classes.grid}>
                <AgGridReact
                  detailRowAutoHeight
                  rowHeight={80}
                  rowData={transformedRequests}
                  columnDefs={colDefs}
                  defaultColDef={{ flex: 1, minWidth: 150 }}
                  pagination={true}
                  paginationPageSize={10}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePage;

export const loader = async ({ params }) => {
  const user_id = params.user_id;
  return loadUserAndRequests(user_id);
};
