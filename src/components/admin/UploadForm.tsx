import React, { useState } from "react";

const UploadForm = ({ albumData, onClose }) => {
  const [type, setType] = useState(albumData?.assetType || "Single");

  const types = ["Studio", "Compilation", "Single", "Mixtape"];

  if (!albumData) return null;

  return (
    <div className="bg-[#111] text-white p-6 rounded-xl w-full max-w-3xl mx-auto space-y-6 shadow-lg mt-6 relative">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        ✕
      </button>
      
      {/* Title */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          defaultValue={albumData.title}
          className="w-full rounded-md border border-gray-700 bg-[#1b1b1b] p-3 text-white focus:outline-none focus:ring-2 focus:ring-oblue-100"
        />
      </div>

      {/* Artist */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Artist <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          defaultValue={albumData.artist}
          className="w-full rounded-md border border-gray-700 bg-[#1b1b1b] p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Cover Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">Cover</label>
        <div className="flex items-center gap-4">
          <img src={albumData.cover} alt={albumData.title} className="w-16 h-16 rounded-md object-cover" />
          <button className="px-5 py-2 bg-blue-100 hover:bg-orange-700 text-blue-700 hover:text-white font-medium rounded-md">
  Upload
</button>

        </div>
        <p className="text-xs text-gray-400">
          Storage server: <span className="font-semibold">Localhost</span> <br />
          Acceptable extensions: <span className="text-gray-200">jpg, gif, png, jpeg</span> <br />
          Acceptable file size: Min: 0.01MB. Max: 10MB <br />
          Acceptable image dimensions: Min: 100×50px. Max: 2000×1500px
        </p>
      </div>

      {/* Background Upload */}
      <div className="space-y-3">
        <p className="text-xs text-gray-400">
          Storage server: <span className="font-semibold">Localhost</span> <br />
          Acceptable extensions: <span className="text-gray-200">jpg, gif, png, jpeg</span> <br />
          Acceptable file size: Min: 0.01MB. Max: 10MB <br />
          Acceptable image dimensions: Min: 100×50px. Max: 2000×1500px
        </p>
      </div>

      {/* Type Selector */}
      <div>
        <label className="block mb-3 text-sm font-medium text-gray-300">
          Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                type === t
                  ? "bg-blue-100 text-blue-700"
                  : "bg-[#1b1b1b] text-gray-300 hover:bg-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      {/* Additional album data display */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Risk Rating</label>
          <div className="text-white">{albumData.riskRating}</div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">ROI Range</label>
          <div className="text-white">{albumData.roiRange}</div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">Entry Point</label>
          <div className="text-white">{albumData.entryPoint}</div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">ROI to Date</label>
          <div className="text-white">{albumData.roiToDate}</div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md">
          Cancel
        </button>
        <button className="px-5 py-2 bg-blue-100 hover:bg-orange-700 hover:text-white text-blue-700 font-medium rounded-md">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default UploadForm;
