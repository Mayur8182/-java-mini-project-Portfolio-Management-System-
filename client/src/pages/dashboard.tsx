import { useQuery } from "@tanstack/react-query";
import PortfolioSummaryCards from "@/components/portfolio/portfolio-summary";
import PerformanceChart from "@/components/portfolio/performance-chart";
import AllocationChart from "@/components/portfolio/allocation-chart";
import InvestmentsList from "@/components/investments/investments-list";
import { type PortfolioSummary } from "@shared/schema";

// Demo portfolio ID for the dashboard
const DEFAULT_PORTFOLIO_ID = 1;

export default function Dashboard() {
  // Fetch portfolio summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery<PortfolioSummary>({
    queryKey: [`/api/portfolios/${DEFAULT_PORTFOLIO_ID}/summary`],
  });
  
  // Fetch portfolio investments
  const { data: investments, isLoading: isInvestmentsLoading } = useQuery({
    queryKey: [`/api/portfolios/${DEFAULT_PORTFOLIO_ID}/investments`],
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Portfolio Dashboard</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Portfolio Summary Section */}
        <div className="py-4">
          <PortfolioSummaryCards 
            summary={summary as PortfolioSummary} 
            isLoading={isSummaryLoading} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <PerformanceChart 
              data={summary?.performanceData || []} 
              isLoading={isSummaryLoading} 
            />
          </div>

          {/* Asset Allocation Chart */}
          <div>
            <AllocationChart 
              data={summary?.assetAllocation || []} 
              isLoading={isSummaryLoading} 
            />
          </div>
        </div>

        {/* Investments List Section */}
        <div className="py-4">
          <InvestmentsList 
            portfolioId={DEFAULT_PORTFOLIO_ID}
            investments={investments || []} 
            isLoading={isInvestmentsLoading} 
          />
        </div>
      </div>
    </div>
  );
}
