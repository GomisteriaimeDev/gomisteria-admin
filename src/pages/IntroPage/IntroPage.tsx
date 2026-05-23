import React from "react";
import "./IntroPage.scss";
import logo from "../../assets/svg/Logo.svg";
import BlueButton from "../../components/BlueButton/BlueButton";
import OutlineButton from "../../components/OutlineButton/OutlineButton";
const IntroPage = () => {

  return (
    <div className="intro">
      <div className="intro-left">
        <div className="intro-left-title">
          <span>Platformë dixhitale</span> për blerjen e gomave, rimave dhe
          aksesorëve.
        </div>
        <div className="intro-cards">
          <div className="intro-card">
            <div className="intro-card-small-text">
              Ec me kohen, lehtësoja vetes, digjitalizohu
            </div>
            <div className="intro-card-big-text">Gomister!</div>
          </div>
          <div className="intro-card">
            <div className="intro-card-small-text">
              Mos e prish gjumin, unë kujdesem për ty
            </div>
            <div className="intro-card-big-text">Rent a Car</div>
          </div>
          <div className="intro-card">
            <div className="intro-card-small-text">
              Mos rri në rrugë tu prit, unë të gjej klient ty
            </div>
            <div className="intro-card-big-text">Taxi</div>
          </div>
          <div className="intro-card">
            <div className="intro-card-small-text">
              3 shtete në dispozicion për ty
            </div>
            <div className="intro-card-big-text">Karrotrec</div>
          </div>
        </div>
      </div>
      <div className="intro-right">
        <img src={logo} alt="gomisteriaLogo" className="intro-logo" />
        <div className="intro-buttons">
          <a href="/login">
            <BlueButton>Kyçu</BlueButton>
          </a>
          <a href="/register/select">
            <OutlineButton>Krijo një llogari</OutlineButton>
          </a>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
