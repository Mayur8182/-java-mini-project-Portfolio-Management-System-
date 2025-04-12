import DashboardCard from "@/components/ui/dashboard-card";
import { DollarSign, TrendingUp, LineChart, AlertCircle } from "lucide-react";
import { type PortfolioSummary } from "@shared/schema";

interface PortfolioSummaryProps {
  summary: PortfolioSummary;
  isLoading: boolean;
}

export default function PortfolioSummaryCards({ summary, isLoading }: PortfolioSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse flex items-center">
                <div className="flex-shrink-0 bg-gray-200 rounded-md h-12 w-12"></div>
                <div className="ml-5 w-full">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Format the total value as a currency string
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format the percentage value
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatRiskLevel = (riskLevel: string) => {
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Portfolio Value */}
      <DashboardCard
        title="Total Portfolio Value"
        value={formatCurrency(summary.totalValue)}
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="text-primary"
        iconBgColor="bg-primary bg-opacity-10"
      />

      {/* Daily Change */}
      <DashboardCard
        title="Daily Change"
        value={formatCurrency(summary.dailyChange)}
        icon={<TrendingUp className="h-6 w-6" />}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        trend={{
          value: formatPercent(summary.dailyChangePercent),
          direction: summary.dailyChangePercent >= 0 ? "up" : "down"
        }}
      />

      {/* YTD Return */}
      <DashboardCard
        title="YTD Return"
        value={formatPercent(summary.ytdReturn)}
        icon={<LineChart className="h-6 w-6" />}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        trend={{
          value: formatCurrency(summary.ytdReturnValue),
          direction: summary.ytdReturn >= 0 ? "up" : "down"
        }}
      />

      {/* Risk Level */}
      <DashboardCard
        title="Risk Level"
        value={formatRiskLevel(summary.riskLevel)}
        icon={<AlertCircle className="h-6 w-6" />}
        iconColor="text-yellow-500"
        iconBgColor="bg-yellow-100"
        extra={
          <div className="ml-2">
            <div className="inline-flex h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="bg-yellow-500 h-full" 
                style={{ 
                  width: summary.riskLevel === 'Low' 
                    ? '30%' 
                    : summary.riskLevel === 'Moderate' 
                      ? '60%' 
                      : '90%' 
                }}
              ></div>
            </div>
          </div>
        }
      />
    </div>
  );
}
