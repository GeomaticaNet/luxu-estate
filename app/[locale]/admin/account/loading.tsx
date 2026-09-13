export default function AdminAccountLoading() {
  return (
    <div className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-nordic-dark/5 rounded-lg w-48" />
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-20 w-20 bg-nordic-dark/5 rounded-full mx-auto" />
          <div className="h-5 bg-nordic-dark/5 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-nordic-dark/5 rounded w-1/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
