
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { type Portfolio } from "@shared/schema";
import AddInvestmentDialog from "@/components/investments/add-investment-dialog";
import { useState } from "react";
import PortfolioSummaryCards from "@/components/portfolio/portfolio-summary";
import InvestmentsList from "@/components/investments/investments-list";

export default function Portfolios() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [showAddInvestment, setShowAddInvestment] = useState(false);

  const { data: portfolios, isLoading } = useQuery<Portfolio[]>({
    queryKey: ['/api/portfolios'],
  });

  const { data: portfolioSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: [`/api/portfolios/${selectedPortfolio}/summary`],
    enabled: !!selectedPortfolio,
  });

  const { data: investments, isLoading: isInvestmentsLoading } = useQuery({
    queryKey: [`/api/portfolios/${selectedPortfolio}/investments`],
    enabled: !!selectedPortfolio,
  });

  const handleAddInvestment = async (values: any) => {
    try {
      const response = await fetch(`/api/portfolios/${selectedPortfolio}/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add investment');
      }
      
      setShowAddInvestment(false);
    } catch (error) {
      console.error("Failed to add investment:", error);
    }
  };

  if (selectedPortfolio && portfolioSummary) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Portfolio Details</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedPortfolio(null)}>
                Back to Portfolios
              </Button>
              <Button onClick={() => setShowAddInvestment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Investment
              </Button>
            </div>
          </div>

          <PortfolioSummaryCards summary={portfolioSummary} isLoading={isSummaryLoading} />
          
          <div className="mt-6">
            <InvestmentsList 
              portfolioId={selectedPortfolio} 
              investments={investments || []} 
              isLoading={isInvestmentsLoading} 
            />
          </div>

          <AddInvestmentDialog 
            open={showAddInvestment} 
            onOpenChange={setShowAddInvestment}
            onSubmit={handleAddInvestment}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Portfolios</h1>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-white rounded-lg shadow"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Portfolios</h1>
          <Button onClick={async () => {
            try {
              const response = await fetch('/api/portfolios', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: "New Investment Portfolio",
                  userId: 1,
                  riskLevel: "Moderate"
                })
              });
              
              if (response.ok) {
                window.location.reload();
              }
            } catch (error) {
              console.error("Failed to create portfolio:", error);
            }
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Portfolio
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios && portfolios.length > 0 ? (
            portfolios.map((portfolio) => (
              <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{portfolio.name}</CardTitle>
                  <CardDescription>
                    Risk Level: {portfolio.riskLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(portfolio.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedPortfolio(portfolio.id)}
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center bg-white rounded-lg shadow p-8">
              <p className="text-gray-500 mb-4">You don't have any portfolios yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Portfolio
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
