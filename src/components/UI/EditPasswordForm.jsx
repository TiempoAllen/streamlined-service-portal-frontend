import React from "react";
import classes from "./EditPasswordForm.module.css";

const EditPasswordForm = ({onClose}) => {
    return(
        <div className={classes.main}>
            <div className={classes.content}>
                <input placeholder="Old Password" required/>
                <input placeholder="New Password" required/>
                <input placeholder="Confirm Password" required/>
                    <div className={classes.rowButton}>
                        <button onClick={onClose} className={classes.saveButton}>
                        Save
                        </button>
                        <button onClick={onClose} className={classes.closeButton}>
                        Close
                        </button>
                    </div>
            </div>
        </div>
    );
};

export default EditPasswordForm;
