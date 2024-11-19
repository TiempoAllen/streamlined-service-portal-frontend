import React, { useRef, useState, useEffect } from "react";
import classes from "./RequestPage.module.css";
import {
  Form,
  json,
  redirect,
  useRouteLoaderData,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import uploadIcon from "../../assets/upload-icon.svg";
import deleteIcon from "../../assets/delete-button.svg";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import React, { useRef, useState } from "react";
import { Form, json, redirect, useRouteLoaderData } from "react-router-dom";
import deleteIcon from "../../assets/delete-button.svg";
import uploadIcon from "../../assets/upload-icon.svg";
import FileModal from "../../components/UI/FileModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RequestPage = () => {
  const user = useRouteLoaderData("home");
  const [file, setFile] = useState(null);

  const fileInputRef = useRef();
  const formRef = useRef();
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSubmitting = navigation.state == "submitting";

  const handleDeleteFile = () => {
    setFile("");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        toast.success("Request submitted successfully!");
        formRef.current.reset();
      } else if (actionData.status === "error") {
        toast.error("There was an error submitting the request.");
      }
    }
  }, [actionData, user.id]);

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
                  Preferred Date and Time{" "}
                  <span className={classes.required}>*</span>
                </label>
                <p>
                  This may be subject to approval and scheduling by the admin.
                </p>
              </div>
              <input
                type="datetime-local"
                name="preferredDate"
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
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <p className={classes.file}>{file.name}</p>
                      </Dialog.Trigger>
                      <FileModal file={file} />
                    </Dialog.Root>
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
    </section>
  );
};

export default RequestPage;

export const action = async ({ request, params }) => {
  const user_id = params.user_id;
  const data = await request.formData();

  const rawPreferredDate = data.get("preferredDate");
  const formattedPreferredDate = new Date(rawPreferredDate).toISOString();

  const currentDateTime = new Date().toISOString();

  const requestData = new FormData();
  requestData.append("request_location", data.get("request_location"));
  requestData.append("datetime", currentDateTime);
  requestData.append("preferredDate", formattedPreferredDate);
  requestData.append("title", data.get("title"));
  requestData.append("description", data.get("description"));
  requestData.append("user_id", user_id);
  requestData.append("request_technician", data.get("request_technician"));
  requestData.append("urgency_level", data.get("urgencyLevel"));
  requestData.append("attachment", data.get("attachment"));

  try {
    const response = await axios.post(
      "https://streamlined-service-portal-backend-cswk.onrender.com/request/add",
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
