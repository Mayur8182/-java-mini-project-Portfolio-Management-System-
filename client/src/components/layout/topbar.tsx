import { Search } from "lucide-react";
import { Bell } from "lucide-react";

interface TopbarProps {
  setSidebarOpen: (open: boolean) => void;
}

const Topbar = ({ setSidebarOpen }: TopbarProps) => {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button 
        className="md:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100"
        onClick={() => setSidebarOpen(true)}
      >
        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">Search</label>
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" />
              </div>
              <input 
                id="search-field" 
                className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm" 
                placeholder="Search investments, portfolios..." 
                type="search"
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500">
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
