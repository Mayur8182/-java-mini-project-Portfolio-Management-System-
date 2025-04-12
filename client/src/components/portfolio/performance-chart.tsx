import { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartFilterOption {
  label: string;
  value: string;
}

interface PerformanceChartProps {
  data: { date: string; value: number }[];
  isLoading: boolean;
}

const timeFilters: ChartFilterOption[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "All", value: "All" }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  if (isLoading) {
    return (
      <Card className="h-[350px]">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded w-10"></div>
                ))}
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter data based on the selected time range
  const filteredData = () => {
    if (activeFilter === "All" || !data) return data;
    
    const now = new Date();
    let monthsToGoBack = 0;
    
    switch (activeFilter) {
      case "1M":
        monthsToGoBack = 1;
        break;
      case "3M":
        monthsToGoBack = 3;
        break;
      case "6M":
        monthsToGoBack = 6;
        break;
      case "1Y":
        monthsToGoBack = 12;
        break;
      default:
        return data;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToGoBack);
    
    // Since our data is monthly, we'll take the last X months of data
    return data.slice(-monthsToGoBack);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Portfolio Performance</h3>
          <div className="flex space-x-2">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md",
                  activeFilter === filter.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData()}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency} 
                domain={['dataMin - 5000', 'dataMax + 5000']}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Portfolio Value"]}
                contentStyle={{ borderRadius: '0.375rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
