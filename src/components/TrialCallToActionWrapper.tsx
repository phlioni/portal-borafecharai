
import React from 'react';
import { TrialCallToAction } from './TrialCallToAction';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Skeleton } from './ui/skeleton';

export const TrialCallToActionWrapper = () => {
  const { loading } = useUserPermissions();

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-2 w-full max-w-sm rounded-full" />
          </div>
          <Skeleton className="h-10 w-32 ml-4" />
        </div>
      </div>
    );
  }

  return <TrialCallToAction />;
};
</TrialCallToActionWrapper>
