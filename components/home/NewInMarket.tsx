import { PropertyCard } from "../property/PropertyCard";
import { newInMarketProperties } from "@/data/mock-properties";

export const NewInMarket = () => {
  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
          <p className="text-nordic-muted mt-1 text-sm">Fresh opportunities added this week.</p>
        </div>
        <div className="hidden md:flex bg-white p-1 rounded-lg">
          <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">All</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">Buy</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">Rent</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {newInMarketProperties.map((property, index) => {
          // Implementing the responsive hiding classes exactly like code.html provided:
          // 5th item hidden xl:flex
          // 6th item hidden lg:flex
          let extraClassName = "";
          if (index === 4) extraClassName = "hidden xl:flex";
          if (index === 5) extraClassName = "hidden lg:flex";

          return (
            <PropertyCard 
              key={property.id} 
              property={property} 
              className={extraClassName} 
            />
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <button className="px-8 py-3 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark font-medium rounded-lg transition-all hover:shadow-md">
          Load more properties
        </button>
      </div>
    </section>
  );
};
