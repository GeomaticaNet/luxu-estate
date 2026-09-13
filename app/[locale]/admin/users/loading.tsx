export default function AdminUsersLoading() {
  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-nordic-dark/5 rounded-lg w-40" />
        <div className="h-4 bg-nordic-dark/5 rounded-lg w-72 mt-2" />
        <div className="space-y-4 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
              <div className="h-10 w-10 bg-nordic-dark/5 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-nordic-dark/5 rounded w-1/4" />
                <div className="h-3 bg-nordic-dark/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
