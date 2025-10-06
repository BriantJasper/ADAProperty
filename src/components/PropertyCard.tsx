// src/components/PropertyCard.tsx

import React from "react";
// Adding more icons for the new fields
import {
  IoLocationOutline,
  IoBedOutline,
  IoWaterOutline,
  IoSquareOutline,
  IoArrowForward,
  IoMapOutline, // Icon for Land Area
  IoCarSportOutline, // Icon for Garage
} from "react-icons/io5";

// Define the updated types for the component's props
interface PropertyCardProps {
  type: string;
  status: string;
  price: string;
  landArea: string;
  buildingArea: string;
  bedrooms: number;
  bathrooms: number;
  garage: boolean;
  location: string;
  colorType: string; // e.g., "bg-green-600"
  colorStatus: string; // e.g., "bg-blue-800"
  imageUrl: string; // Added for the image
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  type,
  status,
  price,
  landArea,
  buildingArea,
  bedrooms,
  bathrooms,
  garage,
  location,
  colorType,
  colorStatus,
  imageUrl,
}) => {
  return (
    <div className="max-w-sm overflow-hidden rounded-lg bg-white shadow-lg font-sans">
      <div className="relative">
        {/* Property Image */}
        <img
          className="h-56 w-full object-cover"
          src={imageUrl}
          alt={`Image of ${type} in ${location}`}
        />

        {/* Status Tag (e.g., Dijual) */}
        <div
          className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${colorStatus}`}
        >
          {status}
        </div>

        {/* Type Tag (e.g., Rumah) */}
        <div
          className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${colorType}`}
        >
          {type}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Price */}
        <h3 className="text-2xl font-bold text-gray-900">{price}</h3>

        {/* Location */}
        <div className="mt-1 mb-4 flex items-center text-sm text-gray-600">
          <IoLocationOutline />
          <span className="ml-1">{location}</span>
        </div>

        {/* Property Details (Beds, Baths, Area) */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-700">
          <div
            className="flex items-center gap-x-1.5"
            title="Kamar Tidur (Bedrooms)"
          >
            <IoBedOutline size={18} />
            <span>{bedrooms}</span>
          </div>
          <div
            className="flex items-center gap-x-1.5"
            title="Kamar Mandi (Bathrooms)"
          >
            <IoWaterOutline size={18} />
            <span>{bathrooms}</span>
          </div>
          <div
            className="flex items-center gap-x-1.5"
            title="Luas Bangunan (Building Area)"
          >
            <IoSquareOutline size={18} />
            <span>{buildingArea}</span>
          </div>
          <div
            className="flex items-center gap-x-1.5"
            title="Luas Tanah (Land Area)"
          >
            <IoMapOutline size={18} />
            <span>{landArea}</span>
          </div>
          {/* Conditionally render Garage info */}
          {garage && (
            <div
              className="flex items-center gap-x-1.5"
              title="Garasi (Garage)"
            >
              <IoCarSportOutline size={18} />
              <span>Ada</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6 text-right">
          <button className="inline-flex items-center gap-x-2 rounded-lg bg-green-900 px-4 py-2 text-white transition-colors hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50">
            Lihat Detail
            <IoArrowForward />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
