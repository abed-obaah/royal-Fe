import React from "react";

 const assets = [
    { name: "Boanerges", company: "FraCo", price: "₦NaN", change: "+0%", logo: "https://picsum.photos/40?1", type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
    { name: "Zealot Commercial Paper", company: "FraCo", price: "₦NaN", change: "+0%", logo: "https://picsum.photos/40?2", type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
    { name: "FGN Eurobond", company: "FraCo", price: "$1.0283", change: "+0%", logo: "https://picsum.photos/40?3", type: "Purchase",
    date: "2025-08-20",
    status: "Completed",},
    { name: "Dufil Commercial Paper", company: "FraCo", price: "₦1.1504", change: "+0%", logo: "https://picsum.photos/40?4", type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
    { name: "FGN Eurobond", company: "FraCo", price: "$1.0283", change: "+0%", logo: "https://picsum.photos/40?5", type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
    { name: "Template Limited Private Listing", company: "FraCo", price: "₦12.50", change: "+0%", logo: "https://picsum.photos/40?6", type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
    { name: "Trident", company: "FraCo", price: "$NaN", change: "+0%", logo: "https://picsum.photos/40?7", type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
    { name: "VFD Tech Private Listing", company: "FraCo", price: "₦340.37", change: "+0%", logo: "https://picsum.photos/40?8", type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
    { name: "DLM Capital Commercial Paper", company: "FraCo", price: "₦1.1138", change: "+0%", logo: "https://picsum.photos/40?9",type: "Purchase",
    date: "2025-08-20",
    status: "Completed", },
  ];

export default function XchangePage() {
  return (
    <div className="min-h-screen  p-6 md:p-10">
      <h2 className="text-2xl font-bold mb-6 text-white">Orders</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Asset List */}
        <div className="flex-1 bg-[#222629] rounded-2xl shadow p-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {["All","Single", "Basket"].map((btn, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  idx === 0 ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-3 text-gray-500 text-sm font-medium border-b pb-2 mb-2">
            <span>Name</span>
            <span className="text-center">Price</span>
            <span className="text-right">% change</span>
          </div>

          {/* Asset List */}
          <div className="divide-y divide-gray-700">
  {assets.map((item, idx) => (
    <div
      key={idx}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 items-center py-4 hover:bg-gray-100 rounded-md transition group gap-4"
    >
      {/* Logo + Name */}
      <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
        <img
          src={item.logo}
          alt={item.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium text-white group-hover:text-black text-sm sm:text-base">
            {item.name}
          </p>
          <p className="text-xs text-gray-400 group-hover:text-black">
            by {item.company}
          </p>
        </div>
      </div>

      {/* Type */}
      <p className="text-center text-white group-hover:text-black text-sm hidden sm:block">
        {item.type}
      </p>

      {/* Price */}
      <p className="text-center text-white group-hover:text-black text-sm">
        {item.price}
      </p>

      {/* Date */}
      <p className="text-center text-white group-hover:text-black text-sm hidden md:block">
        {item.date}
      </p>

      {/* Status */}
      <p
        className={`text-right font-medium text-sm ${
          item.status === "Completed"
            ? "text-green-400"
            : "text-yellow-400"
        } group-hover:text-black`}
      >
        {item.status}
      </p>
    </div>
  ))}
</div>

        </div>
      </div>
    </div>
  );
}
