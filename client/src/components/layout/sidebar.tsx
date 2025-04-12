import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  DollarSign, 
  BarChart3, 
  Settings, 
  TrendingUp 
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const [location] = useLocation();

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <LayoutDashboard className="h-5 w-5 mr-3" /> 
    },
    { 
      name: 'Portfolios', 
      path: '/portfolios', 
      icon: <DollarSign className="h-5 w-5 mr-3" /> 
    },
    { 
      name: 'Investments', 
      path: '/investments', 
      icon: <TrendingUp className="h-5 w-5 mr-3" /> 
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: <BarChart3 className="h-5 w-5 mr-3" /> 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5 mr-3" /> 
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold">Portfolio Manager</h1>
        </div>
        
        <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setOpen(false)}
              >
                <a
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md",
                    location === item.path
                      ? "bg-primary bg-opacity-20 text-white font-medium"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  {item.icon}
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center p-4 border-t border-gray-700">
          <div className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="User profile"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">John Adams</p>
            <p className="text-xs text-gray-400">View Profile</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
