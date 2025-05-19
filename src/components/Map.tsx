import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import WaypointDetail from './WaypointDetail';
import { Globe, Map as MapIcon } from 'lucide-react';


mapboxgl.accessToken = 'pk.eyJ1IjoibWF5a2VhcnQiLCJhIjoiY21hdXJ6YXJ3MDA5cTJtc2FxejA1YTFvdSJ9._ftH56VCduljTMex0iHBUQ';

interface Waypoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  parameters: string[];
  address: string;
  rating: number;
  contact_info: string;
  images?: string[];
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [, setWaypoints] = useState<Waypoint[]>([]);
  const [mapStyle, setMapStyle] = useState<'outdoors-v12' | 'satellite-streets-v12'>('outdoors-v12');
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
  
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', // default iniziale fisso
      center: [12.4964, 41.9028],
      zoom: 6
    });
  
    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
  
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
  
    // quando il nuovo stile è caricato, reinserisci i marker
    map.current.once('styledata', () => {
      fetchWaypoints(); // ⚠️ accertati che sia fuori da useEffect e non sia una funzione anonima
    });
  }, [mapStyle]);

  useEffect(() => {
    fetchWaypoints();
  }, []);

  async function fetchWaypoints() {
    const { data, error } = await supabase
      .from('waypoints')
      .select('*');

    if (error) {
      console.error('Error fetching waypoints:', error);
      return;
    }

    setWaypoints(data);

    data.forEach(waypoint => {
      if (!map.current) return;

      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
      <div class="relative w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center ring-2 ring-blue-400 hover:ring-blue-500 transition-all duration-300">
        <div class="w-5 h-5 bg-blue-500 rounded-full animate-pulse shadow-inner"></div>
      </div>`;
      
      const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="w-72 rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200">
          ${waypoint.images?.[0] ? `
            <img 
              src="${waypoint.images[0]}" 
              alt="${waypoint.name}" 
              class="w-full h-32 object-cover"
            />
          ` : ''}
          <div class="p-3">
            <h3 class="font-semibold text-base text-gray-900 mb-1 truncate">${waypoint.name}</h3>
            <p class="text-sm text-gray-600 line-clamp-2 mb-2">${waypoint.description || 'Nessuna descrizione.'}</p>
      
            ${waypoint.rating ? `
              <div class="flex items-center gap-1 text-sm text-yellow-500 font-medium mb-2">
                ★ ${waypoint.rating.toFixed(1)}
              </div>
            ` : ''}
      
            ${waypoint.parameters?.length ? `
              <div class="flex flex-wrap gap-1 mb-3">
                ${waypoint.parameters.map((param: string) =>
                  `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">${param}</span>`
                ).join('')}
              </div>
            ` : ''}
      
            <button 
              class="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
              onclick="window.showWaypointDetail('${waypoint.id}')"
            >
              Scopri di più →
            </button>
          </div>
        </div>
      `)
      

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .setPopup(popup)
        .addTo(map.current);

      marker.getElement().addEventListener('click', () => {
        map.current?.flyTo({
          center: [waypoint.longitude, waypoint.latitude],
          zoom: 14
        });
      });
    });

    // Add global function to handle "Scopri di più" clicks
    window.showWaypointDetail = (waypointId: string) => {
      const waypoint = data.find(w => w.id === waypointId);
      if (waypoint) {
        setSelectedWaypoint(waypoint);
      }
    };
  }

  return (
    <>
    <div ref={mapContainer} className="w-full h-[calc(100vh-64px)]" />
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => {
            const nextStyle = mapStyle === 'outdoors-v12' ? 'satellite-streets-v12' : 'outdoors-v12';
            setMapStyle(nextStyle);
          }}
          className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
          title="Cambia vista mappa"
        >
          {mapStyle === 'outdoors-v12' ? (
            <Globe className="w-5 h-5 text-gray-800" />
          ) : (
            <MapIcon className="w-5 h-5 text-gray-800" />
          )}
        </button>
      </div>

      {selectedWaypoint && (
        <WaypointDetail 
          waypoint={selectedWaypoint} 
          onClose={() => setSelectedWaypoint(null)} 
        />
      )}
    </>
  );
}

// Add type definition for the global function
declare global {
  interface Window {
    showWaypointDetail: (waypointId: string) => void;
  }
}