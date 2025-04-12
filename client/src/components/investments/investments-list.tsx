import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/ui/pagination";
import InvestmentItem from "./investment-item";
import AddInvestmentDialog from "./add-investment-dialog";
import { Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type InvestmentWithPerformance } from "@shared/schema";

interface InvestmentsListProps {
  portfolioId: number;
  investments: InvestmentWithPerformance[];
  isLoading: boolean;
}

export default function InvestmentsList({ 
  portfolioId, 
  investments, 
  isLoading 
}: InvestmentsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const itemsPerPage = 5;
  const totalItems = investments?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const currentItems = investments?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddInvestment = async (newInvestment: any) => {
    try {
      await apiRequest('POST', '/api/investments', {
        ...newInvestment,
        portfolioId
      });

      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}/investments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}/summary`] });
      
      toast({
        title: "Investment added",
        description: `${newInvestment.name} was successfully added to your portfolio.`,
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add investment:", error);
      toast({
        title: "Failed to add investment",
        description: "There was an error adding your investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvestment = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/investments/${id}`);

      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}/investments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${portfolioId}/summary`] });
      
      toast({
        title: "Investment deleted",
        description: "The investment was successfully removed from your portfolio.",
      });
    } catch (error) {
      console.error("Failed to delete investment:", error);
      toast({
        title: "Failed to delete investment",
        description: "There was an error deleting your investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Investments</h3>
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-gray-200">
            <div className="bg-gray-50 flex">
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Investment</div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Type</div>
              <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Value</div>
              <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Daily Change</div>
              <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Total Return</div>
            </div>
            <div className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex animate-pulse">
                  <div className="px-6 py-4 w-1/3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="ml-4">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 w-1/6">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="px-6 py-4 w-1/6">
                    <div className="h-4 bg-gray-200 rounded w-20 float-right"></div>
                  </div>
                  <div className="px-6 py-4 w-1/6">
                    <div className="h-4 bg-gray-200 rounded w-16 float-right"></div>
                  </div>
                  <div className="px-6 py-4 w-1/6">
                    <div className="h-4 bg-gray-200 rounded w-16 float-right"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Investments
        </h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50 flex">
            <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
              Investment
            </div>
            <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Type
            </div>
            <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Value
            </div>
            <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Daily Change
            </div>
            <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Total Return
            </div>
          </div>
          
          <div className="bg-white divide-y divide-gray-200">
            {currentItems && currentItems.length > 0 ? (
              currentItems.map(investment => (
                <InvestmentItem 
                  key={investment.id} 
                  investment={investment} 
                  onDelete={() => handleDeleteInvestment(investment.id)}
                />
              ))
            ) : (
              <div className="flex justify-center items-center py-10">
                <p className="text-gray-500">No investments found. Add your first investment using the button above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {totalItems > itemsPerPage && (
        <div className="px-4 py-3 bg-gray-50 flex justify-end sm:px-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      <AddInvestmentDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddInvestment}
      />
    </Card>
  );
}
