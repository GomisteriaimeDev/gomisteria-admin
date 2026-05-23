import React from "react";
import rise from "../../assets/svg/ArrowRise.svg";
const StatsCard = ({ title, value, percentageChange, isIncrease }: any) => {
  const changeIcon = isIncrease ? <img src={rise} /> : "📉";
  return (
    <div className="stats-card">
      <h6>{title}</h6>
      <div className="stats-card-bottom">
        <p className="value">{value?.toLocaleString()}</p>
        <p className={`change `}>
          {percentageChange}% {changeIcon}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
