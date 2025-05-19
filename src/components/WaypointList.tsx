import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Star, Phone, Search } from 'lucide-react';
import WaypointDetail from './WaypointDetail';

interface Waypoint {
  id: string;
  name: string;
  description: string;
  address: string;
  rating: number;
  parameters: string[];
  contact_info: string;
  images?: string[];
}

export default function WaypointList() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);

  useEffect(() => {
    fetchWaypoints();
  }, []);

  async function fetchWaypoints() {
    const { data, error } = await supabase
      .from('waypoints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching waypoints:', error);
      return;
    }

    setWaypoints(data);
  }

  const filteredWaypoints = waypoints.filter(waypoint =>
    waypoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    waypoint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    waypoint.parameters?.some(param => param.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full bg-gray-50 overflow-hidden flex flex-col">
      <div className="p-4 bg-white shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cerca waypoint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {filteredWaypoints.map(waypoint => (
            <div
              key={waypoint.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedWaypoint(waypoint)}
            >
              <div className="relative">
                {waypoint.images && waypoint.images.length > 0 ? (
                  <img
                    src={waypoint.images[0]}
                    alt={waypoint.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{waypoint.name}</h2>
                
                <div className="flex items-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-gray-600">{waypoint.rating}</span>
                </div>

                {waypoint.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {waypoint.description}
                  </p>
                )}

                {waypoint.parameters?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {waypoint.parameters.map(param => (
                      <span
                        key={param}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {param}
                      </span>
                    ))}
                  </div>
                )}

                {waypoint.address && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{waypoint.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedWaypoint && (
        <WaypointDetail
          waypoint={selectedWaypoint}
          onClose={() => setSelectedWaypoint(null)}
        />
      )}
    </div>
  );
}