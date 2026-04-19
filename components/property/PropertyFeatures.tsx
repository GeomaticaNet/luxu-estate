import { Property } from "@/interfaces/property";

interface Props {
  property: Property;
}

export const PropertyFeatures = ({ property }: Props) => {
  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
        <h2 className="text-lg font-semibold mb-6 text-nordic">Property Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
            <span className="text-xl font-bold text-nordic">{property.area}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">Square Meters</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">bed</span>
            <span className="text-xl font-bold text-nordic">{property.bedrooms}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">Bedrooms</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">shower</span>
            <span className="text-xl font-bold text-nordic">{property.bathrooms}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">Bathrooms</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
            <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
            <span className="text-xl font-bold text-nordic">{property.garages || 2}</span>
            <span className="text-xs uppercase tracking-wider text-nordic/50">Garage</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
        <h2 className="text-lg font-semibold mb-4 text-nordic">About this home</h2>
        <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed whitespace-pre-line">
          <p className="mb-4">
            {property.description || "No description provided."}
          </p>
        </div>
        {/*
        <button className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
          Read more
          <span className="material-icons text-sm">arrow_forward</span>
        </button>
        */}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
        <h2 className="text-lg font-semibold mb-6 text-nordic">Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          {(property.amenities || []).map((amenity, index) => (
            <div key={index} className="flex items-center gap-3 text-nordic/70">
              <span className="material-icons text-mosque/60 text-sm">check_circle</span>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
