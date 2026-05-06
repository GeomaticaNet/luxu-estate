import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({ isOpen, onClose }) => {
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.append('q', location.trim());
    if (bedrooms > 0) params.append('beds', bedrooms.toString());
    if (bathrooms > 0) params.append('baths', bathrooms.toString());
    
    router.push(`/?${params.toString()}`);
    onClose();
  };

  const clearFilters = () => {
    setLocation('');
    setBedrooms(0);
    setBathrooms(0);
    router.push('/');
    onClose();
  };

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Main Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <main className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
          {/* Header */}
          <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Filters</h1>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <span className="material-icons">close</span>
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
            {/* Section 1: Location */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location</label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-mosque transition-colors">location_on</span>
                <input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background-light border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-mosque focus:bg-white transition-all shadow-sm" 
                  placeholder="City, neighborhood, or address" 
                  type="text" 
                />
              </div>
            </section>

            {/* Section 2: Price Range */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Range</label>
                <span className="text-sm font-medium text-mosque">$1.2M – $4.5M</span>
              </div>
              
              <div className="relative h-12 flex items-center mb-6 px-2">
                {/* Custom Fake Slider Visual */}
                <div className="absolute w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-mosque w-1/3 ml-[20%]"></div>
                </div>
                {/* Handles (Visual only for mock) */}
                <div className="absolute left-[20%] w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10"></div>
                <div className="absolute left-[53%] w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-light p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Min Price</label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">$</span>
                    <input className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none" type="text" defaultValue="1,200,000" />
                  </div>
                </div>
                <div className="bg-background-light p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Max Price</label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">$</span>
                    <input className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm outline-none" type="text" defaultValue="4,500,000" />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Property Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Property Type */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Type</label>
                <div className="relative">
                  <select className="w-full bg-background-light border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque cursor-pointer outline-none">
                    <option>Any Type</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                  </select>
                  <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              
              {/* Rooms */}
              <div className="space-y-4">
                {/* Beds */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Bedrooms</span>
                  <div className="flex items-center space-x-3 bg-background-light rounded-full p-1">
                    <button 
                      onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                      disabled={bedrooms === 0}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">{bedrooms === 0 ? 'Any' : `${bedrooms}+`}</span>
                    <button 
                      onClick={() => setBedrooms(bedrooms + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
                
                {/* Baths */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Bathrooms</span>
                  <div className="flex items-center space-x-3 bg-background-light rounded-full p-1">
                    <button 
                      onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}
                      disabled={bathrooms === 0}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">{bathrooms === 0 ? 'Any' : `${bathrooms}+`}</span>
                    <button 
                      onClick={() => setBathrooms(bathrooms + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Amenities */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Toggle Chip Active */}
                <label className="cursor-pointer group relative">
                  <input defaultChecked className="peer sr-only" type="checkbox" />
                  <div className="h-full px-4 py-3 rounded-lg border border-mosque bg-mosque/5 text-mosque font-medium text-sm flex items-center justify-center gap-2 transition-all peer-checked:bg-mosque/10 peer-checked:border-mosque peer-checked:text-mosque hover:bg-mosque/10">
                    <span className="material-icons text-lg">pool</span>
                    Swimming Pool
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                </label>
                
                {/* Toggle Chip Inactive */}
                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-gray-400 group-hover:text-gray-500 peer-checked:text-mosque">fitness_center</span>
                    Gym
                  </div>
                </label>
                
                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-gray-400 group-hover:text-gray-500 peer-checked:text-mosque">local_parking</span>
                    Parking
                  </div>
                </label>
                
                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-gray-400 group-hover:text-gray-500 peer-checked:text-mosque">ac_unit</span>
                    Air Conditioning
                  </div>
                </label>
                
                <label className="cursor-pointer group relative">
                  <input defaultChecked className="peer sr-only" type="checkbox" />
                  <div className="h-full px-4 py-3 rounded-lg border border-mosque bg-mosque/5 text-mosque font-medium text-sm flex items-center justify-center gap-2 transition-all peer-checked:bg-mosque/10 peer-checked:border-mosque peer-checked:text-mosque hover:bg-mosque/10">
                    <span className="material-icons text-lg">wifi</span>
                    High-speed Wifi
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                </label>
                
                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-gray-400 group-hover:text-gray-500 peer-checked:text-mosque">deck</span>
                    Patio / Terrace
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
            <button 
              onClick={clearFilters}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline decoration-gray-300 underline-offset-4"
            >
              Clear all filters
            </button>
            <button 
              onClick={handleSearch}
              className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95"
            >
              Show Homes
              <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </footer>
        </main>
      </div>
    </>
  );
};
