import React from "react";
import { BarChart3, Wallet, Gift, LayoutGrid } from "lucide-react"; // icons
import { Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from "lucide-react";

export default function PortfolioDashboard() {
    const [showBalance, setShowBalance] = React.useState(true);
  return (
    <div className="">
      {/* Top Header */}
      <header className=" border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Portfolio</h1>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Asset Value & Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Asset Value */}
          <div className="bg-[#222629] rounded-2xl shadow p-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">N/A</span>
            </div>
            <p className="text-white mt-2">Total Portfolio Value</p>
             <div className="flex items-center space-x-3">
                       <div className="text-4xl font-bold text-white">{showBalance ? "$0" : "••••"}</div>
                       <button
                         onClick={() => setShowBalance(!showBalance)}
                         className="text-gray-600 flex items-center space-x-2"
                       >
                         {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>

            <div className="flex items-center space-x-2 mt-3">
              <span className="text-green-600 font-semibold">+0.00 (0.00%)</span>
              {/* <select className="border rounded px-2 py-1 text-sm">
                <option>24 hours</option>
                <option>7 days</option>
                <option>30 days</option>
              </select> */}
            </div>
          </div>

          {/* Allocation */}
          <div className="bg-[#222629] rounded-2xl shadow p-6">
            <h3 className="text-white font-semibold mb-4">Allocation</h3>
            <div className="flex items-center justify-center h-24 border rounded-lg text-gray-400">
              No data
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              {[
                { name: "Music", color: "text-yellow-500" },
                { name: "Art", color: "text-yellow-100" },
                { name: "Real Estate", color: "text-white" },
                { name: "Eurobond", color: "text-white" },
                { name: "Commercial Paper", color: "text-green-600" },
                { name: "Private Equity", color: "text-indigo-700" },
                { name: "Pubsplit", color: "text-white" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-gray-600"
                >
                  <span className={item.color + " font-medium"}>
                    ● {item.name}
                  </span>
                  <span>0%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Losers */}
      <div className="bg-[#222629] rounded-2xl shadow p-6 min-h-screen flex flex-col">
  <h3 className="text-white font-semibold">Top Losers</h3>
  <div className="flex-1 flex flex-col justify-center items-center text-gray-400 space-y-2">
    <img
      src="https://testapp.artsplit.com/images/empty.svg"
      alt="No data"
      className="w-60 h-60"
    />
    <span>No data</span>
  </div>
</div>

      </main>
    </div>
  );
}
