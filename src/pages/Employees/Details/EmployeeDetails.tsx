import React, { ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import back from "../../../assets/svg/backArrow.svg";
import Dashboard from "../../../layouts/Dashboard";
import "./EmployeeDetails.scss";
import TextInput from "../../../components/TextInput/TextInput";
import BlueButton from "../../../components/BlueButton/BlueButton";
import upload from "../../../assets/svg/upload.svg";
import OutlineButton from "../../../components/OutlineButton/OutlineButton";
import ConfirmationDialog from "../../../components/ConfirmationDialog/ConfirmationDialog";
import DangerOutlineButton from "../../../components/DangerOutlineButton/DangerOutlineButton";

interface EmployeeData {
  fullName: string;
  email: string;
  password: string;
  idPunetorit: string;
  nrPersonal: string;
  phoneNumber: string;
  // File for uploads, string for existing image URL
  image: File | null | string;
}

const EmployeeDetails: React.FC = () => {
  const { id: employeeId } = useParams<{ id: string }>();

  const [employee, setEmployee] = useState<EmployeeData>({
    fullName: "",
    email: "",
    password: "",
    idPunetorit: "",
    nrPersonal: "",
    phoneNumber: "",
    image: null,
  });

  const [modifiedData, setModifiedData] = useState<EmployeeData>({
    fullName: "",
    email: "",
    password: "",
    idPunetorit: "",
    nrPersonal: "",
    phoneNumber: "",
    image: null,
  });

  // Local preview for newly uploaded file
  const [imagePreview, setImagePreview] = useState<string>("");

  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const token = localStorage.getItem("token");

  // Helper to normalize API user data into EmployeeData
  const normalizeEmployee = (data: any): EmployeeData => {
    return {
      fullName: data.specialFields?.fullName || "",
      email: data.email || "",
      password: "", // never prefill from backend
      idPunetorit: data.specialFields?.idPunetorit || "",
      nrPersonal: data.specialFields?.nrPersonal || "",
      phoneNumber: data.specialFields?.phoneNumber || "",
      image: data.Image && data.Image.length > 0 ? data.Image[0].url : null,
    };
  };

  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `https://gomisteria-api.onrender.com/api/users/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        const normalized = normalizeEmployee(data);

        setEmployee(normalized);
        setModifiedData(normalized);
      } catch (error) {
        console.error("Error fetching employee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId, token]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let { name, value } = event.target;

    if (name.startsWith("no-autofill-")) {
      name = name.replace("no-autofill-", "");
    }

    setModifiedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      // Revoke old preview if exists
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      const previewUrl = URL.createObjectURL(file);

      setModifiedData((prevState) => ({
        ...prevState,
        image: file,
      }));

      setImagePreview(previewUrl);
    }
  };

  // Cleanup preview URL on unmount / change
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Save
  const handleUpdate = async () => {
    if (!employeeId) return;


    const hasNewFile =
      !!modifiedData.image && modifiedData.image instanceof File;

    const specialFields = {
      idPunetorit: modifiedData.idPunetorit,
      nrPersonal: modifiedData.nrPersonal,
      fullName: modifiedData.fullName,
      phoneNumber: modifiedData.phoneNumber,
    };

    let payload: FormData | any;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (hasNewFile) {
      // ---- multipart/form-data branch (with file) ----
      const formData = new FormData();
      formData.append("email", modifiedData.email);

      if (modifiedData.password) {
        formData.append("password", modifiedData.password);
      }

      formData.append("specialFields", JSON.stringify(specialFields));

      formData.append("image", modifiedData.image as File); // safe due to hasNewFile

      payload = formData;

      // Do NOT set Content-Type; axios/browser will set the correct boundary.
      console.log("Sending multipart/form-data (with file)");
      formData.forEach((value, key) => {
        console.log("FormData entry:", key, value);
      });
    } else {
      // ---- application/json branch (no file) ----
      payload = {
        email: modifiedData.email,
        specialFields,
      };

      if (modifiedData.password) {
        payload.password = modifiedData.password;
      }

      headers["Content-Type"] = "application/json";
      console.log("Sending JSON payload:", payload);
    }

    try {
      const response = await axios.put(
        `https://gomisteria-api.onrender.com/api/users/${employeeId}`,
        payload,
        { headers }
      );

      console.log("Update response:", response.status, response.data);

      // If backend returns updated user, re-normalize
      const updated = normalizeEmployee(response.data);

      setEmployee(updated);
      setModifiedData(updated);

      // Clear preview since we now rely on backend image again
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview("");
      }

      window.alert("Employee updated successfully!");
      window.location.href = "/employees";
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error updating employee:",
          error.response?.status,
          error.response?.data
        );
      } else {
        console.error("Error updating employee:", error);
      }
    }
  };

  // Cancel → revert to last saved + clear preview
  const handleCancel = () => {
    setModifiedData(employee);
    window.location.href = "/employees";
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview("");
    }
  };

  const handleDelete = () => {
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (!employeeId) return;

    try {
      await axios.delete(
        `https://gomisteria-api.onrender.com/api/users/employees/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.href = "/employees";
    } catch (error) {
      console.error("Error deleting employee:", error);
    }

    setShowDialog(false);
  };

  const cancelDelete = () => {
    setShowDialog(false);
  };

  return (
    <Dashboard pageTitle={"Employees"}>
      <div className="employee-details">
        <a href="/employees">
          <img src={back} alt="back" />
        </a>

        <div className="createHeader">
          <h2 className="createHeaderText">Perditeso Punëtorin</h2>
        </div>

        {loading ? (
          <p>Loading employee data...</p>
        ) : (
          <form className="punetorEditForm">
            <div className="punetorInputs">
              <div className="information">
                <TextInput
                  label="ID e Punëtorit:"
                  name="idPunetorit"
                  value={modifiedData.idPunetorit}
                  handleChange={handleChange}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Email:"
                  name="email"
                  value={modifiedData.email}
                  handleChange={handleChange}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Emri i Punëtorit:"
                  name="fullName"
                  value={modifiedData.fullName}
                  handleChange={handleChange}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Password:"
                  name="password"
                  value={modifiedData.password}
                  handleChange={handleChange}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Numri Telefonit:"
                  name="phoneNumber"
                  value={modifiedData.phoneNumber}
                  handleChange={handleChange}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Numri Personal:"
                  name="nrPersonal"
                  value={modifiedData.nrPersonal}
                  handleChange={handleChange}
                />
              </div>

              {/* Current saved image from backend (Image[0].url) */}
              {typeof employee.image === "string" && employee.image && (
                <div className="information">
                  <div className="uploaded-preview">
                    <img
                      src={employee.image}
                      alt={employee.fullName}
                      className="uploaded-preview"
                    />
                  </div>
                </div>
              )}

              {employee.image === null && (
                <div className="information">
                  <div className="fileInputContainer">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <label htmlFor="image" className="customFileInput">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt={modifiedData.fullName || "Preview"}
                          className="uploaded-preview"
                        />
                      ) : (
                        <>
                          <p>Ngarko Imazhin</p>
                          <img
                            src={upload}
                            alt=""
                            className="customFileInputImage"
                          />
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="actionButtons">
              <BlueButton
                className="saveButton"
                type="button"
                onClick={handleUpdate}
              >
                Save
              </BlueButton>
              <OutlineButton type="button" onClick={handleCancel}>
                Cancel
              </OutlineButton>
              <DangerOutlineButton type="button" onClick={handleDelete}>
                Delete
              </DangerOutlineButton>
            </div>
          </form>
        )}

        {showDialog && (
          <ConfirmationDialog
            message="Do you want to delete this employee?"
            employeeTitle={employee.fullName}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </Dashboard>
  );
};

export default EmployeeDetails;
