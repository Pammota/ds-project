import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Measurement = {
  measurement_id: string;
  device_id: string;
  timestamp: string;
  measurement_value: number;
};

type Props = {
  data: Measurement[];
};

export const Chart = ({ data }: Props) => {
  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="measurement_value" stroke="#8884d8" />
    </LineChart>
  );
};
