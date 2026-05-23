import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Text,
} from "recharts";
import { getOrdersByCountry, getUsersWithOrders } from "../../services/api";

// Interface for the data entries
interface DataEntry {
  name: string;
  value: number;
  color: string;
}

// Props for the centered label
interface CenteredLabelProps {
  cx: number;
  cy: number;
  text: string;
}

// CenteredLabel component
const CenteredLabel: React.FC<CenteredLabelProps> = ({ cx, cy, text }) => {
  return (
    <Text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      {text}
    </Text>
  );
};

// Custom legend formatter to include values
const renderLegendText = (value: string, entry: any) =>
  `${value} (${entry.payload.value.toFixed(2)}%)`;

const PieChartComponent: React.FC = () => {
  const [data, setData] = useState<DataEntry[]>([]);
  const [centerText, setCenterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const ordersByCountry = await getOrdersByCountry();
      const clients = await getUsersWithOrders();

      if (ordersByCountry && clients) {
        const totalUsers = clients;

        const formattedData: DataEntry[] = ordersByCountry.map(
          (item: any, index: number) => {
            let color = "#B1E3FF"; // Default color
            switch (index) {
              case 0:
                color = "#017EFA";
                break;
              case 1:
                color = "#51CBFF";
                break;
              case 2:
                color = "#B6E9FF";
                break;

              default:
                break;
            }
            return {
              name: item.country,
              value: item.percentage,
              color: color,
            };
          }
        );

        setData(formattedData);
        setCenterText(`${totalUsers} klient`);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={80}
          labelLine={false}
          fill="#8884d8"
          label={({ cx, cy }) => (
            <CenteredLabel cx={cx} cy={cy} text={centerText} />
          )}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend iconType="circle" formatter={renderLegendText} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
