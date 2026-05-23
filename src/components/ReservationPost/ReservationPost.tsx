import React, { useEffect, useState } from "react";
import "./ReservationPost.scss";
import BlueButton from "../BlueButton/BlueButton";
import reservationTruck from "../../assets/images/reservoTruck.png";
import capitalize from "../../utils/Capitalize";

const ReservationPost = ({ data }: any) => {
  const [countdown, setCountdown] = useState("");

  const calculateTimeLeft = () => {
    const difference = +new Date(data.arrivalTime) - +new Date();
    let timeLeft = "";

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      timeLeft = `${days}ditë ${hours}orë ${minutes}minuta`;
    } else {
      timeLeft = "Arritur";
    }

    return timeLeft;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [data.arrivalTime]);
  return (
    <div className="reservation-post">
      <img src={reservationTruck} alt="" className="reservation-post-image" />
      <div className="reservation-post-content">
        <div className="post-content-header">
          <h5>{data.title}</h5>
          <div className="post-content-text">
            <p>
              Kategoria: <span>{capitalize(data.category)}</span>
            </p>
            <p>
              Koha: <span>{countdown}</span>
            </p>
          </div>
        </div>
        <a href={`/reservation/${data.id}`}>
          <BlueButton>Shiko produktet</BlueButton>
        </a>
      </div>
    </div>
  );
};

export default ReservationPost;
