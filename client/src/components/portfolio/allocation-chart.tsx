import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface AssetAllocationType {
  type: string;
  percentage: number;
  value: number;
}

interface AllocationChartProps {
  data: AssetAllocationType[];
  isLoading: boolean;
}

// Chart colors to match the design reference
const COLORS = ["#3B82F6", "#10B981", "#FCD34D", "#A855F7"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function AllocationChart({ data, isLoading }: AllocationChartProps) {
  if (isLoading) {
    return (
      <Card className="h-[350px]">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(item => ({
    name: item.type,
    value: item.percentage
  }));
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Asset Allocation</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                label={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, "Allocation"]}
                contentStyle={{ borderRadius: '0.375rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {data.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-700">
                  {item.type} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
