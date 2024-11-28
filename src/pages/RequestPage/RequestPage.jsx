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
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import deleteIcon from "../../assets/delete-button.svg";
import uploadIcon from "../../assets/upload-icon.svg";
import FileModal from "../../components/UI/FileModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
              <label id="technicianLabel">
                Request Type <span className={classes.required}>*</span>
              </label>
              <select
                name="request_technician"
                className={classes.inputText}
                required
              >
                <option value="Buiding Maintenance">Building Maintenance</option>
                <option value="Electrical Maintenance">Electrical Maintenance</option>
                <option value="General Services">General Services</option>
              </select>
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
  requestData.append("is_opened", false);

  try {
    const response = await axios.post(`${API_URL}/request/add`, requestData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response.data);

    if (response.status !== 200) {
      throw json({ message: "Could not create request." }, { status: 500 });
    }

    return { status: "success" };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
};
