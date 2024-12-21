import React, { useState, useEffect } from "react";
import { Spin, Table, Button, Tooltip, Tag } from "antd";
import classes from "./Record.module.css";
import SelectArea from "../../components/UI/SelectArea";
import { formatDateTime, loadRequestsAndTechnicians } from "../../util/auth";
import { useLoaderData, useParams } from "react-router-dom";
import moment from "moment";


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

const Record = () => {
  const { requests } = useLoaderData();
  const { user_id } = useParams();
  const [loading, setLoading] = useState(true);

  const truncateText = (text, maxLength = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "RequestID",
      key: "RequestID",
      width: "15%",
    },
    {
      title: "Requestor",
      dataIndex: "Requestor",
      key: "Requestor",
      width: "20%",
    },
    {
      title: "Request Type",
      dataIndex: "RequestType",
      key: "RequestType",
      width: "15%",
      filters: [
        { text: "Building Maintenance", value: "Building Maintenance" },
        { text: "General Services", value: "General Services" },
        { text: "Electrical Maintenance", value: "Electrical Maintenance" },
      ],
      onFilter: (value, record) => {
        return record.RequestType.toLowerCase() === value.toLowerCase();
      },
    },
    {
      title: "Date Requested",
      dataIndex: "DateRequested",
      key: "DateRequested",
      width: "20%",
      filters: [
        { text: "Today", value: "today" },
        { text: "This Week", value: "week" },
        { text: "This Month", value: "month" },
        { text: "This Year", value: "year" },
      ],
      onFilter: (value, record) => {
        const date = moment(record.DateRequested, "MM/DD/YYYY, hh:mm A");
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
      dataIndex: "Location",
      key: "Location",
      width: "15%",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      width: "10%",
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
      title: "Attachment",
      dataIndex: "Attachment",
      key: "Attachment",
      width: "15%",
      render: (text) => (
        <Tooltip title={text}>
          {truncateText(text)}
        </Tooltip>
      ),
    },
  ];

  const transformedRequests = requests.map((request) => ({
    key: request.request_id,
    RequestID: request.request_id,
    Requestor: `${request.user_firstname} ${request.user_lastname}`,
    RequestType: request.request_technician,
    DateRequested: formatDateTime(request.datetime),
    Location: request.request_location,
    Status: request.status.toString(),
    Attachment:
      request.attachment && request.attachment.trim() !== ""
        ? request.attachment
        : "No Attachment",
  }));

  const exportToCSV = () => {
    if (!transformedRequests.length) {
      alert("No data to export!");
      return;
    }

    const headers = Object.keys(transformedRequests[0]);
    const csvRows = [
      headers.join(","),
      ...transformedRequests.map((row) =>
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={classes.record}>
      {loading ? (
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
            <Button type="primary" onClick={exportToCSV}>
              Export
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={transformedRequests}
            pagination={{ pageSize: 10 }}
            style={{ marginTop: "1rem", minHeight: "50vh", minWidth: "166vh", backgroundColor: "white", borderRadius: "6px" }}
          />
        </>
      )}
    </section>
  );
};

export default Record;

export const loader = loadRequestsAndTechnicians;
