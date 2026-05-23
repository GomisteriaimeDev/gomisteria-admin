import React, { useState } from "react";
import "./Footer.scss";
import logo from "../../assets/svg/Logo.svg";
import newsletter from "../../assets/svg/Newsletter.svg";
const Footer = () => {
  const [email, setEmail] = useState("");

  const handleChange = (event: any) => {
    setEmail(event.target.value);
  };

  const handleSubmit = () => {
    console.log("Submitted Email:", email);
  };
  return (
    <div className="footerWrapper">
      <div className="footer-top">
        <div className="footer-logo">
          <img src={logo} alt="" />
          <div className="footer-contact-info">
            <a href="mailto:gomisteriaime@gmail.com">gomisteriaime@gmail.com</a>
            <a href="tel:123456789">(123) 456-7890</a>
          </div>
        </div>
        <div className="footer-content">
          <div className="footer-content-left">
            <h5>Kontenti</h5>
            <div className="footer-navigation">
              <a href="/">
                <p>Kushtet & Rregullat</p>
              </a>
              <a href="/privacy-policy">
                <p>Politika e privatësisë</p>
              </a>
              <a href="/about-us">
                <p>Rreth nesh</p>
              </a>
              <a href="/products">
                <p>Produktet</p>
              </a>
              <a href="/services">
                <p>Shërbimet</p>
              </a>
            </div>
          </div>
          <div className="footer-content-right">
            <div className="footer-content-right-inside">
              <h5>Lokacioni</h5>
              <p>ABC Company, 123 East, 17th Street, St. louis 10001</p>
            </div>
            <div className="footer-content-right-inside newsletter-input-container">
              <h5>News letter</h5>
              <input
                type="email"
                name="email"
                className="newsletter-input"
                placeholder="Enter your email address"
                onChange={handleChange}
                value={email}
              />

              <img
                src={newsletter}
                onClick={handleSubmit}
                className="newsletter-label"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Gomisteriaime. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
