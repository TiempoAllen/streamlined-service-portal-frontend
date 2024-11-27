import React, { useRef, useState, useEffect } from "react";
import classes from "../RequestPage/RequestPage.module.css";
import {
  Form,
  json,
  redirect,
  useRouteLoaderData,
  useActionData,
  useNavigate,
  useNavigation,
  useLocation,
} from "react-router-dom";
import uploadIcon from "../../assets/upload-icon.svg";
import deleteIcon from "../../assets/delete-button.svg";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import Viewer from "react-viewer"; // Import react-viewer
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LOCAL_ENV } from "../../util/auth";

const ResubmitForm = () => {
  const user = useRouteLoaderData("home");
  const [file, setFile] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false); // State to control viewer visibility

  const fileInputRef = useRef();
  const formRef = useRef();
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const requestDetails = location.state?.request;

  const isSubmitting = navigation.state === "submitting";

  const handleDeleteFile = () => {
    setFile(null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const openViewer = () => {
    setViewerVisible(true); // Show the viewer when the file is clicked
  };

  const closeViewer = () => {
    setViewerVisible(false); // Hide the viewer
  };

  const determineMimeType = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const mimeTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      // Add more file extensions and their MIME types as needed
    };

    return mimeTypes[extension] || "application/octet-stream"; // Default MIME type
  };

  useEffect(() => {
    if (requestDetails) {
      formRef.current.title.value = requestDetails.title;
      formRef.current.description.value = requestDetails.description;
      formRef.current.request_location.value = requestDetails.request_location;
      formRef.current.request_technician.value =
        requestDetails.request_technician;
      formRef.current.urgencyLevel.value = requestDetails.urgencyLevel;

      const preferredStartDate = new Date(requestDetails.preferredStartDate);
      const formattedPreferredStartDate = preferredStartDate
        .toISOString()
        .slice(0, 16);

      formRef.current.preferredStartDate.value = formattedPreferredStartDate;

      const preferredEndDate = new Date(requestDetails.preferredEndDate);
      const formattedPreferredEndDate = preferredEndDate
        .toISOString()
        .slice(0, 16);

      formRef.current.preferredEndDate.value = formattedPreferredEndDate;

      if (requestDetails.attachment) {
        const fileName = requestDetails.attachment;
        const mimeType = determineMimeType(fileName);
        setFile(new File([""], fileName, { type: mimeType }));
      }
    }

   
    
  }, [ user.id, requestDetails]);

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
       
        if (!actionData.shownToast) {
          toast.success("Request resubmitted successfully!");
          formRef.current.reset();
        }
      } else if (actionData.status === "error") {
       
        if (!actionData.shownToast) {
          toast.error("There was an error submitting the request.");
        }
      }
  
      
      if (actionData.status === "success" || actionData.status === "error") {
        actionData.shownToast = true;
      }
    }
  }, [actionData]);  
  

  return (
    <section className={classes.request}>
      <div className={classes.main}>
        <header>
          <h1>Request</h1>
          <p>
            Please fill out the required fields <span>*</span>
          </p>
        </header>
        <Form method="post" encType="multipart/form-data" ref={formRef}>
          <div className={classes.inputs}>
            <span>
              <label id="titleLabel">
                Title <span className={classes.required}>*</span>
              </label>
              <input
                type="text"
                name="title"
                className={classes.inputText}
                placeholder="e.g. Fix something."
                required
              />
            </span>
            <span>
              <label id="descriptionLabel">
                Description <span className={classes.required}>*</span>
              </label>
              <textarea
                type="text"
                name="description"
                placeholder="e.g. Clean the room."
                required
              ></textarea>
            </span>
            <span>
              <label id="technicianLabel">
                Request Type <span className={classes.required}>*</span>
              </label>
              <select
                name="request_technician"
                className={classes.inputText}
                required
              >
                <option value="Janitor">Janitor</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Masonry">Masonry</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </span>
            <span>
              <label id="locationLabel">
                Location <span className={classes.required}>*</span>
              </label>
              <input
                type="text"
                name="request_location"
                className={classes.inputText}
                placeholder="e.g. CCS Faculty Room"
                required
              />
            </span>
            <span className={classes.preferredDateTime}>
              <div>
                <label id="preferredDateTimeLabel">
                  Preferred Start Date and Time{" "}
                  <span className={classes.required}>*</span>
                </label>
                <p>
                  This may be subject to approval and scheduling by the admin.
                </p>
              </div>
              <input
                type="datetime-local"
                name="preferredStartDate"
                className={classes.inputText}
                required
              />
            </span>
            <span className={classes.preferredDateTime}>
              <div>
                <label id="preferredDateTimeLabel">
                  Preferred End Date and Time{" "}
                  <span className={classes.required}>*</span>
                </label>
                <p>
                  This may be subject to approval and scheduling by the admin.
                </p>
              </div>
              <input
                type="datetime-local"
                name="preferredEndDate"
                className={classes.inputText}
                required
              />
            </span>
            <span>
              <label id="urgencyLabel">
                Urgency Level <span className={classes.required}>*</span>
              </label>
              <select
                name="urgencyLevel"
                className={classes.inputText}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </span>
            <span>
              <label id="attachFileLabel">Attachment</label>
              <div className={classes.fileUpload}>
                <div className={classes.fileArea}>
                  {file ? (
                    <p className={classes.file} onClick={openViewer}>
                      {file.name}
                    </p>
                  ) : (
                    "No file selected."
                  )}
                </div>
                <div className={classes.imageUpload}>
                  <label htmlFor={classes.fileInput}>
                    <div>
                      <div onClick={handleImageClick}>
                        <img src={uploadIcon} alt="upload icon" />
                      </div>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    name="attachment"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </div>
                {file && (
                  <div
                    className={classes.deleteIcon}
                    onClick={handleDeleteFile}
                  >
                    <img src={deleteIcon} alt="delete icon" />
                  </div>
                )}
              </div>
            </span>
          </div>
          <div className={classes.btnArea}>
            <button type="button" id="clearBtn" className={classes.clearBtn}>
              Clear
            </button>
            <button
              type="submit"
              id="submitButton"
              className={classes.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting.." : "Submit"}
            </button>
          </div>
        </Form>
      </div>

      <ToastContainer />

      {/* Viewer Modal */}
      {file && (
        <Viewer
          visible={viewerVisible}
          onClose={closeViewer}
          images={[{ src: URL.createObjectURL(file), alt: file.name }]}
        />
      )}
    </section>
  );
};

