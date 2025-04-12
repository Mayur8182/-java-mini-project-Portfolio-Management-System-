import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import { type PortfolioSummary } from "@shared/schema";

// Demo portfolio ID
const DEFAULT_PORTFOLIO_ID = 1;

// Chart colors
const COLORS = ["#3B82F6", "#10B981", "#FCD34D", "#A855F7", "#EC4899"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function Analytics() {
  const { data: summary, isLoading } = useQuery<PortfolioSummary>({
    queryKey: [`/api/portfolios/${DEFAULT_PORTFOLIO_ID}/summary`],
  });

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>
          <div className="animate-pulse">
            <div className="bg-white p-6 rounded-lg shadow mb-6 h-80"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow h-64"></div>
              <div className="bg-white p-6 rounded-lg shadow h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for sector allocation pie chart
  const sectorData = [
    { name: 'Technology', value: 42 },
    { name: 'Healthcare', value: 18 },
    { name: 'Financials', value: 15 },
    { name: 'Consumer', value: 12 },
    { name: 'Energy', value: 8 },
    { name: 'Other', value: 5 }
  ];

  // Prepare data for monthly returns bar chart
  const monthlyReturnsData = [
    { month: 'Jan', return: 2.4 },
    { month: 'Feb', return: -1.8 },
    { month: 'Mar', return: 3.2 },
    { month: 'Apr', return: 1.5 },
    { month: 'May', return: 4.1 },
    { month: 'Jun', return: 2.7 },
    { month: 'Jul', return: 1.9 },
    { month: 'Aug', return: -0.8 },
    { month: 'Sep', return: 3.4 },
    { month: 'Oct', return: 2.1 },
    { month: 'Nov', return: 5.2 },
    { month: 'Dec', return: 1.6 }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>

        <Tabs defaultValue="performance">
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Portfolio Analysis</CardTitle>
                <TabsList>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="allocation">Allocation</TabsTrigger>
                  <TabsTrigger value="returns">Returns</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={summary?.performanceData}
                      margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <YAxis 
                        tickFormatter={formatCurrency}
                        axisLine={false} 
                        tickLine={false}
                      />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Portfolio Value']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Allocation Tab */}
              <TabsContent value="allocation" className="mt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary?.assetAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        dataKey="value"
                        nameKey="type"
                        label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                      >
                        {summary?.assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), 'Value']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Returns Tab */}
              <TabsContent value="returns" className="mt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyReturnsData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis 
                        tickFormatter={(value) => `${value}%`}
                        axisLine={false} 
                        tickLine={false}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Monthly Return']} />
                      <Bar 
                        dataKey="return" 
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sector Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Volatility', value: 12.4 },
                      { name: 'Sharpe Ratio', value: 1.8 },
                      { name: 'Beta', value: 0.92 },
                      { name: 'Alpha', value: 4.2 },
                      { name: 'Drawdown', value: 8.3 }
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
