import { X, Star, Phone, MapPin, Share2, Heart } from 'lucide-react';
import { useState } from 'react';

interface WaypointDetailProps {
  waypoint: {
    id: string;
    name: string;
    description: string;
    address: string;
    rating: number;
    parameters: string[];
    contact_info: string;
    images?: string[];
  };
  onClose: () => void;
}

export default function WaypointDetail({ waypoint, onClose }: WaypointDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-2xl max-h-[90vh] overflow-y-auto mb-[64px]">
        
        {/* Image carousel */}
        <div className="relative w-full overflow-hidden mt-16">
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {waypoint.images && waypoint.images.length > 0 ? (
              waypoint.images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${waypoint.name} ${i + 1}`}
                  className="w-full h-64 object-cover flex-shrink-0 snap-center"
                />
              ))
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Header actions */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={onClose}
              className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{waypoint.name}</h1>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1">{waypoint.rating.toFixed(1)}</span>
              {waypoint.address && (
                <>
                  <span className="mx-2">•</span>
                  <span className="truncate">{waypoint.address}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 text-gray-700">
            {waypoint.description && (
              <p className="leading-relaxed text-[15px]">{waypoint.description}</p>
            )}

            {waypoint.contact_info && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <p>{waypoint.contact_info}</p>
              </div>
            )}
          </div>

          {waypoint.parameters && waypoint.parameters.length > 0 && (
            <div>
              <h2 className="font-semibold text-base mb-2">Caratteristiche</h2>
              <div className="flex flex-wrap gap-2">
                {waypoint.parameters.map((param) => (
                  <span
                    key={param}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {param}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
