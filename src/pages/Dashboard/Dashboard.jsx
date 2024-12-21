import React, { useState, useEffect } from "react";
import classes from "./Dashboard.module.css";
import "react-calendar/dist/Calendar.css";
import { Table, Tag, Modal, Button, Spin } from "antd";
import totalReq from "../../assets/Total Req.svg";
import newReq from "../../assets/New Req.svg";
import openReq from "../../assets/Open Req.svg";
import closedReq from "../../assets/Closed Req.svg";
import axios from "axios";
import RequestDetailsPortal from "../../components/UI/RequestDetailsPortal"; 


const { Column } = Table;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Dashboard = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [date, setDate] = useState(new Date());
  const [request, setRequest] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRequestDetailsModalVisible, setIsRequestDetailsModalVisible] =
    useState(false);
  const [isFilteredRequestsModalVisible, setIsFilteredRequestsModalVisible] =
    useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestorDepartment, setRequestorDepartment] = useState(null);



  const onChange = (newDate) => {
    setDate(newDate);
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "No Date Provided";
    const date = new Date(datetime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "numeric", 
      hour12: true 
    })}`;
  };
  

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axios.get(`${API_URL}/request/getAllRequest`);
        const data = response.data
          .map((req) => ({
            ...req,
            status: req.status || "Unknown",
          }))
          .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)); // Sort by datetime in descending order
        setRequest(data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load requests");
        setIsLoading(false);
      }
    };
    fetchRequest();
  }, []);
  

  // Calculate the counts for new, open, and closed requests
  const newRequestsCount = request.filter(
    (req) => req.status === "Pending"
  ).length;

  const openRequestsCount = request.filter((req) =>
    ["Approved", "Assigned", "In Progress"].includes(req.status)
  ).length;

  const closedRequestsCount = request.filter((req) =>
    ["Completed", "Rejected", "Cancelled", "Denied"].includes(req.status)
  ).length;

  const handleCardClick = (type) => {
    let filtered;
    let title;

    switch (type) {
      case "NEW":
        filtered = request.filter((req) => req.status === "Pending");
        title = "New Requests";
        break;
      case "OPEN":
        filtered = request.filter((req) =>
          ["Approved", "Assigned", "In Progress"].includes(req.status)
        );
        title = "Open Requests";
        break;
      case "CLOSED":
        filtered = request.filter((req) =>
          ["Completed", "Rejected", "Cancelled", "Denied"].includes(req.status)
        );
        title = "Closed Requests";
        break;
      default:
        filtered = request;
        title = "All Requests";
        break;
    }

    setFilteredRequests(filtered);
    setModalTitle(title);
    setIsFilteredRequestsModalVisible(true);
  };

  const getStatusColor = (status) => {
    if (!status) return "gray";
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
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

  const fetchRequestorDepartment = async (user_id) => {
    try {
      const response = await axios.get(`${API_URL}/user/${user_id}`);
      setRequestorDepartment(response.data.department || "Unknown");
    } catch (error) {
      console.error("Failed to fetch requestor department:", error);
      setRequestorDepartment("Unknown");
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const showRequestDetails = (record) => {
    setSelectedRequest(record);
    fetchRequestorDepartment(record.user_id); // Assuming `user_id` is part of the request data
    setIsRequestDetailsModalVisible(true);
  };  

  const handleRequestDetailsModalClose = () => {
    setIsRequestDetailsModalVisible(false);
  };

  const handleFilteredRequestsModalClose = () => {
    setIsFilteredRequestsModalVisible(false);
  };

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <p>{error}</p>;
  }


  const fetchAttachment = async (attachment) => {
    try {
      setLoading(true);
      // Perform the fetching logic here
      window.open(attachment, "_blank"); // Example: Open the attachment
    } catch (error) {
      console.error("Failed to fetch the attachment:", error);
    } finally {
      setLoading(false);
    }
  };


  console.log("ID: ", requestorDepartment);

  return (
    <section className={classes.main}>
      {/* CardBox for statistics */}
      <section className={classes.cardBox}>
        {/* Total Requests Card */}
        <div className={classes.card} onClick={() => handleCardClick("ALL")}>
          <div>
            <div className={classes.requestsNumber}>{request.length}</div>
            <div className={classes.name}>Total Requests</div>
          </div>
          <div className={classes.icon}>
            <img src={totalReq} alt="Total Requests" />
          </div>
        </div>

        {/* New Requests Card */}
        <div className={classes.card} onClick={() => handleCardClick("NEW")}>
          <div>
            <div className={classes.requestsNumber}>{newRequestsCount}</div>
            <div className={classes.name}>New Requests</div>
          </div>
          <div className={classes.icon}>
            <img src={newReq} alt="New Requests" />
          </div>
        </div>

        {/* Open Requests Card */}
        <div className={classes.card} onClick={() => handleCardClick("OPEN")}>
          <div>
            <div className={classes.requestsNumber}>{openRequestsCount}</div>
            <div className={classes.name}>Open Requests</div>
          </div>
          <div className={classes.icon}>
            <img src={openReq} alt="Open Requests" />
          </div>
        </div>

        {/* Closed Requests Card */}
        <div className={classes.card} onClick={() => handleCardClick("CLOSED")}>
          <div>
            <div className={classes.requestsNumber}>{closedRequestsCount}</div>
            <div className={classes.name}>Closed Requests</div>
          </div>
          <div className={classes.icon}>
            <img src={closedReq} alt="Closed Requests" />
          </div>
        </div>
      </section>

      {/* Recent Requests Table */}
      <section className={classes.details}>
        <div className={classes.tableDashboard}>
          <div className={classes.cardHeader}>
            <h2>Recent Requests</h2>
          </div>
          <Table
            dataSource={request}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: request.length,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
            onChange={handleTableChange}
            showSorterTooltip={{
              target: "sorter-icon",
            }}
            onRow={(record) => ({
              onClick: () => showRequestDetails(record),
            })}
          >
            <Column
              title="Requestor"
              key="requestor"
              render={(_, record) =>
                `${record.user_firstname} ${record.user_lastname}`
              }
            />

            <Column
              title="Date & Time"
              dataIndex="datetime"
              key="datetime"
              render={(datetime) => formatDateTime(datetime)}
              sorter={(a, b) => new Date(b.datetime) - new Date(a.datetime)}
            />
            <Column
              title="Location"
              dataIndex="request_location"
              key="request_location"
            />
            <Column title="Description" dataIndex="description" key="description" />
            <Column
              title="Status"
              dataIndex="status"
              key="status"
              filters={[
                { text: "Pending", value: "Pending" },
                { text: "Approved", value: "Approved" },
                { text: "In Progress", value: "In Progress" },
                { text: "Completed", value: "Completed" },
                { text: "Rejected", value: "Rejected"  },
              ]}
              
              onFilter={(value, record) => {
                // If 'Rejected' or 'Cancelled' is selected, include both values
                if (value === 'Rejected') {
                  return record.status === 'Denied' || record.status === 'Cancelled' || record.status === 'Rejected';
                }
                return record.status === value;
              }}
              render={(status) => (
                <Tag color={getStatusColor(status)}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase()}
                </Tag>
              )}
            />
          </Table>
        </div>
      </section>

      {/* Modal for Request Details */}
      {selectedRequest && (
         <Modal
         title={
           <div style={{
             display: "flex",
             justifyContent: "space-between",
             alignItems: "center",
             padding: "10px",
           }}>
             <h3>Request Details</h3>
             <span style={{
              fontSize: "12px",
              color: "#fff",
              border: "1px solid grey",
              backgroundColor: "grey",
              padding: "2px 4px",
              borderRadius: "6px",
              marginRight: 250,
              marginTop: -5
            }}>
              ID #{selectedRequest?.request_id}
            </span>
           </div>
         }
         open={isRequestDetailsModalVisible}
         onCancel={handleRequestDetailsModalClose}
         footer={[
           <Button key="close" onClick={handleRequestDetailsModalClose}>
             Close
           </Button>,
         ]}
       >
         <div style={{ padding: "10px" }}>
           {/* Detailed Request Information */}
           <section style={{ marginBottom: "20px" }}>
             <h4>Detailed Request Information</h4>
             <div
               style={{
                 display: "grid",
                 gridTemplateColumns: "150px 1fr",
                 gap: "10px",
               }}
             >
               <p style={{ fontWeight: "400" }}>Request Type:</p>
               <p>{selectedRequest?.request_technician}</p>
   
               <p style={{ fontWeight: "400" }}>Description:</p>
               <p>{selectedRequest?.description}</p>
   
               <p style={{ fontWeight: "400"}}>Attachment:</p>
               {selectedRequest?.attachment ? (
                 <Button
                   type="link"
                   onClick={() => fetchAttachment(selectedRequest.attachment)}
                   style={{ padding: 0, marginRight: 175, marginTop: -5  }}
                   disabled={loading}
                 >
                   {loading ? "Loading..." : "Preview Attachment"}
                 </Button>
               ) : (
                 <p>No attachment</p>
               )}
   
               <p style={{ fontWeight: "400" }}>Location:</p>
               <p>{selectedRequest?.request_location}</p>
   
               <p style={{ fontWeight: "400" }}>Date:</p>
               <p>{
                 selectedRequest?.datetime
                   ? formatDateTime(selectedRequest.datetime)
                   : "No Date Provided"
               }</p>
             </div>
           </section>
   
           {/* Requester Information */}
           <section style={{ marginBottom: "20px" }}>
             <h4>Requester Information</h4>
             <div
               style={{
                 display: "grid",
                 gridTemplateColumns: "150px 1fr",
                 gap: "10px",
               }}
             >
               <p style={{ fontWeight: "400" }}>Name:</p>
               <p>
                 {selectedRequest?.user_firstname} {selectedRequest?.user_lastname}
               </p>
   
               <p style={{ fontWeight: "400" }}>Department:</p>
               <p>{requestorDepartment || "Null"}</p>
             </div>
           </section>
   
           {/* Status Information */}
           <section style={{ marginBottom: "20px" }}>
             <h4>Status Information</h4>
             <div
               style={{
                 display: "grid",
                 gridTemplateColumns: "150px 1fr",
                 gap: "10px",
               }}
             >
               <p style={{ fontWeight: "400" }}>Current Status:</p>
               <p>
                <Tag color={getStatusColor(selectedRequest?.status)}>
                  {selectedRequest?.status}
                </Tag>
               </p>
   
               {[
                 "Assigned",
                 "In Progress",
                 "Done",
               ].includes(selectedRequest?.status) && (
                 <>
                   <p style={{ fontWeight: "400" }}>Scheduled Date and Time:</p>
                   <p>{
                     selectedRequest?.scheduledStartDate
                       ? formatDateTime(selectedRequest.scheduledStartDate)
                       : "No Scheduled Date"
                   }</p>
                 </>
               )}
   
               {selectedRequest?.status === "Denied" && (
                 <>
                   <p style={{ fontWeight: "400" }}>Remarks/Comments:</p>
                   <p>{selectedRequest?.denialReason}</p>
                 </>
               )}
             </div>
           </section>
   
           {/* Personnel Information */}
           {["In Progress", "Done"].includes(selectedRequest?.status) && (
             <section style={{ marginBottom: "20px" }}>
               <h4>Personnel Information</h4>
               <div
                 style={{
                   display: "grid",
                   gridTemplateColumns: "150px 1fr",
                   gap: "10px",
                 }}
               >
                 <p style={{ fontWeight: "400" }}>Assigned Personnel:</p>
                 <p>Jake Doe</p>
   
                 <p style={{ fontWeight: "400" }}>Personnel Type:</p>
                 <p>Janitor</p>
               </div>
             </section>
           )}
         </div>
       </Modal>
      )}

      {/* Modal for Filtered Requests */}
      <Modal
        title={modalTitle}
        open={isFilteredRequestsModalVisible}
        onCancel={handleFilteredRequestsModalClose}
        footer={[
          <Button key="close" onClick={handleFilteredRequestsModalClose}>
            Close
          </Button>,
        ]}
        width="80%" // Adjust width dynamically (e.g., 80% of the viewport)
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <Table
          dataSource={filteredRequests}
          rowKey="id"
          className={classes.modalTable}
          pagination={{
            pageSize: 6, // Set the maximum number of rows per page
          }}
          onRow={(record) => ({
            onClick: () => showRequestDetails(record),
          })}
        >
          <Column
            title="Requestor"
            key="requestor"
            render={(_, record) =>
              `${record.user_firstname} ${record.user_lastname}`
            }
          />
          <Column
            title="Date & Time"
            dataIndex="datetime"
            key="datetime"
            render={(datetime) => formatDateTime(datetime)}
            sorter={(a, b) => new Date(b.datetime) - new Date(a.datetime)}
          />
          <Column
            title="Location"
            dataIndex="request_location"
            key="request_location"
          />
          <Column
            title="Status"
            dataIndex="status"
            key="status"
            filters={[
              { text: "Pending", value: "Pending" },
              { text: "Approved", value: "Approved" },
              { text: "In Progress", value: "In Progress" },
              { text: "Completed", value: "Completed" },
              { text: "Rejected", value: "Rejected"  },
            ]}
            
            onFilter={(value, record) => {
              // If 'Rejected' or 'Cancelled' is selected, include both values
              if (value === 'Rejected') {
                return record.status === 'Denied' || record.status === 'Cancelled' || record.status === 'Rejected';
              }
              return record.status === value;
            }}
            render={(status) => (
              <Tag color={getStatusColor(status)}>{status}</Tag>
            )}
          />
        </Table>
      </Modal>
    </section>
  );
};

export default Dashboard;
