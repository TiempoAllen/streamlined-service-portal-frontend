  import React, { useState, useEffect } from "react";
  import classes from "./RequestsTable.module.css";
  import {
    IconButton,
    Tooltip,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Typography,
    Snackbar,
    Alert,
  } from "@mui/material";
  import EditIcon from "@mui/icons-material/Edit";
  import DeleteIcon from "@mui/icons-material/Delete";
  import VisibilityIcon from "@mui/icons-material/Visibility";
  import AddCircleIcon from "@mui/icons-material/AddCircle";
  import axios from "axios";


  const formatDateTime = (datetime) => {
    if (!datetime) return "N/A";

    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      return "Invalid Date"; 
    }

    const options = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const RequestsTable = ({ user_id , user_department}) => {  
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [dialogMode, setDialogMode] = useState("view");

    const [openForm, setOpenForm] = useState(false);
    const [formData, setFormData] = useState({
      description: "",
      datetime: "",
      status: "Pending", 
      request_location: "",
      department:user_department || "",
      attachment: null,
      request_technician: "",
      user_id: user_id || "",  
    });
    const [requests, setRequests] = useState([]);

    const technicians = [
      { id: "Janitor", name: "Janitor" },
      { id: "Electrician", name: "Electrician" },
      { id: "Plumber", name: "Plumber" },
      { id: "Carpentry", name: "Carpentry" },
      { id: "Masonry", name: "Masonry" },
      { id: "Maintenance", name: "Maintenance" },
    ];

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewFileType, setPreviewFileType] = useState('');
    const [filename, setFilename] = useState(''); // Add this line

    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:8080/request/getAllRequest");
        const validRequests = response.data.filter((request) => request != null);
        setRequests(validRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setRequests([]);
        alert("Failed to fetch requests."); 
      }
    };

    useEffect(() => {
      fetchRequests();
    }, []);

    const handleOpenDialog = (request, mode) => {
      setSelectedRequest(request);
      setDialogMode(mode);

      if (mode === "edit" || mode === "view") {
        const existingDateTime = new Date(request.datetime);
        const formattedDateTime = existingDateTime.toISOString().slice(0, 16);

        setFormData({
          description: request.description,
          datetime: formattedDateTime,
          status: request.status,
          request_location: request.request_location,
          department: request.department,
          attachment: request.attachment || null,
          request_technician: request.request_technician || "",
          user_id: request.user_id || user_id,  
        });
      } else {
        setFormData({
          description: "",
          datetime: "",
          status: "Pending",
          request_location: "",
          department: user_department || "",
          attachment: null,
          request_technician: "",
          user_id: user_id, 
        });
      }
      setOpenForm(true);
    };

    const handleCloseDialog = () => {
      setOpenForm(false);
      
    };




    const handleFormChange = (event) => {
      const { name, value, files } = event.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: files ? files[0] : value,
      }));
    };

    const handleAddRequest = async () => {
      // Check for required fields
      if (!formData.description || !formData.datetime || !formData.request_location || !formData.request_technician) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Please fill in all required fields.");
        setSnackbarOpen(true);
        return;
      }
    
      const selectedDate = new Date(formData.datetime);
      if (isNaN(selectedDate.getTime())) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Please enter a valid date and time.");
        setSnackbarOpen(true);
        return;
      }
    
      const formattedDateTime = selectedDate.toISOString().slice(0, 19);
    
    
      
    
      try {
        const requestBody = new FormData();
        requestBody.append("description", formData.description);
        requestBody.append("datetime", formattedDateTime);
        requestBody.append("request_location", formData.request_location);
        requestBody.append("department", formData.department);
        requestBody.append("request_technician", formData.request_technician);
        requestBody.append("user_id", formData.user_id);
    
        // If the attachment is provided, append it to the form data
        if (formData.attachment) {
          requestBody.append("attachment", formData.attachment);
        }
    
        const response = await axios.post("http://localhost:8080/request/add", requestBody, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
    
        if (response.data) {
          setSnackbarSeverity("success");
          setSnackbarMessage("Request added successfully!");
          setSnackbarOpen(true);
          fetchRequests();
          handleCloseDialog();
          setFormData({
            description: "",
            datetime: "",
            request_location: "",
            department: "",
            request_technician: "",
            attachment: null,
          });
        } else {
          setSnackbarSeverity("error");
          setSnackbarMessage("Error: Request data is not valid.");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error adding request:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("An error occurred while adding the request. Please try again.");
        setSnackbarOpen(true);
      }
    };
    
    
    const handleClosePreview = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewOpen(false);
    };




    const handleDeleteRequest = async () => {
      if (!requestToDelete) return;

      try {
        await axios.delete(`http://localhost:8080/request/deleteRequest/${requestToDelete}`);
        setSnackbarSeverity("success");
        setSnackbarMessage("Request deleted successfully!");
        setSnackbarOpen(true);

        setRequests((prevRequests) => prevRequests.filter((req) => req.request_id !== requestToDelete));
      } catch (error) {
        console.error("Error deleting request:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("An error occurred while deleting the request.");
        setSnackbarOpen(true);
      } finally {
        handleCloseConfirmDelete();
      }
    };
    
    const handleOpenConfirmDelete = (request_id) => {
      setRequestToDelete(request_id);
      setConfirmDeleteOpen(true);
    };

    const handleCloseConfirmDelete = () => {
      setConfirmDeleteOpen(false);
      setRequestToDelete(null);
    };
    
    

    const handleEditRequest = async () => {
      // Check for required fields
      if (!formData.description || !formData.datetime || !formData.request_location || !formData.request_technician) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Please fill in all required fields.");
        setSnackbarOpen(true);
        return;
      }
    
      const selectedDate = new Date(formData.datetime);
      if (isNaN(selectedDate.getTime())) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Please enter a valid date and time.");
        setSnackbarOpen(true);
        return;
      }
    
      const formattedDateTime = selectedDate.toISOString().slice(0, 19);
    

    
      try {
        const requestBody = new FormData();
        requestBody.append("description", formData.description);
        requestBody.append("datetime", formattedDateTime);
        requestBody.append("request_location", formData.request_location);
        requestBody.append("department", formData.department);
        requestBody.append("request_technician", formData.request_technician);
        requestBody.append("user_id", formData.user_id);
    
        // If the attachment is provided, append it to the form data
        if (formData.attachment) {
          requestBody.append("attachment", formData.attachment);
        }
    
        const response = await axios.put(
          `http://localhost:8080/request/update/${selectedRequest.request_id}`,
          requestBody,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
    
        if (response.data) {
          setSnackbarSeverity("success");
          setSnackbarMessage("Request updated successfully!");
          setSnackbarOpen(true);
          fetchRequests(); // Fetch the updated requests
          handleCloseDialog();
        } else {
          setSnackbarSeverity("error");
          setSnackbarMessage("Error: Request data is not valid.");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error editing request:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("An error occurred while updating the request. Please try again.");
        setSnackbarOpen(true);
      }
    };
    
    const handleFormSubmit = () => {
      if (dialogMode === "add") {
        handleAddRequest();
      } else if (dialogMode === "edit") {
        handleEditRequest(); 
      }
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      setFormData({ ...formData, attachment: file });
    };

    

    const openPreview = async (filename) => {
      setFilename(filename); // Store the filename
      try {
          const response = await fetch(`http://localhost:8080/request/${filename}`, {
              method: 'GET',
              headers: {
                  'Accept': 'application/pdf, image/*',
              },
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          // Fetch the response as a blob
          const blob = await response.blob();
          const contentType = response.headers.get('Content-Type');
  
          // Check if the contentType is valid before creating the object URL
          if (!contentType || !blob) {
              throw new Error("Invalid content type or empty blob received.");
          }
  
          // Create an object URL for the blob
          const url = URL.createObjectURL(blob);
  
          setPreviewUrl(url);
          setPreviewOpen(true);
          setPreviewFileType(contentType);
           // Set the file type
      } catch (error) {
          console.error("Error opening the attachment preview:", error);
          setSnackbarSeverity("error");
          setSnackbarMessage("An error occurred while opening the attachment preview.");
          setSnackbarOpen(true);
      }
  };
  
  


   /*const downloadAttachment = async (filename) => {
      try {
        const response = await axios.get(`http://localhost:8080/attachment/${filename}`, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading attachment:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("An error occurred while downloading the attachment.");
        setSnackbarOpen(true);
      }
    };  */

    const sortedRequests = requests.sort((a, b) => a.request_id - b.request_id);

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>Requests</h2>
          <Tooltip title="Add Requests">
            <IconButton
              color="white"
              className={classes.addButton}
              onClick={() => handleOpenDialog({}, "add")}
              sx={{
                color: "#631C21",
                "&:hover": {
                  backgroundColor: "#9a212d",
                },
              }}
            >
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
        </div>

        <table className={classes.requestsTable}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Purpose</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Location</th>
              <th>Department</th>
              <th>Technician</th>
              <th>Attachment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((request) => (
              <tr key={request.request_id}>
                <td>{request.request_id}</td>
                <td>{request.description|| "N/A"}</td>
                <td>{formatDateTime(request.datetime) || "N/A"}</td>
                <td>{request.status || "N/A"}</td>
                <td>{request.request_location || "N/A"}</td>
                <td>{request.department || "N/A"}</td>
                <td>{request.request_technician || "N/A"}</td>
                <td>
                {request.attachment ? (
                  <div>
                    <Button onClick={() => openPreview(request.attachment)}>Preview</Button>
                   {/*<Button onClick={() => downloadAttachment(request.attachment)}>Download</Button> */}
                  </div>
                ) : (
                  "No Attachment"
                )}
              </td>
                <td className={classes.actions}>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => handleOpenDialog(request, "edit")}
                      sx={{
                        color: "#28a745",
                        "&:hover": {
                          backgroundColor: "#218838",
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View">
                    <IconButton
                      onClick={() => handleOpenDialog(request, "view")}
                      sx={{
                        color: "#17a2b8",
                        "&:hover": {
                          backgroundColor: "#138496",
                        },
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                    onClick={() => handleOpenConfirmDelete(request.request_id)}
                      sx={{
                        color: "#dc3545",
                        "&:hover": {
                          backgroundColor: "#9a212d",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Dialog open={openForm} onClose={handleCloseDialog} fullWidth maxWidth="md">
    <DialogTitle>
      {dialogMode === "edit" ? "Edit Request" : dialogMode === "view" ? "View Request" : "Add Request"}
    </DialogTitle>
    <DialogContent>
      <TextField
        label="Purpose"
        name="description"
        value={formData.description}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        required
        InputProps={{
          readOnly: dialogMode === "view",
        }}
      />
      <TextField
        label="Date & Time"
        name="datetime"
        type="datetime-local"
        value={formData.datetime}
        onChange={handleFormChange}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          readOnly: dialogMode === "view",
        }}
      />
      <TextField
        label="Location"
        name="request_location"
        value={formData.request_location}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        required
        InputProps={{
          readOnly: dialogMode === "view",
        }}
      />
      <FormControl fullWidth margin="normal" required disabled={dialogMode === "view"}>
        <InputLabel>Technician</InputLabel>
        <Select
          name="request_technician"
          value={formData.request_technician}
          onChange={handleFormChange}
        >
          {technicians.map((tech) => (
            <MenuItem key={tech.id} value={tech.name}>
              {tech.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {dialogMode !== "view" && (
                <input
                    accept="*/*" // Accept all file types
                    type="file"
                    onChange={handleFileChange}
                    style={{ marginTop: "1rem" }}
                />
            )}
      {/* User ID (Read-Only) */}
      <TextField
        label="User ID"
        name="user_id"
        value={formData.user_id}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
      />
    </DialogContent>

    <DialogActions>
    <Button variant="contained" color="error" onClick={handleCloseDialog}>Cancel</Button>
    
    {dialogMode !== "view" && (
      <Button variant="contained" onClick={handleFormSubmit} color="success">
        {dialogMode === "add" ? "Add Request" : "Update Request"}
      </Button>
    )}
  </DialogActions>

        </Dialog>

        <Dialog
      open={confirmDeleteOpen}
      onClose={handleCloseConfirmDelete}
      aria-labelledby="confirm-delete-dialog"
    >
      <DialogTitle id="confirm-delete-dialog">Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this request?</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleCloseConfirmDelete} color="error">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleDeleteRequest} color="success">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>

    {previewOpen && (
    <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <DialogContent>
            {previewFileType?.includes('application/pdf') ? (
                <iframe
                    src={previewUrl}
                    width="800px"
                    height="900px"
                    title={`Preview of ${filename}`}
                />
            ) : previewFileType?.startsWith('image/') ? ( // Use startsWith for image type check
                <img
                    src={previewUrl}
                    alt={`Preview of ${filename}`}
                    style={{ width: '100%', height: 'auto' }}
                />
            ) : (
                <p>Unsupported file type.</p>
            )}
        </DialogContent>
        <DialogActions>
        <Button variant="contained" onClick={handleClosePreview} color="error">
          Close
        </Button>
        </DialogActions>
    </Dialog>
)}


        <Snackbar
    open={snackbarOpen}
    autoHideDuration={4500}
    onClose={() => setSnackbarOpen(false)}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert
      onClose={() => setSnackbarOpen(false)}
      severity={snackbarSeverity} 
      sx={{ width: '100%' }}
    >
      {snackbarMessage}
    </Alert>
  </Snackbar>
      </div>
    );
  };

  export default RequestsTable;
