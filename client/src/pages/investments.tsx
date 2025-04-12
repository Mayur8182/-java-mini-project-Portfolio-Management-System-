import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvestmentsList from "@/components/investments/investments-list";
import { INVESTMENT_TYPES } from "@shared/schema";

// Demo portfolio ID
const DEFAULT_PORTFOLIO_ID = 1;

export default function Investments() {
  const { data: investments, isLoading } = useQuery({
    queryKey: [`/api/portfolios/${DEFAULT_PORTFOLIO_ID}/investments`],
  });

  // Filter investments by type
  const getFilteredInvestments = (type: string) => {
    if (!investments) return [];
    return investments.filter(inv => inv.type === type);
  };

  // Count investments by type
  const getCounts = () => {
    if (!investments) return { all: 0, stocks: 0, bonds: 0, mutualFunds: 0 };
    
    const stocks = investments.filter(inv => inv.type === 'Stock').length;
    const bonds = investments.filter(inv => inv.type === 'Bond').length;
    const mutualFunds = investments.filter(inv => inv.type === 'Mutual Fund').length;
    
    return {
      all: investments.length,
      stocks,
      bonds,
      mutualFunds
    };
  };

  const counts = getCounts();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Investments</h1>

        <Tabs defaultValue="all">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>My Investments</CardTitle>
                <TabsList>
                  <TabsTrigger value="all">
                    All ({counts.all})
                  </TabsTrigger>
                  <TabsTrigger value="stocks">
                    Stocks ({counts.stocks})
                  </TabsTrigger>
                  <TabsTrigger value="bonds">
                    Bonds ({counts.bonds})
                  </TabsTrigger>
                  <TabsTrigger value="mutualFunds">
                    Mutual Funds ({counts.mutualFunds})
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="all" className="mt-0">
                <InvestmentsList 
                  portfolioId={DEFAULT_PORTFOLIO_ID}
                  investments={investments || []} 
                  isLoading={isLoading} 
                />
              </TabsContent>
              
              <TabsContent value="stocks" className="mt-0">
                <InvestmentsList 
                  portfolioId={DEFAULT_PORTFOLIO_ID}
                  investments={getFilteredInvestments('Stock')} 
                  isLoading={isLoading} 
                />
              </TabsContent>
              
              <TabsContent value="bonds" className="mt-0">
                <InvestmentsList 
                  portfolioId={DEFAULT_PORTFOLIO_ID}
                  investments={getFilteredInvestments('Bond')} 
                  isLoading={isLoading} 
                />
              </TabsContent>
              
              <TabsContent value="mutualFunds" className="mt-0">
                <InvestmentsList 
                  portfolioId={DEFAULT_PORTFOLIO_ID}
                  investments={getFilteredInvestments('Mutual Fund')} 
                  isLoading={isLoading} 
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
