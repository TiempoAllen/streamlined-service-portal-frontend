    import React, { useState } from "react";
    import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Rating } from "@mui/material";
    import axios from "axios";

    const EvaluationFormDialog = ({ open, onClose, requestId }) => {
        const [rating, setRating] = useState(0);
        const [feedback, setFeedback] = useState("");


        console.log(requestId);
        const handleSubmit = async () => {
            if (!requestId) {
                console.error("Request object is missing or invalid.");
                alert("Failed to submit evaluation: Invalid request data.");
                return;
            }
            console.log("Sending Evaluation:", { rating, userFeedback: feedback });

            try {
                await axios.put(`http://localhost:8080/request/submit-evaluation/${requestId}`, {
                    rating: rating,
                    userFeedback: feedback,
                }, { headers: { 'Content-Type': 'application/json' } });
                alert("Evaluation submitted successfully!");
                onClose();
            } catch (error) {
                console.error("Error submitting evaluation:", error);
                alert("Failed to submit evaluation.");
            }
        };

        return (
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>Personnel Performance Evaluation</DialogTitle>
                <DialogContent>
                    <Rating
                        value={rating}
                        onChange={(e, newValue) => setRating(newValue)}
                        size="large"
                        precision={1}
                    />
                    <TextField
                        label="Feedback"
                        multiline
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                    onClick={onClose} 
                    color="secondary" 
                    sx={{ backgroundColor: '#ff5722', color: "#FFF",'&:hover': { backgroundColor: '#e64a19' } }}>
                    Cancel
                    </Button>
                    <Button 
                    onClick={handleSubmit} 
                    color="primary" 
                    sx={{ backgroundColor: '#4caf50', color: "#FFF",'&:hover': { backgroundColor: '#388e3c' } }}>
                    Submit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    export default EvaluationFormDialog;
