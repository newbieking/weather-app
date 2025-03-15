function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function WeatherSkeleton() {
  return (
    <div className="space-y-12">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-6 w-36 mx-auto mt-2" />
          <Skeleton className="h-4 w-32 mx-auto mt-1" />
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3">
                <Skeleton className="h-8 w-8" />
                <div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <Skeleton className="h-5 w-28 mx-auto" />
              <div className="mt-4 flex justify-center">
                <Skeleton className="h-14 w-14 rounded-full" />
              </div>
              <div className="mt-2 text-center">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto mt-2" />
              </div>
              <div className="mt-3 flex justify-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
