import React, { useState } from "react";
import "./ForgotPassword.scss";
import logo from "../../assets/svg/Logo.svg";
import FormWrapper from "../../components/Form/Form";
import FormInput from "../../components/FormInput/FormInput";
import BlueButton from "../../components/BlueButton/BlueButton";
const ForgotPassword = () => {
  const [modifiedData, setModifiedData] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = ({ event }: any) => {
    event.preventDefault();
    const passwordsMatch =
      modifiedData.password === modifiedData.passwordConfirm;
    setPasswordError(!passwordsMatch);

    if (!passwordsMatch) {
      setError("Fjalëkalimet nuk përputhen. Ju lutemi provoni përsëri.");
      return;
    }

    setError("");
  };

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setModifiedData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setError("");
  };

  return (
    <div className="forgotPasswordWrapper">
      <img src={logo} alt="gomisteriaLogo" />
      <FormWrapper onSubmit={handleSubmit} title="Ndërroni Fjalëkalimin">
        <div className="forgotPassword-inputs">
          <FormInput
            placeholder="Fjalëkalimi i ri"
            type={"password"}
            onChange={handleChange}
            name="password"
            isError={passwordError}
          />
          <FormInput
            placeholder="Konfirmoni fjalëkalimin e ri "
            type={"password"}
            onChange={handleChange}
            name="passwordConfirm"
            isError={passwordError}
          />
        </div>
        <BlueButton type="submit">Ndërro Fjalëkalimin</BlueButton>
        {error && <p className="error-text">{error}</p>}
      </FormWrapper>

      <div className="forgotPassword-bottom">
        <p>
          Për çdo problem gjatë regjistrimit, ju lutemi kontaktoni qendrën e
          thirrjeve +383 45 522 222
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
