import React from 'react';
import { Tracking } from '@/types';
import { CheckCircle, Circle, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingTimelineProps {
  tracking: Tracking;
}

export function TrackingTimeline({ tracking }: TrackingTimelineProps) {
  const allLocations = [
    tracking.startLocation,
    ...tracking.stopovers,
    tracking.endLocation,
  ];

  const getLocationStatus = (index: number) => {
    if (index < tracking.currentLocationIndex) return 'completed';
    if (index === tracking.currentLocationIndex) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-orange-500" />;
      case 'current':
        return <Circle className="h-6 w-6 text-orange-500 animate-pulse-slow" />;
      default:
        return <Circle className="h-6 w-6 text-slate-300" />;
    }
  };

  const getConnectorColor = (index: number) => {
    if (index < tracking.currentLocationIndex) return 'bg-orange-500';
    if (index === tracking.currentLocationIndex) return 'bg-gradient-to-b from-orange-500 to-slate-300';
    return 'bg-slate-300';
  };

  return (
    <div className="space-y-8">
      {allLocations.map((location, index) => {
        const status = getLocationStatus(index);
        const isLast = index === allLocations.length - 1;

        return (
          <div key={location.id} className="relative">
            <div className="flex items-start space-x-4">
              {/* Timeline Icon */}
              <div className="relative flex-shrink-0">
                {getStatusIcon(status)}
                {!isLast && (
                  <div 
                    className={cn(
                      'absolute top-8 left-1/2 h-16 w-0.5 -translate-x-1/2 transition-all duration-500',
                      getConnectorColor(index)
                    )}
                  />
                )}
              </div>
              
              {/* Location Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <h4 className={cn(
                    'text-sm font-medium',
                    status === 'current' ? 'text-orange-600' : 'text-slate-900 dark:text-slate-100'
                  )}>
                    {location.name}
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {location.address}
                </p>
                {status === 'current' && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">
                      Package is currently here
                    </span>
                  </div>
                )}
                {status === 'completed' && (
                  <div className="flex items-center space-x-1 mt-2">
                    <CheckCircle className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">
                      Completed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
