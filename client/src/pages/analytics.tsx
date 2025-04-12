import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useStaggeredAnimation } from "@/hooks/use-animated-data";
import AnimatedPerformanceChart from "@/components/charts/AnimatedPerformanceChart";
import AnimatedAllocationChart from "@/components/charts/AnimatedAllocationChart";
import BenchmarkComparisonChart from "@/components/charts/BenchmarkComparisonChart";
import AnimatedComparisonChart from "@/components/charts/AnimatedComparisonChart";
import { type PortfolioSummary } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, PieChart, BarChart4, LineChart } from "lucide-react";

// Demo portfolio ID
const DEFAULT_PORTFOLIO_ID = 1;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
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

// Sample benchmark data (market indices)
const generateBenchmarkData = (baseSeed: number, volatility: number, trend: number) => {
  const today = new Date();
  return Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (365 - i));
    
    // Create a value with some randomness + trend
    const dayInYear = i / 365;
    const randomWalk = Math.sin(i * baseSeed) * volatility;
    const trendComponent = trend * dayInYear;
    const value = 100 * (1 + randomWalk + trendComponent);
    
    return {
      date: date.toISOString().split('T')[0],
      value
    };
  });
};

const benchmarks = [
  {
    id: 'sp500',
    name: 'S&P 500',
    color: '#ef4444', // Red
    data: generateBenchmarkData(0.05, 0.2, 0.15) // Slight uptrend
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    color: '#8b5cf6', // Purple
    data: generateBenchmarkData(0.07, 0.25, 0.2) // Stronger uptrend with more volatility
  },
  {
    id: 'dow',
    name: 'Dow Jones',
    color: '#10b981', // Green
    data: generateBenchmarkData(0.04, 0.15, 0.12) // More stable, slower growth
  },
  {
    id: 'russell2000',
    name: 'Russell 2000',
    color: '#f59e0b', // Amber
    data: generateBenchmarkData(0.08, 0.3, 0.1) // High volatility, moderate growth
  }
];

// Performance metrics cards
interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  delta: number;
  icon: React.ReactNode;
  loading: boolean;
}

function MetricCard({ title, value, description, delta, icon, loading }: MetricCardProps) {
  const isPositive = delta >= 0;
  const formattedDelta = `${isPositive ? '+' : ''}${delta.toFixed(2)}%`;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {formattedDelta} from previous period
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  // Fetch portfolio summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery<PortfolioSummary>({
    queryKey: [`/api/portfolios/${DEFAULT_PORTFOLIO_ID}/summary`],
  });
  
  // Staggered animation for sections
  const sections = ['metrics', 'benchmark', 'performance', 'allocation'];
  const visibleSections = useStaggeredAnimation(sections, { delay: 300, staggerDelay: 200 });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.h1 
          className="text-2xl font-semibold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Portfolio Analytics
        </motion.h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Performance Metrics Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4"
            variants={itemVariants}
            initial="hidden"
            animate={visibleSections[0] ? "visible" : "hidden"}
          >
            <MetricCard
              title="Total Return"
              value={summary ? `${summary.ytdReturn.toFixed(2)}%` : "0.00%"}
              description="Year-to-date performance"
              delta={summary?.ytdReturn || 0}
              icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
              loading={isSummaryLoading}
            />
            
            <MetricCard
              title="Portfolio Value"
              value={summary ? `$${summary.totalValue.toLocaleString()}` : "$0"}
              description="Current market value"
              delta={summary?.dailyChangePercent || 0}
              icon={<LineChart className="h-6 w-6 text-blue-600" />}
              loading={isSummaryLoading}
            />
            
            <MetricCard
              title="Asset Diversity"
              value={summary?.assetAllocation.length || 0}
              description="Number of asset classes"
              delta={5.0} // Placeholder improvement in diversity
              icon={<PieChart className="h-6 w-6 text-blue-600" />}
              loading={isSummaryLoading}
            />
            
            <MetricCard
              title="Risk Level"
              value={summary?.riskLevel || "Moderate"}
              description="Based on volatility"
              delta={-2.5} // Placeholder reduction in risk
              icon={<BarChart4 className="h-6 w-6 text-blue-600" />}
              loading={isSummaryLoading}
            />
          </motion.div>
          
          {/* Benchmark Comparison Chart */}
          <motion.div 
            className="py-4"
            variants={itemVariants}
            initial="hidden"
            animate={visibleSections[1] ? "visible" : "hidden"}
          >
            <BenchmarkComparisonChart
              portfolioData={summary?.performanceData || []}
              benchmarks={benchmarks}
              isLoading={isSummaryLoading}
            />
          </motion.div>
          
          {/* Performance & Allocation Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4">
            {/* Performance Chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={visibleSections[2] ? "visible" : "hidden"}
            >
              <AnimatedPerformanceChart 
                data={summary?.performanceData || []} 
                isLoading={isSummaryLoading} 
                title="Detailed Performance"
                description="Analyze your portfolio performance trends"
              />
            </motion.div>
            
            {/* Allocation Chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={visibleSections[3] ? "visible" : "hidden"}
            >
              <AnimatedAllocationChart 
                data={summary?.assetAllocation || []} 
                isLoading={isSummaryLoading} 
                title="Asset Allocation Analysis"
                description="Analyze distribution across asset types"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