export default ResubmitForm;

export const action = async ({ request, params }) => {
  const user_id = params.user_id;
  const request_id = params.requestId;
  const data = await request.formData();

  console.log("UserID: ", user_id);
  console.log("RequestID: ", request_id);

  const rawPreferredStartDate = data.get("preferredStartDate");
  const formattedPreferredStartDate = new Date(
    rawPreferredStartDate
  ).toISOString();
  const rawPreferredEndDate = data.get("preferredEndDate");
  const formattedPreferredEndDate = new Date(rawPreferredEndDate).toISOString();

  const currentDateTime = new Date().toISOString();

  const requestData = new FormData();
  requestData.append("request_location", data.get("request_location"));
  requestData.append("datetime", currentDateTime);
  requestData.append("preferredStartDate", formattedPreferredStartDate);
  requestData.append("preferredEndDate", formattedPreferredEndDate);
  requestData.append("title", data.get("title"));
  requestData.append("description", data.get("description"));
  requestData.append("user_id", user_id);
  requestData.append("request_technician", data.get("request_technician"));
  requestData.append("urgency_level", data.get("urgencyLevel"));
  requestData.append("attachment", data.get("attachment"));

  try {
    const response = await axios.put(
      `${LOCAL_ENV}/request/update/${request_id}`,
      requestData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status !== 200) {
      throw json({ message: "Could not create request." }, { status: 500 });
    }

    return { status: "success" };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
};
