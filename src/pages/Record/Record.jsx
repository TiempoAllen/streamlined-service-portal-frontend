import React, { useState, useEffect } from "react";
import { Spin } from "antd"; // Import Ant Design Spin component
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

  const [loading, setLoading] = useState(true); // Loading state

  const [colDefs] = useState([
    { field: "RequestID", flex: 1 },
    { field: "Requestor", flex: 1 },
    {
      field: "Request Type",
      flex: 1,
      filter: "agTextColumnFilter",
    },
    {
      field: "Date Requested",
      flex: 1,
      filter: "agDateColumnFilter",
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
      filter: "agSetColumnFilter",
      filterParams: {
        values: (params) => {
          const uniqueValues = Array.from(
            new Set(params.api.getRowModel().rowsToDisplay.map((row) => row.data.Status))
          );
          params.success(uniqueValues);
        },
      },
    },
    { field: "Attachment", flex: 1 },
  ]);

  const transformedRequests = requests.map((request) => ({
    RequestID: request.request_id,
    Requestor: `${request.user_firstname} ${request.user_lastname}`,
    "Request Type": request.request_technician,
    "Date Requested": formatDateTime(request.datetime),
    Location: request.request_location,
    Status: request.status.toString(),
    Attachment:
      request.attachment && request.attachment.trim() !== ""
        ? request.attachment
        : "No Attachment",
  }));

  useEffect(() => {
    // Simulate data loading delay
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  let gridApi;

  const onGridReady = (params) => {
    gridApi = params.api;
  };

  const exportToCSV = () => {
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
      headers.join(","),
      ...filteredRows.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
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
      {loading ? ( // Display loader over the entire section
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
        <>
          <div className={classes.recordHeader}>
            <SelectArea header="Records" isRecords={true} />
            <button onClick={exportToCSV}>Export</button>
          </div>
          <div
            className="ag-theme-quartz"
            style={{
              height: "100%",
              width: "100%",
              marginTop: "1rem",
              minHeight: "50vh",
            }}
          >
            <AgGridReact
              rowData={transformedRequests}
              columnDefs={colDefs}
              rowHeight={80}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
              onGridReady={onGridReady}
            />
          </div>
        </>
      )}
    </section>
  );
};

export default Record;

export const loader = loadRequestsAndTechnicians;
