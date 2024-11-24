import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Rating } from "@mui/material";
import axios from "axios";

const EvaluationFormDialog = ({ open, onClose, requestId }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    const handleSubmit = async () => {
        try {
            await axios.post(`http://localhost:8080/requests/${requestId}/evaluate`, {
                rating,
                userFeedback: feedback,
            });
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
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleSubmit} color="primary">Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EvaluationFormDialog;
