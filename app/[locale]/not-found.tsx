import { Link } from "@/i18n/routing";

export default function LocaleNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-light text-mosque/20 mb-6">404</div>
        <h1 className="text-3xl font-light text-nordic-dark mb-4">
          Property not found
        </h1>
        <p className="text-nordic-muted mb-8 leading-relaxed">
          This property may have been sold, delisted, or the link may be incorrect. 
          Browse our available properties to find your sanctuary.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-mosque hover:bg-mosque/90 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-mosque/20"
        >
          <span className="material-icons">search</span>
          Browse Properties
        </Link>
      </div>
    </div>
  );
}
