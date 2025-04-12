import { useQuery } from "@tanstack/react-query";
import React from "react";
import PortfolioSummaryCards from "@/components/portfolio/portfolio-summary";
import InvestmentsList from "@/components/investments/investments-list";
import AnimatedPerformanceChart from "@/components/charts/AnimatedPerformanceChart";
import AnimatedAllocationChart from "@/components/charts/AnimatedAllocationChart";
import AnimatedComparisonChart from "@/components/charts/AnimatedComparisonChart";
import { motion } from "framer-motion";
import { useStaggeredAnimation } from "@/hooks/use-animated-data";
import { type PortfolioSummary, type InvestmentWithPerformance } from "@shared/schema";

// Demo portfolio ID for the dashboard
const DEFAULT_PORTFOLIO_ID = 1;

// Animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export default function Dashboard() {
  // Fetch portfolio summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery<PortfolioSummary>({
    queryKey: [`/api/portfolios/${DEFAULT_PORTFOLIO_ID}/summary`],
  });
  
  // Fetch portfolio investments
  const { data: investments, isLoading: isInvestmentsLoading } = useQuery<InvestmentWithPerformance[]>({
    queryKey: [`/api/portfolios/${DEFAULT_PORTFOLIO_ID}/investments`],
  });

  // Prepare comparison data for top investments
  const comparisonSeries = React.useMemo(() => {
    if (!investments || investments.length === 0) return [];

    // Get top 5 investments by value
    const topInvestments = [...investments]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Create a comparison series for each investment
    // In a real app, you would fetch historical data for each investment
    return topInvestments.map((investment, index) => {
      const colorPalette = [
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Purple
      ];

      // Generate some simulated performance data for the demo
      // In a real app, this would come from an API
      const today = new Date();
      const data = Array.from({ length: 90 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (90 - i));
        
        // Create some variety in the trends
        const baseValue = investment.purchasePrice;
        const trendFactor = Math.sin(i / 15) * (0.1 + index * 0.02) + 1;
        const dayValue = baseValue * trendFactor * (1 + (i / 200));
        
        return {
          date: date.toISOString().split('T')[0],
          value: dayValue
        };
      });

      return {
        id: investment.id.toString(),
        name: investment.name,
        color: colorPalette[index % colorPalette.length],
        data
      };
    });
  }, [investments]);

  // Staggered animation for sections
  const sections = ['summary', 'performance', 'allocation', 'comparison', 'investments'];
  const visibleSections = useStaggeredAnimation(sections, { delay: 300, staggerDelay: 150 });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.h1 
          className="text-2xl font-semibold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Portfolio Dashboard
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Portfolio Summary Section */}
          <motion.div 
            className="py-4"
            variants={itemVariants}
            initial="hidden"
            animate={visibleSections[0] ? "visible" : "hidden"}
          >
            <PortfolioSummaryCards 
              summary={summary as PortfolioSummary} 
              isLoading={isSummaryLoading} 
            />
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4">
            {/* Performance Chart */}
            <motion.div 
              className="lg:col-span-2"
              variants={itemVariants}
              initial="hidden"
              animate={visibleSections[1] ? "visible" : "hidden"}
            >
              <AnimatedPerformanceChart 
                data={summary?.performanceData || []} 
                isLoading={isSummaryLoading} 
                title="Portfolio Performance"
                description="View your portfolio's performance over time"
              />
            </motion.div>

            {/* Asset Allocation Chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={visibleSections[2] ? "visible" : "hidden"}
            >
              <AnimatedAllocationChart 
                data={summary?.assetAllocation || []} 
                isLoading={isSummaryLoading} 
                title="Asset Allocation"
                description="Distribution of your investments by type"
              />
            </motion.div>
          </div>

          {/* Comparison Chart Section */}
          <motion.div 
            className="py-4"
            variants={itemVariants}
            initial="hidden"
            animate={visibleSections[3] ? "visible" : "hidden"}
          >
            <AnimatedComparisonChart
              series={comparisonSeries}
              isLoading={isInvestmentsLoading}
              title="Investment Comparison"
              description="Compare the performance of your top investments"
            />
          </motion.div>

          {/* Investments List Section */}
          <motion.div 
            className="py-4"
            variants={itemVariants}
            initial="hidden"
            animate={visibleSections[4] ? "visible" : "hidden"}
          >
            <InvestmentsList 
              portfolioId={DEFAULT_PORTFOLIO_ID}
              investments={investments || []} 
              isLoading={isInvestmentsLoading} 
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
