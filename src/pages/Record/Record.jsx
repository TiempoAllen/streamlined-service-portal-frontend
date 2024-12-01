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

  const [colDefs] = useState([
    { field: "RequestID", flex: 1 },
    { field: "Requestor", flex: 1 },
    {
      field: "Request Type",
      flex: 1,
      filter: "agTextColumnFilter", // Enable Text Filter for Request Type
    },
    {
      field: "Date Requested",
      flex: 1,
      filter: "agDateColumnFilter", // Enable Date Filter
      filterParams: {
        comparator: (filterDate, cellValue) => {
          const cellDate = new Date(cellValue);
          if (cellDate < filterDate) return -1;
          if (cellDate > filterDate) return 1;
          return 0;
        },
        browserDatePicker: true,
      },
    },
    { field: "Location", flex: 1 },
    {
      field: "Status",
      flex: 1,
      filter: "agTextColumnFilter", // Enable Text Filter for Status
    },
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

  let gridApi;

  const onGridReady = (params) => {
    gridApi = params.api; // Store the API reference for later use
  };

  const exportToCSV = () => {
    // Get the current filtered rows
    const filteredRows = [];
    gridApi.forEachNodeAfterFilter((node) => {
      filteredRows.push(node.data);
    });

    if (filteredRows.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = Object.keys(filteredRows[0]);
    const csvRows = [
      headers.join(","), // CSV Header
      ...filteredRows.map((row) =>
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
        <button onClick={exportToCSV}>Export</button>
      </div>
      <div
        className="ag-theme-quartz"
        style={{ height: "100%", width: "100%", marginTop: "1rem" }}
      >
        <AgGridReact
          rowData={transformedRequests}
          columnDefs={colDefs}
          rowHeight={80}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
          onGridReady={onGridReady} // Bind the onGridReady callback
        />
      </div>
    </section>
  );
};

export default Record;

export const loader = loadRequestsAndTechnicians;
