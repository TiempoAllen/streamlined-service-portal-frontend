import React, { useState } from "react";
import { json, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";

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

const History = () => {
  const requests = useLoaderData();
  const navigate = useNavigate();
  const { user_id } = useParams();
  console.log(requests);

  const sortedRequests = requests.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const [colDefs] = useState([
    { field: "RequestID", flex: 1 },
    { field: "Title", headerName: "Title" },
    { field: "Technician Requested", headerName: "Technician Requested" },
    { field: "Date Requested", headerName: "Date Requested" },
    { field: "Location", headerName: "Location" },
    { field: "Department", headerName: "Department" },
    { field: "Attachment", headerName: "Attachment" },
    { field: "Status", headerName: "Status" },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params) => (
        <p
          style={{ cursor: "pointer", color: "blue" }}
          onClick={() =>
            navigate(`/home/${user_id}/history/${params.data.RequestID}`)
          }
        >
          View
        </p>
      ),
    },
  ]);

  const transformedRequests = sortedRequests.map((request) => {
    return {
      RequestID: request.request_id,
      Title: request.title,
      "Technician Requested": request.request_technician,
      "Date Requested": formatDateTime(request.datetime),
      Location: request.request_location,
      Department: request.department,
      Attachment:
        request.attachment && request.attachment.trim() !== ""
          ? request.attachment
          : "No Attachment",
      Status: request.status,
    };
  });

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        rowData={transformedRequests}
        columnDefs={colDefs}
        defaultColDef={{ flex: 1, minWidth: 150 }}
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
};

export default History;

export async function loader({ request, params }) {
  const user_id = params.user_id;
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(
      `http://localhost:8080/request/getAllRequest`,
      {
        // Uncomment the Authorization header if needed
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      }
    );

    const requests = response.data;

    if (!requests) {
      throw json({ message: "Requests not found" }, { status: 500 });
    }

    // Filter the requests by user_id
    const filteredRequests = requests.filter(
      (req) => req.user_id === parseInt(user_id)
    );

    return filteredRequests;
  } catch (error) {
    throw new Error(`Error fetching requests details: ${error.message}`);
  }
}
