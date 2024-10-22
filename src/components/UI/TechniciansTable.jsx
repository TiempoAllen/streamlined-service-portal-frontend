import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from './TechniciansTable.module.css'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, Box, Typography, Divider } from '@mui/material';

const TechniciansTable = () => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [dialogMode, setDialogMode] = useState("view");
    const [openForm, setOpenForm] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false); 
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [newTechnician, setNewTechnician] = useState({
        tech_name: '',
        tech_phone: '',
        tech_gender: '',
        tech_classification: '',
        is_available: true 
    });
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [technicianToDelete, setTechnicianToDelete] = useState(null);

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await axios.get('http://localhost:8080/technician/getAllTechnician');
                setTechnicians(response.data);
            } catch (error) {
                console.error('Error fetching technicians:', error);
            }
        };

        fetchTechnicians();
    }, []);

    const handleOpenDialog = (technician, mode) => {
        setSelectedTechnician(technician);
        setDialogMode(mode);
        if (mode === "edit") {
            setNewTechnician({
                tech_name: technician.tech_name,
                tech_phone: technician.tech_phone,
                tech_gender: technician.tech_gender,
                tech_classification: technician.tech_classification,
                is_available: technician.is_available !== undefined ? technician.is_available : true 
            });
        } else {
            setNewTechnician({ tech_name: '', tech_phone: '', tech_gender: '', tech_classification: '', is_available: true });
        }
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
    };

    const isValidPhoneNumber = (phoneNumber) => {
        const mobileRegex = /^09\d{9}$/; 
    
        return mobileRegex.test(phoneNumber);
    };

    const handleAddTechnician = async () => {
        if (!newTechnician.tech_name || !newTechnician.tech_phone) {
            alert("Please fill in all required fields.");
            return;
        }


        if (!isValidPhoneNumber(newTechnician.tech_phone)) {
            alert("Please enter a valid Philippine phone number.");
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:8080/technician/addTechnician', newTechnician);
            setTechnicians([...technicians, response.data]);
            setOpenForm(false); 
            setNewTechnician({ tech_name: '', tech_phone: '', tech_gender: '', tech_classification: '', is_available: true }); 
            setSnackbarMessage('Technician added successfully!');
            setOpenSnackbar(true); 
        } catch (error) {
            console.error('Error adding technician:', error);
        }
    };

    const handleEditTechnician = async () => {
        if (!newTechnician.tech_name || !newTechnician.tech_phone) {
            setSnackbarSeverity("error");
            setSnackbarMessage("Please fill in all required fields.");
            setOpenSnackbar(true); 
            return;
        }

        if (!isValidPhoneNumber(newTechnician.tech_phone)) {
            setSnackbarSeverity("error");
            setSnackbarMessage("Please enter a valid Philippine phone number.");
            setOpenSnackbar(true); 
            return;
        }
    
        try {
            const response = await axios.put(`http://localhost:8080/technician/updateTechnician?tid=${selectedTechnician.tech_id}`, newTechnician);
            const updatedTechnicians = technicians.map((technician) =>
                technician.tech_id === selectedTechnician.tech_id ? response.data : technician
            );
            setTechnicians(updatedTechnicians);
            setOpenForm(false); 
            setSnackbarMessage('Technician updated successfully!');
            setOpenSnackbar(true); 
        } catch (error) {
            console.error('Error editing technician:', error);
        }
    };

    const handleDeleteTechnician = async (tech_id) => {
        try {
            await axios.delete(`http://localhost:8080/technician/deleteTechnician/${tech_id}`);
            setTechnicians(technicians.filter((tech) => tech.tech_id !== tech_id));
            setSnackbarMessage('Technician deleted successfully!');
            setOpenSnackbar(true); 
        } catch (error) {
            console.error('Error deleting technician:', error);
        }
    };

    const sortedTech = technicians.sort((a, b) => a.tech_id - b.tech_id);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2>Technicians</h2>
                <Tooltip title="Add Technician">
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
            <table className={classes.technicianstable}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th>Classification</th>
                        <th>Actions</th> 
                    </tr>
                </thead>
                <tbody>
                    {sortedTech.map((technician) => (
                        <tr key={technician.tech_id}>
                            <td>{technician.tech_id}</td>
                            <td>{technician.tech_name}</td>
                            <td>{technician.tech_phone}</td>
                            <td>{technician.tech_gender}</td>
                            <td>{technician.tech_classification}</td>
                            <td className={classes.actions}>
                                <Tooltip title="Edit">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(technician, "edit")}
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
                                        color="white"
                                        className={classes.viewButton}
                                        onClick={() => handleOpenDialog(technician, "view")}
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
                                        onClick={() => {
                                            setTechnicianToDelete(technician);
                                            setOpenConfirmDialog(true);
                                        }}
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
            <Dialog open={openForm} onClose={handleCloseForm}>
                <DialogTitle>
                    {dialogMode === "edit" ? "Edit Technician" : dialogMode === "view" ? "View Technician" : "Add Technician"}
                </DialogTitle>

                <DialogContent>
        {dialogMode === "view" ? (
            <Box sx={{ padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Technician Details
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />

                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        Name
                    </Typography>
                    <Typography variant="body1">
                        {selectedTechnician?.tech_name || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        Phone#
                    </Typography>
                    <Typography variant="body1">
                        {selectedTechnician?.tech_phone || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        Gender
                    </Typography>
                    <Typography variant="body1">
                        {selectedTechnician?.tech_gender || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        Classification
                    </Typography>
                    <Typography variant="body1">
                        {selectedTechnician?.tech_classification || "N/A"}
                    </Typography>
                </Box>

            </Box>
              
                    ) : (
                        <>
                            <TextField
                                label="Name"
                                value={newTechnician.tech_name}
                                onChange={(e) => setNewTechnician({ ...newTechnician, tech_name: e.target.value })}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Phone"
                                value={newTechnician.tech_phone}
                                onChange={(e) => setNewTechnician({ ...newTechnician, tech_phone: e.target.value })}
                                fullWidth
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={newTechnician.tech_gender}
                                    onChange={(e) => setNewTechnician({ ...newTechnician, tech_gender: e.target.value })}
                                    label="Gender"
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Classification</InputLabel>
                                <Select
                                    value={newTechnician.tech_classification}
                                    onChange={(e) => setNewTechnician({ ...newTechnician, tech_classification: e.target.value })}
                                    label="Classification"
                                >
                                    <MenuItem value="Janitor">Janitor</MenuItem>
                                    <MenuItem value="Electrician">Electrician</MenuItem>
                                    <MenuItem value="Plumber">Plumber</MenuItem>
                                    <MenuItem value="Masonry">Masonry</MenuItem>
                                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                                    <MenuItem value="Carpenter">Carpenter</MenuItem>
                                    <MenuItem value="Others">Others</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button  variant="contained"onClick={handleCloseForm} color="error">
                        Cancel
                    </Button>
                    {dialogMode === "edit" ? (
                        <Button  variant="contained" onClick={handleEditTechnician} color="success">
                            Save Changes
                        </Button>
                    ) : dialogMode === "add" ? (
                        <Button variant="contained" onClick={handleAddTechnician} color="success">
                            Add
                        </Button>
                    ) : null}
                </DialogActions>
            </Dialog>
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent dividers>
                    <p>Are you sure you want to delete this technician?</p>
                    <p><strong>{technicianToDelete?.tech_name}</strong></p>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setOpenConfirmDialog(false)} color="error">
                        Cancel
                    </Button>
                    <Button variant="contained"
                        onClick={() => {
                            handleDeleteTechnician(technicianToDelete.tech_id);
                            setOpenConfirmDialog(false);
                        }}
                        color="success"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4500}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
              
                    {snackbarMessage}
                   
                </Alert>
            </Snackbar>
        </div>
    );
};

export default TechniciansTable;
