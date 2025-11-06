import React from "react";

const MovieDetailsSkeleton = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 animate-pulse">
      {/* Banner  */}
      <div className="relative rounded-2xl overflow-hidden h-64 md:h-96 mb-8 bg-gray-300 dark:bg-gray-700">
        <div className="absolute bottom-0 left-0 p-4 md:p-8">
          <div className="h-10 w-3/4 bg-gray-400 dark:bg-gray-600 rounded-lg mb-4"></div>
          <div className="h-6 w-1/2 bg-gray-400 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Poster  */}
        <div className="lg:col-span-1">
          <div className="h-[450px] w-full bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
          <div className="mt-4 h-12 w-full bg-purple-400 rounded-full"></div>
        </div>

        {/* Details & Reviews  */}
        <div className="lg:col-span-2">
          {/* Synopsis  */}
          <div className="h-8 w-1/4 bg-gray-400 dark:bg-gray-600 rounded-lg mb-4"></div>
          <div className="space-y-3 mb-8">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Details Grid  */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-1/3 bg-gray-400 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-5 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Reviews  */}
          <div className="h-8 w-1/4 bg-gray-400 dark:bg-gray-600 rounded-lg mb-6 mt-12"></div>
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/4 bg-gray-400 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsSkeleton;
