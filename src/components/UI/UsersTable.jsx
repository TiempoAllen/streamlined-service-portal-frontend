import React, { useState, useEffect } from "react";
import {
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  Alert,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import axios from "axios";
import classes from "./UsersTable.module.css"; 
import { DEPT_DATA } from "../../pages/Register/department-data";


const UsersTable = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogMode, setDialogMode] = useState("view");
  const [openForm, setOpenForm] = useState(false);
  const [newUser, setNewUser] = useState({});
  const [users, setUsers] = useState([]);

  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/all");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenDialog = (user = {}, mode) => {
    setSelectedUser(user);
    setDialogMode(mode);
    if (mode === "edit") {
      setNewUser({
        username: user.username,
        password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        employee_id: user.employee_id,
        email: user.email,
        department: user.department,
      });
    } else if (mode === "view") {
      setNewUser(user);  
    } else {
      setNewUser({ username: '', password: '', firstname: '', lastname: '', employee_id: '', email: '', department: '' });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedUser(null);
    setOpenForm(false);
  };



  const handleDeleteUser = async () => {
    try {
      await axios.delete(`http://localhost:8080/user/${selectedUser.user_id}`);
      setUsers(users.filter((user) => user.user_id !== selectedUser.user_id));
      setSnackbarSeverity("success");
      setSnackbarMessage("User deleted successfully!");
      setSnackbarOpen(true);
      handleCloseForm();
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbarMessage("Error deleting user. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const handleEditUser = async () => {

    if (newUser.employee_id !== selectedUser.employee_id) {
      const employeeIdExists = users.some((user) => user.employee_id === newUser.employee_id);
      if (employeeIdExists) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Employee ID already exists.");
        setSnackbarOpen(true);
        return;
      }
    }

    if (newUser.password.length < 8) {
      setSnackbarSeverity("error");
     setSnackbarMessage("Password must be at least 8 characters long.");
     setSnackbarOpen(true);
     return;
   }
 
   if (!/[A-Z]/.test(newUser.password)) {
     setSnackbarSeverity("error");
     setSnackbarMessage("Password must include at least one uppercase letter.");
     setSnackbarOpen(true);
     return;
   }
 
   if (!/[a-z]/.test(newUser.password)) {
     setSnackbarSeverity("error");
     setSnackbarMessage("Password must include at least one lowercase letter.");
     setSnackbarOpen(true);
     return;
   }
 
   if (!/[!@#$%^&*(),.?":{}|<>]/.test(newUser.password)) {
     setSnackbarSeverity("error");
     setSnackbarMessage("Password must include at least one special character (e.g., !, @, #, $, %, ^, &, *).");
     setSnackbarOpen(true);
     return;
   }
 
   if (!newUser.email.endsWith("@cit.edu")) {
     setSnackbarSeverity("error");
     setSnackbarMessage("Email must end with '@cit.edu'.");
     setSnackbarOpen(true);
     return;
   }

    try {
      await axios.put(`http://localhost:8080/user/updateUser?uid=${selectedUser.user_id}`, newUser);
      const updatedUsers = users.map((user) =>
        user.user_id === selectedUser.user_id ? { ...user, ...newUser } : user
      );
      setUsers(updatedUsers);
      setSnackbarSeverity("success");
      setSnackbarMessage("User updated successfully!");
      setSnackbarOpen(true);
      handleCloseForm();
    } catch (error) {
      console.error("An error occurred while editing the user:", error);
      setSnackbarMessage("Error updating user. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const handleAddUser = async () => {
    
    if (!newUser.username || !newUser.password || !newUser.firstname || !newUser.lastname || !newUser.employee_id || !newUser.email || !newUser.department) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Please fill in all fields.");
      setSnackbarOpen(true);
      return;
    }

    if (newUser.employee_id !== selectedUser.employee_id) {
      const employeeIdExists = users.some((user) => user.employee_id === newUser.employee_id);
      if (employeeIdExists) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Employee ID already exists.");
        setSnackbarOpen(true);
        return;
      }
    }
  

    if (newUser.password.length < 8) {
       setSnackbarSeverity("error");
      setSnackbarMessage("Password must be at least 8 characters long.");
      setSnackbarOpen(true);
      return;
    }
  
    if (!/[A-Z]/.test(newUser.password)) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Password must include at least one uppercase letter.");
      setSnackbarOpen(true);
      return;
    }
  
    if (!/[a-z]/.test(newUser.password)) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Password must include at least one lowercase letter.");
      setSnackbarOpen(true);
      return;
    }
  
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newUser.password)) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Password must include at least one special character (e.g., !, @, #, $, %, ^, &, *).");
      setSnackbarOpen(true);
      return;
    }
  
    if (!newUser.email.endsWith("@cit.edu")) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Email must end with '@cit.edu'.");
      setSnackbarOpen(true);
      return;
    }
  
    try {
      // Proceed with adding the user if all validations pass
      const response = await axios.post("http://localhost:8080/user/add", newUser);
  
      if (response.data) {
        setUsers([...users, response.data]); // Add the new user to the list
        setSnackbarSeverity("success");
        setSnackbarMessage("User added successfully!");
        setSnackbarOpen(true);
        handleCloseForm();
        setNewUser({ username: '', password: '', firstname: '', lastname: '', employee_id: '', email: '', department: '' });
      } else {
        setSnackbarMessage("Error: User data is not valid.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setSnackbarMessage("An error occurred while adding the user. Please try again.");
      setSnackbarOpen(true);
    }
  };
  

  const sortedUsers = users.sort((a, b) => a.user_id - b.user_id);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>Users</h2>
        <Tooltip title="Add User">
          <IconButton
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
      <table className={classes.userstable}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Password</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.username}</td>
              <td className={classes.hidetext}>{user.password}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.employee_id}</td>
              <td>{user.email}</td>
              <td>{user.department}</td>
              <td className={classes.actions}>
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => handleOpenDialog(user, "edit")}
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
                    onClick={() => handleOpenDialog(user, "view")}
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
                    onClick={() => handleOpenDialog(user, "delete")}
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

      {/* Dialog for Adding, Viewing, Editing, and Deleting Users */}
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "edit"
            ? "Edit User"
            : dialogMode === "view"
            ? "View User"
            : dialogMode === "add"
            ? "Add User"
            : "Delete User"}
        </DialogTitle>
        <DialogContent dividers>
        {dialogMode === "view" ? (
            <div>
              <Typography variant="subtitle1"><strong>Username:</strong> {newUser.username}</Typography>
              <Typography variant="subtitle1"><strong>Password:</strong> {dialogMode === "view" ? "********" : newUser.password}</Typography>
              <Typography variant="subtitle1"><strong>First Name:</strong> {newUser.firstname}</Typography>
              <Typography variant="subtitle1"><strong>Last Name:</strong> {newUser.lastname}</Typography>
              <Typography variant="subtitle1"><strong>Employee ID:</strong> {newUser.employee_id}</Typography>
              <Typography variant="subtitle1"><strong>Email:</strong> {newUser.email}</Typography>
              <Typography variant="subtitle1"><strong>Department:</strong> {newUser.department}</Typography>
            </div>
        ) :  dialogMode !== "delete" ? (
            <>
              <TextField
                label="Username"
                fullWidth
                value={newUser.username || ""}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                margin="normal"
                disabled={dialogMode === "view"}
              />
              <TextField
                label="Password"
                fullWidth
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                margin="normal"
                type="password"
                disabled={dialogMode === "view"}
              />
              <TextField
                label="First Name"
                fullWidth
                value={newUser.firstname || ""}
                onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
                margin="normal"
                disabled={dialogMode === "view"}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={newUser.lastname || ""}
                onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
                margin="normal"
                disabled={dialogMode === "view"}
              />
              <TextField
                label="Employee ID"
                fullWidth
                value={newUser.employee_id || ""}
                onChange={(e) => setNewUser({ ...newUser, employee_id: e.target.value })}
                margin="normal"
                disabled={dialogMode === "view"}
              />
              <TextField
                label="Email"
                fullWidth
                value={newUser.email || ""}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                margin="normal"
                disabled={dialogMode === "view"}
              />
              <FormControl fullWidth margin="normal" disabled={dialogMode === "view"}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  value={newUser.department || ""}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                >
                  {DEPT_DATA.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <Typography>Are you sure you want to delete <strong>{selectedUser?.username}</strong>?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseForm} color="error">Close</Button>
          {dialogMode === "edit" && (
            <Button variant="contained" onClick={handleEditUser} color="success">Save Changes</Button>
          )}
          {dialogMode === "add" && (
            <Button variant="contained" onClick={handleAddUser} color="success">Add User</Button>
          )}
          {dialogMode === "delete" && (
            <Button  variant="contained" onClick={handleDeleteUser} color="success">Confirm</Button>
          )}
        </DialogActions>
      </Dialog>

      
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

export default UsersTable;
