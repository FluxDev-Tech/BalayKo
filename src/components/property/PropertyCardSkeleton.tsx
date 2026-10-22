import React from 'react';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#14232d] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-2xs animate-pulse">
      {/* Thumbnail Image Skeleton */}
      <div className="relative aspect-[16/10] bg-slate-200 dark:bg-slate-800 w-full overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
        
        {/* Top Badges Skeletons */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <div className="w-16 h-5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="w-12 h-5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Favorite Icon Skeleton */}
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700" />

        {/* Bottom Price Tag Skeleton */}
        <div className="absolute bottom-2.5 left-2.5 w-24 h-6 rounded-lg bg-slate-300 dark:bg-slate-700" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title & Rating */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-10 shrink-0" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
        </div>

        {/* Amenities Pills Skeleton */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-14" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-12" />
        </div>

        {/* Buttons Skeleton */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
};

export const PropertyListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <PropertyCardSkeleton key={idx} />
      ))}
    </div>
  );
};
