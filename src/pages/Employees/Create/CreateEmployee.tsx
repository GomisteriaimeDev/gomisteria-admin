import React, { ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import back from "../../../assets/svg/backArrow.svg";
import Dashboard from "../../../layouts/Dashboard";
import "./CreateEmployee.scss";
import TextInput from "../../../components/TextInput/TextInput";
import BlueButton from "../../../components/BlueButton/BlueButton";
import upload from "../../../assets/svg/upload.svg";
import PasswordInput from "../../../components/PasswordInput/PasswordInput";

interface EmployeeData {
  fullName: string;
  email: string;
  password: string;
  idPunetorit: string;
  nrPersonal: string;
  phoneNumber: string;
  image: File | null;
}

const CreateEmployee = () => {
  const [modifiedData, setModifiedData] = useState<EmployeeData>({
    fullName: "",
    email: "",
    password: "",
    idPunetorit: "",
    nrPersonal: "",
    phoneNumber: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  const token = localStorage.getItem("token");

  const handleClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { email, password, image } = modifiedData;

    const dataToSend = new FormData();
    dataToSend.append("email", email);
    dataToSend.append("password", password);

    if (image) {
      dataToSend.append("image", image);
    }

    const specialFileds = {
      idPunetorit: modifiedData.idPunetorit,
      nrPersonal: modifiedData.nrPersonal,
      fullName: modifiedData.fullName,
      phoneNumber: modifiedData.phoneNumber,
    };
    dataToSend.append("specialFields", JSON.stringify(specialFileds));

    try {
      await axios.post(
        "https://gomisteria-api.onrender.com/api/users/registerEmployee",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      window.location.href = "/employees";
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

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
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      const previewUrl = URL.createObjectURL(file);

      setModifiedData((prevState) => ({ ...prevState, image: file }));
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Dashboard pageTitle={"Employees"}>
      <div className="createWrapper">
        <a href="/employees">
          <img src={back} alt="back" />
        </a>
        <div className="createHeader">
          <h2 className="createHeaderText">Shto Punëtor</h2>
        </div>

        {/* 🔒 IMPORTANT: Disable autofill at the form level and add trap fields */}
        <form
          className="punetorCreateForm"
          onSubmit={handleClient}
          autoComplete="off"
        >
          {/* AUTOFILL TRAP – Chrome will fill these instead of your real fields */}
          <input
            type="text"
            name="fake-username"
            autoComplete="username"
            style={{
              position: "absolute",
              opacity: 0,
              height: 0,
              width: 0,
              pointerEvents: "none",
            }}
            tabIndex={-1}
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="new-password"
            style={{
              position: "absolute",
              opacity: 0,
              height: 0,
              width: 0,
              pointerEvents: "none",
            }}
            tabIndex={-1}
          />

          <div className="punetorInputs">
            <div className="information">
              <TextInput
                label="ID e Punëtorit:"
                name="idPunetorit"
                value={modifiedData.idPunetorit}
                handleChange={handleChange}
                required={true}
              />
            </div>
            <div className="information">
              <TextInput
                label="Email:"
                name="email"
                value={modifiedData.email}
                handleChange={handleChange}
                required={true}
              />
            </div>
            <div className="information">
              <TextInput
                label="Emri i Punëtorit:"
                name="fullName"
                value={modifiedData.fullName}
                required={true}
                handleChange={handleChange}
              />
            </div>
            <div className="information">
              <PasswordInput
                label="Password:"
                name="password"
                value={modifiedData.password}
                handleChange={handleChange}
                required={true}
                // make sure inside PasswordInput you use:
                // autoComplete="new-password"
              />
            </div>
            <div className="information">
              <TextInput
                label="Numri Personal:"
                name="nrPersonal"
                value={modifiedData.nrPersonal}
                required={true}
                handleChange={handleChange}
              />
            </div>
            <div className="information">
              <TextInput
                label="Numri Telefonit:"
                name="phoneNumber"
                value={modifiedData.phoneNumber}
                required={true}
                handleChange={handleChange}
              />
            </div>
            <div className="information">
              <div className="fileInputContainer">
                <input
                  type="file"
                  id="images"
                  name="image"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <label htmlFor="images" className="customFileInput">
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
          </div>
          <BlueButton className="createButton" type="submit">
            Shto
          </BlueButton>
        </form>
      </div>
    </Dashboard>
  );
};

export default CreateEmployee;
