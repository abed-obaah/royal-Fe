// AlbumGrid.jsx
import React, { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import WalletUi from "./wallet";

const albums = [
  {
    id: 1,
    title: "The Death of Slim Shady",
    artist: "Eminem",
    cover: "https://picsum.photos/200?1",
    price: 12.99,
    riskRating: "Medium",
    roiRange: "15-25%",
    assetType: "Single",
    entryPoint: "$10.50",
    roiToDate: "+18.3%",
    genre: "Hip-Hop",
    popularity: 85,
  },
  {
    id: 2,
    title: "The Marshall Mathers LP",
    artist: "Eminem",
    cover: "https://picsum.photos/200?2",
    price: 14.99,
    riskRating: "Low",
    roiRange: "8-12%",
    assetType: "Single",
    entryPoint: "$13.25",
    roiToDate: "+10.5%",
    genre: "Hip-Hop",
    popularity: 92,
  },
];

const filters = {
  genre: [
    { value: "Hip-Hop", label: "Hip-Hop", checked: false },
    { value: "Greatest Hits", label: "Greatest Hits", checked: false },
  ],
  riskRating: [
    { value: "Very High", label: "Very High", checked: false },
    { value: "High", label: "High", checked: false },
    { value: "Medium", label: "Medium", checked: false },
    { value: "Low", label: "Low", checked: false },
  ],
};

const sortOptions = [
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
  { name: "ROI: Low to High", value: "roi-asc" },
  { name: "ROI: High to Low", value: "roi-desc" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AlbumGrid({ onAlbumClick }) {
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState("roi-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [albumsData, setAlbumsData] = useState(albums);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEditClick = (album) => {
    setEditingAlbum(album.id);
    setEditForm({ ...album });
  };

  const handleSaveEdit = () => {
    setAlbumsData((prev) =>
      prev.map((album) =>
        album.id === editingAlbum ? { ...editForm } : album
      )
    );
    setEditingAlbum(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingAlbum(null);
    setEditForm({});
  };

  const handleDeleteClick = (albumId) => {
    if (window.confirm("Are you sure you want to delete this album?")) {
      setAlbumsData((prev) => prev.filter((album) => album.id !== albumId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "Very High":
        return "text-red-500";
      case "High":
        return "text-orange-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-green-500";
      default:
        return "text-gray-400";
    }
  };

  const getROIColor = (roi) =>
    roi.includes("+") ? "text-green-400" : "text-red-400";

  const getFilteredAlbums = () => {
    let filtered = [...albumsData];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (album) =>
          album.title.toLowerCase().includes(query) ||
          album.artist.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "roi-asc":
        filtered.sort(
          (a, b) => parseFloat(a.roiToDate) - parseFloat(b.roiToDate)
        );
        break;
      case "roi-desc":
        filtered.sort(
          (a, b) => parseFloat(b.roiToDate) - parseFloat(a.roiToDate)
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredAlbums = getFilteredAlbums();

  return (
    <div className="min-h-screen">
      <WalletUi />

      {/* Search + Sort */}
      <div className="flex justify-between items-center mb-4 px-4">
        <input
          type="text"
          placeholder="Search albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
        />

        <Menu as="div" className="relative inline-block">
          <MenuButton className="inline-flex items-center text-sm text-gray-300">
            Sort by
            <ChevronDownIcon className="ml-1 h-5 w-5 text-gray-400" />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg">
            <div className="py-1">
              {sortOptions.map((option) => (
                <MenuItem key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => setSortBy(option.value)}
                      className={classNames(
                        option.value === sortBy
                          ? "font-medium text-white"
                          : "text-gray-400",
                        active ? "bg-gray-700" : "",
                        "block w-full px-4 py-2 text-left text-sm"
                      )}
                    >
                      {option.name}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>

      {/* Album Table */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#222629] rounded-lg">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Album
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Risk Rating
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  ROI Range
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Entry Point
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  ROI to Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Asset Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Price
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAlbums.map((album) => (
                <tr
                  key={album.id}
                  className="hover:bg-gray-700 cursor-pointer"
                  onClick={() => onAlbumClick(album)}
                >
                  <td className="py-3 px-4">
                    {editingAlbum === album.id ? (
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center">
                        <img
                          src={album.cover}
                          alt={album.title}
                          className="w-12 h-12 rounded-md object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {album.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {album.artist}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {editingAlbum === album.id ? (
                      <select
                        name="riskRating"
                        value={editForm.riskRating}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                      >
                        <option>Very High</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    ) : (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getRiskColor(
                          album.riskRating
                        )} bg-gray-700/50`}
                      >
                        {album.riskRating}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-gray-300">{album.roiRange}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {album.entryPoint}
                  </td>
                  <td
                    className={`py-3 px-4 font-medium ${getROIColor(
                      album.roiToDate
                    )}`}
                  >
                    {album.roiToDate}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{album.assetType}</td>
                  <td className="py-3 px-4 text-gray-300">${album.price}</td>

                  <td className="py-3 px-4 space-x-2">
                    {editingAlbum === album.id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit();
                          }}
                          className="text-green-400 hover:underline text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="text-gray-400 hover:underline text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(album);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(album.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAlbums.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-400 text-sm"
                  >
                    No albums found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
