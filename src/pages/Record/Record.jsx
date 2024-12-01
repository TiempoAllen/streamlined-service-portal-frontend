import React, { useState } from "react";
import classes from "./Record.module.css";
import SelectArea from "../../components/UI/SelectArea";
import { formatDateTime, loadRequestsAndTechnicians } from "../../util/auth";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const Record = () => {
  const { requests, technicians } = useLoaderData();
  const { user_id } = useParams();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [typeFilter, setTypeFilter] = useState("");

  const [colDefs] = useState([
    { field: "RequestID", flex: 1 },
    { field: "Requestor", flex: 1 },
    { field: "Request Type", flex: 1 },
    { field: "Date Requested", flex: 1 },
    { field: "Location", flex: 1 },
    { field: "Status", flex: 1 },
    { field: "Attachment", flex: 1 },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params) => (
        <p
          className={classes.viewBtn}
          onClick={() =>
            navigate(`/home/${user_id}/record/${params.data.RequestID}`)
          }
        >
          View
        </p>
      ),
    },
  ]);

  const transformedRequests = requests.map((request) => ({
    RequestID: request.request_id,
    Requestor: `${request.user_firstname} ${request.user_lastname}`,
    "Request Type": request.request_technician,
    "Date Requested": formatDateTime(request.datetime),
    Location: request.request_location,
    Status: request.status,
    Attachment:
      request.attachment && request.attachment.trim() !== ""
        ? request.attachment
        : "No Attachment",
  }));

  // Apply filters
  const filteredRequests = transformedRequests.filter((request) => {
    const matchesStatus = statusFilter
      ? request.Status.toLowerCase() === statusFilter.toLowerCase()
      : true;
    const matchesType = typeFilter
      ? request["Request Type"].toLowerCase() === typeFilter.toLowerCase()
      : true;
    const matchesDate =
      dateFilter.from && dateFilter.to
        ? new Date(request["Date Requested"]) >= new Date(dateFilter.from) &&
          new Date(request["Date Requested"]) <= new Date(dateFilter.to)
        : true;

    return matchesStatus && matchesType && matchesDate;
  });

  console.log(filteredRequests);

  const exportToCSV = () => {
    const headers = Object.keys(transformedRequests[0]);
    const csvRows = [
      headers.join(","), // CSV Header
      ...filteredRequests.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ), // Rows
    ];

    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className={classes.record}>
      <div className={classes.recordHeader}>
        <SelectArea header="Records" isRecords={true} />
        <button onClick={exportToCSV}>Export</button> {/* Trigger CSV export */}
      </div>
      <div className={classes.filters}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Building Maintenance">Building Maintenance</option>
          <option value="Electrical Maintenance">Electrical Maintenance</option>
          <option value="General Services">General Services</option>
        </select>

        <input
          type="date"
          value={dateFilter.from}
          onChange={(e) =>
            setDateFilter((prev) => ({ ...prev, from: e.target.value }))
          }
        />
        <input
          type="date"
          value={dateFilter.to}
          onChange={(e) =>
            setDateFilter((prev) => ({ ...prev, to: e.target.value }))
          }
        />
      </div>
      <div
        className="ag-theme-quartz"
        style={{ height: "100%", width: "100%", marginTop: "1rem" }}
      >
        <AgGridReact
          rowData={filteredRequests}
          columnDefs={colDefs}
          rowHeight={80}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </section>
  );
};

export default Record;

export const loader = loadRequestsAndTechnicians;
