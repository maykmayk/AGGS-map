import { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import * as LucideIcons from 'lucide-react';
import { MapPin, Image as ImageIcon, Star, Phone, Type, FileText, Tag } from 'lucide-react';
import clsx from 'clsx';

mapboxgl.accessToken = 'pk.eyJ1IjoibWF5a2VhcnQiLCJhIjoiY21hdXJ6YXJ3MDA5cTJtc2FxejA1YTFvdSJ9._ftH56VCduljTMex0iHBUQ';

interface WaypointFormData {
  name: string;
  description: string;
  address: string;
  rating: number;
  contact_info: string;
  parameters: string[];
  images?: FileList;
}

export default function AddWaypoint() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [rating, setRating] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [parameters, setParameters] = useState<{ id: string; name: string; icon: string }[]>([]);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<WaypointFormData>();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedParams, setSelectedParams] = useState<string[]>([]);

  const watchImages = watch('images');

  useEffect(() => {
    if (watchImages && watchImages.length > 0) {
      const urls = Array.from(watchImages).map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    }
  }, [watchImages]);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [12.4964, 41.9028],
      zoom: 6
    });

    marker.current = new mapboxgl.Marker({
      draggable: true
    });

    map.current.on('click', (e) => {
      marker.current?.setLngLat(e.lngLat).addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  function getLucideIcon(name: string): React.ElementType {
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
  
    const iconModule = LucideIcons as unknown as Record<string, React.ElementType>;
    return iconModule[formatted];
  }
  

  useEffect(() => {
    fetchParameters();
  }, []);

  async function fetchParameters() {
    const { data, error } = await supabase
      .from('parameters')
      .select('*');

    if (error) {
      console.error('Error fetching parameters:', error);
      return;
    }

    setParameters(data);
  }

  const toggleParam = (paramName: string) => {
    setSelectedParams(prev =>
      prev.includes(paramName)
        ? prev.filter(p => p !== paramName)
        : [...prev, paramName]
    );
  };

  const onSubmit = async (data: WaypointFormData) => {
    if (!marker.current) {
      toast.error('Seleziona un punto sulla mappa');
      return;
    }
  
    const coordinates = marker.current.getLngLat();
    console.log("📍 Coordinate:", coordinates);
  
    try {
      let imageUrls: string[] = [];
  
      if (selectedImages.length > 0) {
        console.log("📸 Immagini selezionate:", selectedImages);
  
        const uploadPromises = selectedImages.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('waypoint-images')
            .upload(fileName, file);
  
          if (uploadError) {
            console.error("❌ Errore upload immagine:", uploadError);
            throw uploadError;
          }
  
          const { data: publicData } = supabase.storage
            .from('waypoint-images')
            .getPublicUrl(fileName);
  
          console.log("✅ Immagine caricata:", publicData.publicUrl);
          return publicData.publicUrl;
        });
  
        imageUrls = await Promise.all(uploadPromises);
      }
  
      const payload = {
        ...data,
        rating,
        parameters: selectedParams,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        images: imageUrls
      };
  
      console.log("📦 Payload da salvare:", payload);
  
      const { error } = await supabase.from('waypoints').insert([payload]);
  
      if (error) {
        console.error("❌ Errore Supabase insert:", error);
        throw error;
      }
  
      toast.success('Waypoint aggiunto con successo!');
    } catch (error) {
      console.error('🧨 Errore generale nel salvataggio:', error);
      toast.error('Errore durante il salvataggio');
    }
  };  

  const FormField = ({ icon: Icon, label, error, children }: any) => (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );

  return (
    <div className="h-full grid grid-rows-[1fr,1fr]">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="p-4 overflow-y-auto bg-gray-50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
          <FormField icon={Type} label="Nome" error={errors.name?.message}>
            <input
              type="text"
              {...register('name', { required: 'Campo obbligatorio' })}
              className={clsx(
                "mt-1 block w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500",
                errors.name ? "border-red-300" : "border-gray-300"
              )}
            />
          </FormField>

          <FormField icon={FileText} label="Descrizione">
            <textarea
              {...register('description')}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </FormField>

          <FormField icon={MapPin} label="Indirizzo">
            <input
              type="text"
              {...register('address')}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField icon={Star} label="Valutazione">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={clsx(
                      "w-6 h-6 transition-colors",
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    )}
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </FormField>

          <FormField icon={Phone} label="Contatti">
            <input
              type="text"
              {...register('contact_info')}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField icon={Tag} label="Parametri">
            <div className="flex flex-wrap gap-2">
              {parameters.map(param => {
                const selected = selectedParams.includes(param.name);
                const Icon = getLucideIcon(param.icon); // 👈 usa la funzione tipizzata

                return (
                  <button
                    key={param.id}
                    type="button"
                    onClick={() => toggleParam(param.name)}
                    className={clsx(
                      "flex items-center gap-1 px-3 py-1 rounded-full border text-sm transition-colors",
                      selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {param.name}
                  </button>
                );
              })}

            </div>
          </FormField>

          <FormField icon={ImageIcon} label="Immagini">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;

                const newFiles = Array.from(files);
                const newUrls = newFiles.map(file => URL.createObjectURL(file));

                setSelectedImages(prev => [...prev, ...newFiles]);
                setPreviewUrls(prev => [...prev, ...newUrls]);
              }}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {previewUrls.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        // rimuove immagine selezionata
                        setSelectedImages(prev => prev.filter((_, i) => i !== index));
                        setPreviewUrls(prev => {
                          URL.revokeObjectURL(prev[index]);
                          return prev.filter((_, i) => i !== index);
                        });
                      }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

          </FormField>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-full hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors duration-200"
          >
            Aggiungi Waypoint
          </button>
        </form>
      </div>
    </div>
  );
}