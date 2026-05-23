import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import useWindowSize from "../../hooks/WindowSize";
import { getRevenuePerCategoryLastYear } from "../../services/api";

// Interface for the data entries
interface DataEntry {
  name: string;
  Gomë: number;
  Fellne: number;
  Aksesorë: number;
}

// Function to fetch data from API


const CustomTooltipLine = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#2a3f54",
          borderRadius: "8px",
          padding: "10px",
          color: "white",
          fontSize: "14px",
        }}
      >
        <p className="customToolTipLineLabel">{`${label} `}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} className="customToolTipLineText">
            {" "}
            {`${entry.name}:`} <span>{`${entry.value.toLocaleString()}€`}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, stroke, value, fill } = props;
  if (value) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        stroke={stroke}
        fill={fill}
        strokeWidth={10}
      />
    );
  }
  return null;
};

const renderCustomLegend = (value: string, entry: any) => {
  const { color } = entry;
  return (
    <span style={{ color, fontSize: "16px", marginRight: "20px" }}>
      {value}
    </span>
  );
};

const LineChartComponent: React.FC = () => {
  const [data, setData] = useState<DataEntry[]>([]);
  const { width } = useWindowSize();

  useEffect(() => {
    const fetchData = async () => {
      const result = await getRevenuePerCategoryLastYear();
      if (result) {
        // Map the fetched data to the required format for the chart
        const formattedData: DataEntry[] = result.map((item: any) => {
          const revenues = item.revenue.reduce(
            (acc: any, revenueItem: any) => {
              const category = revenueItem.category.toLowerCase();
              const amount = revenueItem.totalRevenue;
              acc[category] = (acc[category] || 0) + amount;
              return acc;
            },
            { gomë: 0, fellne: 0, aksesor: 0 }
          );

          return {
            name: item.month,
            Gomë: revenues.gomë,
            Fellne: revenues.fellne,
            Aksesorë: revenues.aksesor,
          };
        });
        setData(formattedData);
      }
    };

    fetchData();
  }, []);

  // Find data for the last month
  const lastMonthData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          content={<CustomTooltipLine />}
          cursor={width <= 768 ? false : true}
          wrapperStyle={{ visibility: width <= 768 && lastMonthData ? "visible" : "hidden" }}
          payload={
            lastMonthData
              ? [
                  { name: "Gomë", value: lastMonthData.Gomë, color: "#017EFA" },
                  { name: "Fellne", value: lastMonthData.Fellne, color: "#30D987" },
                  { name: "Aksesorë", value: lastMonthData.Aksesorë, color: "#FD1F9B" },
                ]
              : []
          }
          label={lastMonthData ? lastMonthData.name : ""}
        />
        <Line
          type="monotone"
          dataKey="Gomë"
          stroke="#017EFA"
          strokeWidth={3}
          activeDot={<CustomDot stroke={"#017EFA"} />}
        />
        <Line
          type="monotone"
          dataKey="Fellne"
          stroke="#30D987"
          strokeWidth={3}
          activeDot={<CustomDot stroke={"#30D987"} />}
        />
        <Line
          type="monotone"
          dataKey="Aksesorë"
          stroke="#FD1F9B"
          strokeWidth={3}
          activeDot={<CustomDot stroke={"#FD1F9B"} />}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;