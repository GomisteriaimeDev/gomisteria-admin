import React, { useEffect, useState } from "react";
import "./Statistics.scss";
import Dashboard from "../../layouts/Dashboard";
import BarChartComponent from "../../components/Charts/BarChartComponent";
import PieChartComponent from "../../components/Charts/PieChartComponent";
import StatsCard from "../../components/Charts/StatsCard";
import LineChartComponent from "../../components/Charts/LineChartComponent";
import TitleDropdown from "../../components/Charts/TitleDropdown";
import { getTotalProductsSold } from "../../services/api";
import useFetchData, {
  getActiveUsers,
  getOrdersByStatus,
  getRevenuePerCategoryLastYear,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";

const Statistics = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");
  const [revenueData, setRevenueData] = useState<{
    goma: number;
    fellne: number;
    aksesor: number;
  }>({
    goma: 0,
    fellne: 0,
    aksesor: 0,
  });
  const { data: activeUsers } = useFetchData(getActiveUsers);
  const { data: orderData } = useFetchData(getOrdersByStatus, "DELIVERED");
  const { data: saleData } = useFetchData(getTotalProductsSold);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getRevenuePerCategoryLastYear();
      if (result) {
        const formattedData = result.reduce(
          (acc: any, item: any) => {
            item.revenue.forEach((revenueItem: any) => {
              if (revenueItem.category === "Gomë") {
                acc.goma += revenueItem.totalQuantity;
              } else if (revenueItem.category === "Fellne") {
                acc.fellne += revenueItem.totalQuantity;
              } else if (revenueItem.category === "Aksesorë") {
                acc.aksesor += revenueItem.totalQuantity;
              }
            });
            return acc;
          },
          { goma: 0, fellne: 0, aksesor: 0 }
        );
        setRevenueData(formattedData);
      }
    };

    fetchData();
  }, []);
useEffect(() => {
  setIsLoading(true);
}, [currentUser]);
  const handleTimeRangeChange = (value: any) => {};

  return (
    <>
      <Loader isLoading={!currentUser} />
      <Dashboard>
        <div className="dashboard">
          <div className="top">
            <div className="chart-container">
              <TitleDropdown
                className="dashboardTitle"
                title="Produktet më të blera"
                options={["Këtë vit", "Këtë muaj"]}
                onChange={handleTimeRangeChange}
              />
              <BarChartComponent />
            </div>
            <div className="chart-container">
              <TitleDropdown
                title="Lokacionet e Porosive"
                options={["Të gjitha"]}
                onChange={handleTimeRangeChange}
              />
              <PieChartComponent />
            </div>
            <div className="stats-container-cards">
              <StatsCard
                title="Produkte të shitura"
                value={saleData?.totalProductsSold}
                percentageChange={saleData?.percentageChange?.toFixed(2)}
                isIncrease
              />
              <StatsCard
                title="Shitjet"
                value={orderData?.totalOrders}
                percentageChange={orderData?.percentageChange?.toFixed(2)}
                isIncrease
              />
              <StatsCard
                title="Klienta aktivë"
                value={activeUsers?.totalActivatedUsers}
                percentageChange={activeUsers?.percentageChange?.toFixed(2)}
                isIncrease
              />
            </div>
          </div>

          <div className="chart-container-line">
            <div className="lineChartTopContainer">
              <div className="boxes">
                <div className="box">
                  <div className="tagLine">Goma</div>
                  <div className="boxNumbers">{revenueData.goma}</div>
                </div>
                <div className="box">
                  <div className="tagLine">Fellne</div>
                  <div className="boxNumbers">{revenueData.fellne}</div>
                </div>
                <div className="box">
                  <div className="tagLine">Aksesorë</div>
                  <div className="boxNumbers">{revenueData.aksesor}</div>
                </div>
              </div>
              <TitleDropdown
                title=" "
                options={["Këtë muaj", "Këtë vit"]}
                onChange={handleTimeRangeChange}
              />
            </div>
            <div className="linechart">
              <LineChartComponent />
            </div>
          </div>
        </div>
      </Dashboard>
    </>
  );
};

export default Statistics;
