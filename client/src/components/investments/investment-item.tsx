import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { type InvestmentWithPerformance } from "@shared/schema";
import { cn } from "@/lib/utils";

interface InvestmentItemProps {
  investment: InvestmentWithPerformance;
  onDelete: () => void;
}

export default function InvestmentItem({ investment, onDelete }: InvestmentItemProps) {
  // Format values as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage values
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  // Get badge color based on investment type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Stock':
        return 'bg-blue-100 text-blue-800';
      case 'Bond':
        return 'bg-green-100 text-green-800';
      case 'Mutual Fund':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get text color based on whether the value is positive or negative
  const getChangeTextColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="flex hover:bg-gray-50 relative">
      <div className="px-6 py-4 w-1/3">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
            {investment.symbol.substring(0, 4)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{investment.name}</div>
            <div className="text-sm text-gray-500">
              {investment.shares} shares @ {formatCurrency(Number(investment.purchasePrice))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/6">
        <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getBadgeColor(investment.type))}>
          {investment.type}
        </span>
      </div>
      <div className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium w-1/6">
        {formatCurrency(investment.value)}
      </div>
      <div className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium w-1/6">
        <span className={getChangeTextColor(investment.dailyChangePercent)}>
          {investment.dailyChangePercent >= 0 ? '+' : ''}{formatPercent(investment.dailyChangePercent)}
        </span>
      </div>
      <div className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium w-1/6">
        <span className={getChangeTextColor(investment.totalReturnPercent)}>
          {investment.totalReturnPercent >= 0 ? '+' : ''}{formatPercent(investment.totalReturnPercent)}
        </span>
      </div>
      
      {/* Actions dropdown menu */}
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex items-center text-gray-700 cursor-pointer hover:bg-gray-100">
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center text-red-600 cursor-pointer hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
