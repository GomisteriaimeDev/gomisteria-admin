import React, { useState } from "react";
import "./Login.scss";
import logo from "../../assets/svg/logoWhite.svg";
import FormWrapper from "../../components/Form/Form";
import FormInput from "../../components/FormInput/FormInput";
import BlueButton from "../../components/BlueButton/BlueButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ added
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ added helper (new backend error shape)
  const extractBackend = (err: any) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const code = data?.code;
    const message = data?.message;
    return { status, code, message, data };
  };

  const handleLogin = async ({ event }: any) => {
    event.preventDefault();

    // ✅ added
    setGeneralError(null);
    setFieldErrors({});

    // ✅ optional client-side required checks (keeps UX fast)
    const nextFieldErrors: { email?: string; password?: string } = {};
    if (!email) nextFieldErrors.email = "Email është i detyrueshëm.";
    if (!password) nextFieldErrors.password = "Fjalëkalimi është i detyrueshëm.";
    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    try {
      await login(email, password);
      navigate("/");
    } catch (error: any) {
      console.error("Failed to submit form:", error);

      // ✅ added: show backend error
      const { status, code, data } = extractBackend(error);

      // Backend can optionally send field errors: { errors: { email: "...", password: "..." } }
      if (status === 400 && data?.errors) {
        setFieldErrors({
          email: data.errors.email,
          password: data.errors.password,
        });
        return;
      }

      if (status === 401) {
        if (code === "AUTH_NOT_ACTIVATED") {
          setGeneralError("Llogaria duhet të aktivizohet para identifikimit.");
        } else {
          setGeneralError("Emaili ose fjalëkalimi është i pasaktë.");
        }
        return;
      }

      // fallback
      setGeneralError("Identifikimi dështoi. Ju lutemi provoni më vonë.");
    }
  };

  return (
    <div className="loginBg">
      <div className="loginWrapper">
        <img src={logo} alt="gomisteriaLogo" className="adminLoginLogo" />
        <FormWrapper onSubmit={handleLogin} title="Hyni">
          <div className="login-inputs">
            <FormInput
              placeholder="Email"
              type={"email"}
              onChange={(e: any) => setEmail(e.target.value)}
              name="email"
            />

            {/* ✅ added: field error (doesn’t require FormInput changes) */}
            {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}

            <FormInput
              placeholder="Fjalëkalimi"
              type={"password"}
              onChange={(e: any) => setPassword(e.target.value)}
              name="password"
            />

            {/* ✅ added: field error */}
            {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}

            <div className="login-checkbox">
              {" "}
              <input type={"checkbox"} />
              <label htmlFor="">Më mbaj në mend</label>
            </div>
          </div>

          {/* ✅ added: global error banner (uses your existing .error-message--global styles) */}
          {generalError && <div className="error-message--global">{generalError}</div>}

          <BlueButton type="submit">
            Hyr
            <br />
          </BlueButton>
          <a href="/forgot-password">Keni harruar fjalëkalimin tuaj?</a>
          &nbsp;
        </FormWrapper>
        <div className="login-bottom"></div>
      </div>
    </div>
  );
};

export default Login;
