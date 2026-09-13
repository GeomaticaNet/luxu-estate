export default function AdminPropertiesLoading() {
  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-nordic-dark/5 rounded-lg w-64" />
            <div className="h-4 bg-nordic-dark/5 rounded-lg w-96 mt-2" />
          </div>
          <div className="h-10 bg-nordic-dark/5 rounded-lg w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-40 bg-nordic-dark/5" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-nordic-dark/5 rounded w-3/4" />
                <div className="h-4 bg-nordic-dark/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
