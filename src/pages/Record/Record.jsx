import React, { useState, useEffect } from "react";
import { Table, Spin, Button } from "antd";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import SelectArea from "../../components/UI/SelectArea";
import classes from "./Record.module.css";
import { formatDateTime, loadRequestsAndTechnicians } from "../../util/auth";

const Record = () => {
  const { requests, technicians } = useLoaderData();
  const { user_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    {
      title: "Request ID",
      dataIndex: "RequestID",
      key: "RequestID",
      sorter: (a, b) => a.RequestID.localeCompare(b.RequestID),
    },
    {
      title: "Requestor",
      dataIndex: "Requestor",
      key: "Requestor",
      sorter: (a, b) => a.Requestor.localeCompare(b.Requestor),
    },
    {
      title: "Request Type",
      dataIndex: "RequestType",
      key: "RequestType",
      filters: Array.from(
        new Set(transformedRequests.map((item) => item.RequestType))
      ).map((type) => ({ text: type, value: type })),
      onFilter: (value, record) => record.RequestType === value,
    },
    {
      title: "Date Requested",
      dataIndex: "DateRequested",
      key: "DateRequested",
      sorter: (a, b) => new Date(a.DateRequested) - new Date(b.DateRequested),
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
      filters: Array.from(
        new Set(transformedRequests.map((item) => item.Status))
      ).map((status) => ({ text: status, value: status })),
      onFilter: (value, record) => record.Status === value,
    },
  ];

  const exportToCSV = () => {
    const csvRows = [
      Object.keys(transformedRequests[0]).join(","),
      ...transformedRequests.map((row) =>
        Object.values(row).map((value) => `"${value || ""}"`).join(",")
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
            <Button onClick={exportToCSV}>Export</Button>
          </div>
          <Table
            columns={columns}
            dataSource={transformedRequests}
            pagination={{ pageSize: 10 }}
            
            style={{ marginTop: "1rem", width: "100%", height: "100%"}}
          />
        </>
      )}
    </section>
  );
};

export default Record;

export const loader = loadRequestsAndTechnicians;
