import React, { useState } from "react";
import classes from "./Technician.module.css";
import SelectArea from "../../components/UI/SelectArea";
import { getAuthToken } from "../../util/auth";
import axios from "axios";
import { Outlet, useNavigate, useRouteLoaderData } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { LOCAL_ENV } from "../../util/auth";
import PersonnelProfile from "./PersonnelProfile";
import * as Dialog from "@radix-ui/react-dialog";

const Technician = () => {
  const data = useRouteLoaderData("technician");
  const technicians = data.technicians;

  const navigate = useNavigate();

  const handleScheduleClick = (tech_id, requests) => {
    navigate("schedule", { state: { requests } });
  };

  const [colDefs, setColDefs] = useState([
    { field: "Technician ID", flex: 1 },
    { field: "Name", flex: 1 },
    { field: "Phone Number", flex: 1 },
    { field: "Gender", flex: 1 },
    { field: "Availability", flex: 1 },
    { field: "Status", flex: 1 },
    {
      field: "Action",
      flex: 1,
      cellRenderer: (params) => {
        const technician = technicians.find(
          (t) => t.tech_id === params.data["Technician ID"]
        );

        if (!technician) {
          return <span>No Technician Found</span>;
        }

        return (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <p className={classes.viewBtn}>View</p>
            </Dialog.Trigger>
            <PersonnelProfile
              requests={technician.requests} // Pass the requests correctly
            />
          </Dialog.Root>
        );
      },
    },
  ]);

  const transformedTechnicians = technicians.map((technician) => {
    return {
      "Technician ID": technician.tech_id,
      Name: technician.tech_name,
      "Phone Number": technician.tech_phone,
      Gender: technician.tech_gender,
      Classification: technician.tech_classification,
      Availability: technician.isavailable,
      Status: technician.tech_status,
    };
  });

  return (
    <section className={classes.technician}>
      <SelectArea header="Technicians" />
      <div className={classes.mainContent}>
        <div
          className="ag-theme-quartz"
          style={{ height: "100%", width: "100%", marginTop: "1rem" }}
        >
          <AgGridReact
            rowData={transformedTechnicians}
            columnDefs={colDefs}
            domLayout="autoHeight"
          />
        </div>
        <Outlet />
      </div>
    </section>
  );
};

export default Technician;

export const loader = async ({ params }) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(
      `${LOCAL_ENV}/technician/getAllTechnician`,
      {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      }
    );

    const technicians = response.data;
    console.log(technicians);

    return { technicians };
  } catch (error) {
    throw new Error(`Error fetching technicians: ${error.message}`);
  }
};
